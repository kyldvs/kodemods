'use strict';

import {findNameForDefaultImport} from '..';
import jscodeshift from 'jscodeshift';

const TESTS = [
  {
    desc: 'should find simple requires',
    code: `
      const bar = require('bar');
    `,
    from: 'bar',
    name: 'bar',
  },
  {
    desc: 'should find aliased require',
    code: `
      const foo = require('bar');
    `,
    from: 'bar',
    name: 'foo',
  },
  {
    desc: 'should find simple imports',
    code: `
      import bar from 'bar';
    `,
    from: 'bar',
    name: 'bar',
  },
  {
    desc: 'should find aliased imports',
    code: `
      import foo from 'bar';
    `,
    from: 'bar',
    name: 'foo',
  },
  {
    desc: 'should find in mixed imports',
    code: `
      import foo, {baz} from 'bar';
    `,
    from: 'bar',
    name: 'foo',
  },
  {
    desc: 'should not find wrong import',
    code: `
      import bar from 'bar';
    `,
    from: 'baz',
    name: undefined,
  },
];

describe('findNameForDefaultImport', () => {
  TESTS.forEach(test => {
    it(test.desc, () => {
      const root = jscodeshift(test.code);
      const name = findNameForDefaultImport({jscodeshift}, root, test.from);
      expect(name).toBe(test.name);
    });
  });
});
