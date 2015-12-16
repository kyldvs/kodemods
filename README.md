# Kodemods
Just some code mod things.

# Usage

General usage works like this:

```js
import {someCodemod} from 'kodemods';

/**
 * This is the api of a JSCodeshift transform.
 */
export default function(file, api) {
  const {jscodeshift} = api;
  const root = jscodeshift(file.source);

  /**
   * Use my codemods within your script like this:
   */
  const result = someCodemod(api, root, additionalArguments);
}

```

# API Documentation

## Overview

- [`findclasseswithsuperclass`](#findclasseswithsuperclass)
- [`findNameForDefaultImport`](#findNameForDefaultImport)

## findClassesWithSuperClass

This is a helper that will return an **array** of **node paths** to classes that
extend whatever query is given.

```js
import {findClassesWithSuperClass} from 'kodemods';

// Finds all classes that `extend Foo`
const resultFoo = findClassesWithSuperClass(api, root, {
  type: 'Identifier',
  name: 'Foo',
});

// Finds all classes that `extend bar()`
const resultBar = findClassesWithSuperClass(api, root, {
  type: 'CallExpression',
  callee: {
    type: 'Identifier',
    name: 'bar',
  },
});

// Since we have the actual Node paths we can do things with them. This will
// remove all classes that `extend bar()`
resultBar.forEach(path => path.replace());
```

## findNameForDefaultImport

This helper finds the name of the identifier that corresponds to a particular
default import or requires. This returns a **string**.

```js
import {findNameForDefaultImport} from 'kodemods';

const root = jscodeshift(`
  import bar from 'foo';
  import baz, {buz} from 'boz';
`);

findNameForDefaultImport(api, root, 'foo'); // bar
findNameForDefaultImport(api, root, 'boz'); // baz
findNameForDefaultImport(api, root, 'baz'); // undefined
```

The basic idea is that this will enable you to more safely track how something
is used after being imported. It is now easy to identify anything using
`NamespaceBaseClass` even though in code it is always just used as `BaseClass`:

```js
const BaseClass = require('NamespaceBaseClass');

class Foo extends BaseClass {
  // ...
}
```
