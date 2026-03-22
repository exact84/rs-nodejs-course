import type {
  CreateProductInput,
  ProductResponse,
  UpdateProductInput,
} from "../schemas/product.schema";

export interface GetAllMessage {
  requestId: string;
  action: "getAll";
  payload?: undefined;
}

export interface GetByIdMessage {
  requestId: string;
  action: "getById";
  payload: {
    id: string;
  };
}

export interface CreateMessage {
  requestId: string;
  action: "create";
  payload: CreateProductInput;
}

export interface UpdateMessage {
  requestId: string;
  action: "update";
  payload: {
    id: string;
    data: UpdateProductInput;
  };
}

export interface DeleteMessage {
  requestId: string;
  action: "delete";
  payload: {
    id: string;
  };
}

export type DbRequestMessage =
  | GetAllMessage
  | GetByIdMessage
  | CreateMessage
  | UpdateMessage
  | DeleteMessage;

export interface GetAllResponseMessage {
  requestId: string;
  status: 200;
  result: ProductResponse[];
}

export type GetByIdResponseMessage =
  | {
      requestId: string;
      status: 200;
      result: ProductResponse;
    }
  | {
      requestId: string;
      status: 404 | 500;
      result: {
        message: string;
      };
    };

export interface CreateResponseMessage {
  requestId: string;
  status: 201;
  result: ProductResponse;
}

export type UpdateResponseMessage =
  | {
      requestId: string;
      status: 200;
      result: ProductResponse;
    }
  | {
      requestId: string;
      status: 404 | 500;
      result: {
        message: string;
      };
    };

export type DeleteResponseMessage =
  | {
      requestId: string;
      status: 204;
      result: null;
    }
  | {
      requestId: string;
      status: 404 | 500;
      result: {
        message: string;
      };
    };

export type DbResponseMessage =
  | GetAllResponseMessage
  | GetByIdResponseMessage
  | CreateResponseMessage
  | UpdateResponseMessage
  | DeleteResponseMessage;
