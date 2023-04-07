export function detectFormat (json) {
  const lines = json.split('\n')
  let indentation
  if (lines.length === 1) {
    indentation = 0
  } else {
    const firstKeyLine = lines[1]
    const [ spaces ] = firstKeyLine.match(/^\s*/)
    indentation = spaces.length
  }
  const endWithNewlineBreak = lines.at(-1) === ''
  return { indentation, endWithNewlineBreak }
}
