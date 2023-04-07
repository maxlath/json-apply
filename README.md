# json-apply
A CLI tool to transform JSON files with custom JS functions

Features:
* take the JS function to apply from a file
* the function may return async results
* preview the transformation results with the `--diff` option

[![NPM](https://nodei.co/npm/json-apply.png?stars&downloads&downloadRank)](https://npmjs.com/package/json-apply/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node](https://img.shields.io/badge/node-%3E=%20v7.6.0-brightgreen.svg)](http://nodejs.org)


## Summary

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [Install](#install)
- [How To](#how-to)
  - [Basic](#basic)
  - [Async](#async)
  - [Diff mode](#diff-mode)
  - [Use sub-function](#use-sub-function)
- [See also](#see-also)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->


## Install
```sh
npm install --global json-apply
```

## How To

### Basic
```sh
# Transform one json file at a time
json-apply some_transform_function.js some_data.json > some_data_transformed.json
# Transform many json files
json-apply -i some_transform_function.js *.json
```
where `some_transform_function.js` just needs to export a JS function. This should work both with the ESM export syntax
```js
// some_transform_function.js
export default function (doc) {
  doc.total = doc.a + doc.b
  if (doc.total % 2 === 0) {
    return doc
  } else {
    // returning null or undefined drops the entry
  }
}
```
or with the CommonJS export syntax
```js
// some_transform_function.js
module.exports = function (doc) {
  doc.total = doc.a + doc.b
  if (doc.total % 2 === 0) {
    return doc
  } else {
    // returning null or undefined drops the entry
  }
}
```

### Async
That function can also be async:
```js
import { getSomeExtraData } from './path/to/get_some_extra_data.js'

// some_async_transform_function.js
export default async function (doc) {
  doc.total = doc.a + doc.b
  if (doc.total % 2 === 0) {
    doc.extraData = await getSomeExtraData(doc)
    return doc
  } else {
    // returning null or undefined drops the entry
  }
}
```

### Diff mode
As a way to preview the results of your transformation, you can use the diff mode
```sh
json-apply some_transform_function.js some_data.json --diff
```
which will display a colored diff of each line before and after transformation.

For more readability, each line diff output is indented and on several lines.

### Use sub-function
Given a `function_collection.js` file like:
```js
// function_collection.js
export function foo (obj) {
  obj.timestamp = Date.now()
  return obj
}

export function bar (obj) {
  obj.count += obj.count
  return obj
}
```

You can use those subfunction by passing their key as an additional argument
```sh
json-apply function_collection.js#foo some_data.json
json-apply function_collection.js#bar some_data.json
```

This should also work with the CommonJS syntax:
```js
// function_collection.cjs
module.exports = {
  foo: (obj) => {
    obj.timestamp = Date.now()
    return obj
  },
  bar: (obj) => {
    obj.count += obj.count
    return obj
  }
}
```

## See also
* [jq](https://stedolan.github.io/jq/)
* [ndjson-apply](https://github.com/maxlath/ndjson-apply/)
