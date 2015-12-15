# kodemods
just some code mod things

# usage

General usage is like this:

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

# api docs

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
