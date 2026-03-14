export function formatStats(final) {
  return `{
  "total": ${final.total},
  "levels": ${JSON.stringify(final.levels)},
  "status": ${JSON.stringify(final.status)},
  "topPaths": [
${final.topPaths.map((p) => `    ${JSON.stringify(p)}`).join(",\n")}
  ],
  "avgResponseTimeMs": ${final.avgResponseTimeMs}
}`;
}
