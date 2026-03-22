import { randomUUID } from "node:crypto";
import type {
  CreateMessage,
  CreateResponseMessage,
  DbResponseMessage,
  DeleteMessage,
  DeleteResponseMessage,
  GetAllMessage,
  GetAllResponseMessage,
  GetByIdMessage,
  GetByIdResponseMessage,
  UpdateMessage,
  UpdateResponseMessage,
} from "../types/ipc";

function isDbResponseMessage(message: unknown): message is DbResponseMessage {
  if (typeof message !== "object" || message === null) {
    return false;
  }

  const candidate = message as Record<string, unknown>;

  return (
    typeof candidate["requestId"] === "string" &&
    typeof candidate["status"] === "number" &&
    "result" in candidate
  );
}

function sendMessage<TResponse extends DbResponseMessage>(
  message:
    | GetAllMessage
    | GetByIdMessage
    | CreateMessage
    | UpdateMessage
    | DeleteMessage,
): Promise<TResponse> {
  return new Promise<TResponse>((resolve) => {
    const handler = (incoming: unknown): void => {
      if (!isDbResponseMessage(incoming)) {
        return;
      }

      if (incoming.requestId !== message.requestId) {
        return;
      }

      process.off("message", handler);
      resolve(incoming as TResponse);
    };

    process.on("message", handler);
    process.send?.(message);
  });
}

export function sendGetAll(): Promise<GetAllResponseMessage> {
  return sendMessage<GetAllResponseMessage>({
    requestId: randomUUID(),
    action: "getAll",
  });
}

export function sendGetById(id: string): Promise<GetByIdResponseMessage> {
  return sendMessage<GetByIdResponseMessage>({
    requestId: randomUUID(),
    action: "getById",
    payload: { id },
  });
}

export function sendCreate(
  payload: CreateMessage["payload"],
): Promise<CreateResponseMessage> {
  return sendMessage<CreateResponseMessage>({
    requestId: randomUUID(),
    action: "create",
    payload,
  });
}

export function sendUpdate(
  id: string,
  data: UpdateMessage["payload"]["data"],
): Promise<UpdateResponseMessage> {
  return sendMessage<UpdateResponseMessage>({
    requestId: randomUUID(),
    action: "update",
    payload: { id, data },
  });
}

export function sendDelete(id: string): Promise<DeleteResponseMessage> {
  return sendMessage<DeleteResponseMessage>({
    requestId: randomUUID(),
    action: "delete",
    payload: { id },
  });
}
