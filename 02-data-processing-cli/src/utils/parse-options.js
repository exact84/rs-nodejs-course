export function parseOptions(args) {
  const options = {};
  for (let i = 0; i < args.length; i += 2) {
    if (!args[i].startsWith("--")) {
      throw new Error(`Invalid option "${args[i]}"`);
    }
    const key = args[i]?.replace(/^--/, "");
    let value = args[i + 1];

    if (!key) {
      break;
    }

    if (!value) {
      value = true;
    }

    options[key] = value;
  }
  return options;
}
