export function parseArgs(input) {
  const regex = /[^\s"]+|"([^"]*)"/g;
  const args = [];
  let match;

  while ((match = regex.exec(input)) !== null) {
    args.push(match[1] ? match[1] : match[0]);
  }

  return args;
}
