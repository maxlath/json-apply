export function detectIndentation (json) {
  const lines = json.split('\n')
  if (lines.length === 1) return 0
  const firstKeyLine = lines[1]
  const [ spaces ] = firstKeyLine.match(/^\s*/)
  return spaces.length
}
