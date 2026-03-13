export function parseOptions(args) {
  const options = {};
  for (let i = 0; i < args.length; i += 2) {
    if (!args[i].startsWith("--")) {
      throw new Error(`Invalid option "${args[i]}"`);
    }
    const key = args[i]?.replace(/^--/, "");
    const value = args[i + 1];

    if (!key || value === undefined) {
      throw new Error(`Invalid option or missing value for "${args[i]}"`);
    }

    options[key] = value;
  }
  return options;
}
