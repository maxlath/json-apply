#!/usr/bin/env node
import { readFile, writeFile } from 'fs/promises'
import path from 'node:path'
import { program } from 'commander'
import { detectFormat } from '../lib/utils.js'
import diff from '../lib/diff.js'

const packageJson = await readFile(new URL('../package.json', import.meta.url))
const { version, description } = JSON.parse(packageJson)

program
.description(description)
.arguments('<js-function-module> <json-files-paths...>')
.option('-d, --diff', 'Preview the changes between the input and the transformation output')
.option('-i, --in-place', 'Edit files in place')
.version(version)
// .addHelpText('after', helpText)

program.parse(process.argv)

let [ fnModulePath, ...jsonFilesPaths ] = program.args

const { diff: showDiff, inPlace } = program.opts()

function exit (errorMessage) {
  console.error(errorMessage)
  process.exit(1)
}

if (!fnModulePath) program.help()

let functionName
[ fnModulePath, functionName = 'default' ] = fnModulePath.split('#')

const resolvedPath = path.resolve(fnModulePath)
let exports
try {
  exports = await import(resolvedPath)
} catch (err) {
  if (err.code === 'ERR_MODULE_NOT_FOUND') {
    exit(`function module not found: ${fnModulePath}`)
  } else {
    throw err
  }
}

if (jsonFilesPaths.length === 0) {
  exit(`expected to get a path to at least one json file`)
}

let transformFn
transformFn = exports[functionName] || exports.default?.[functionName]
if (transformFn == null) {
  exit(`function not found: ${functionName} (found: ${Object.keys(exports)})`)
}

if (typeof transformFn !== 'function') {
  const context = { resolvedPath, exports: Object.keys(exports), rawAdditionalArgs, additionalArgs }
  exit(`transform function not found\n${JSON.stringify(context, null, 2)}`)
}

for (const jsonFilePath of jsonFilesPaths) {
  const absolutePath = path.resolve(process.cwd(), jsonFilePath)
  const json = await readFile(absolutePath, 'utf8')
  const { indentation, endWithNewlineBreak } = detectFormat(json)
  const lastCharacter = endWithNewlineBreak ? '\n' : ''
  const obj = JSON.parse(json)
  const metadata = { path: jsonFilePath, absolutePath }
  const transformedObj = await transformFn(obj, metadata)
  if (transformedObj) {
    if (showDiff) {
      process.stdout.write((diff(obj, transformedObj)) + lastCharacter)
    } else {
      const rejsonified = JSON.stringify(transformedObj, null, indentation)  + lastCharacter
      if (inPlace) {
        await writeFile(absolutePath, rejsonified)
      } else {
        process.stdout.write((rejsonified))
      }
    }
  }
}
