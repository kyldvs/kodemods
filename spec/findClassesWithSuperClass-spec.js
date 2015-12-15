'use strict';

import {findClassesWithSuperClass} from '..';
import jscodeshift from 'jscodeshift';

const TESTS = [
  {
    name: 'should find simple classes',
    code: `
      class Foo extends Bar {}
    `,
    query: {
      type: 'Identifier',
      name: 'Bar',
    },
    results: [
      'Foo',
    ],
  },
  {
    name: 'should find multiple classes',
    code: `
      class Foo extends Bar {}
      class Baz extends Bar {
        constructor() {
          class Buz extends Bar {}
        }
      }
    `,
    query: {
      type: 'Identifier',
      name: 'Bar',
    },
    results: [
      'Foo',
      'Baz',
      'Buz',
    ],
  },
  {
    name: 'should support complex queries',
    code: `
      class Foo extends fn(1) {}
      class Bar extends fn(2) {}
    `,
    query: {
      type: 'CallExpression',
      callee: {
        type: 'Identifier',
        name: 'fn',
      },
      arguments: [{
        type: 'Literal',
        value: 1,
      }],
    },
    results: [
      'Foo',
    ],
  },
];

describe('findClassesWithSuperClass', () => {
  TESTS.forEach(test => {
    it(test.name, () => {
      const root = jscodeshift(test.code);
      const paths = findClassesWithSuperClass({jscodeshift}, root, test.query);
      const classNames = paths.map(path => path.node.id.name);
      expect(classNames.slice().sort()).toEqual(test.results.slice().sort());
    });
  });

  // Test inline classes separately.
  it('should find inline classes', () => {
    const code = `
      foo(class extends Bar {});
      foo(class extends Bar {});
      foo(class extends Baz {});
    `;
    const root = jscodeshift(code);
    const barPaths = findClassesWithSuperClass({jscodeshift}, root, {
      type: 'Identifier',
      name: 'Bar',
    });
    const bazPaths = findClassesWithSuperClass({jscodeshift}, root, {
      type: 'Identifier',
      name: 'Baz',
    });
    const buzPaths = findClassesWithSuperClass({jscodeshift}, root, {
      type: 'Identifier',
      name: 'Buz',
    });
    expect(barPaths.length).toBe(2);
    expect(bazPaths.length).toBe(1);
    expect(buzPaths.length).toBe(0);
  });
});
