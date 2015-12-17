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

- [`findAPIOfClass`](#findapiofclass)
- [`findClassesWithSuperClass`](#findclasseswithsuperclass)
- [`findNameForDefaultImport`](#findnamefordefaultimport)

## findAPIOfClass

This will find the public API of a class. It returns an object with three
keys: `public`, `private`, `protected`. Each key is an **array** of **node
paths**.

```
{
  public: [...],
  protected: [...],
  private: [...],
}
```

Right now this isn't perfect, it won't find the undocumented parts of your
API. It will only pull out classes and method definitions. In general this
will find the API of your class assuming the file is docmented with `@flow`.

This is how you could remove all of the private methods of a class:

```js
import {findAPIOfClass} from 'kodemods';

// Find the class node somehow.
const classToFix = root
  .find(j.ClassDeclaration, {id: {name: 'Foo'}})
  .paths()[0];

// Find the API.
const result = findAPIOfClass(api, classToFix);

// Remove private methods and properties.
result.private.forEach(path => path.replace());
```

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
