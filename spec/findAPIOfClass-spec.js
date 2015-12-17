'use strict';

import {findAPIOfClass} from '..';
import jscodeshift from 'jscodeshift';

/**
 * - The result in the tests is simplified. The actual result will contain
 *   proper node paths. It's simplified here to make test writing easier.
 * - In the test it will always search for a class named Foo. The general util
 *   does not have this restriction.
 */
const TESTS = [
  {
    desc: 'should have no API for empty classes',
    code: `
      class Foo {}
    `,
    result: {
      public: [],
      protected: [],
      private: [],
    },
  },
  {
    desc: 'should find static methods',
    code: `
      class Foo {
        static foo() {}
        static _privateFoo() {}
        static __protectedFoo() {}
      }
    `,
    result: {
      public: ['foo'],
      protected: ['__protectedFoo'],
      private: ['_privateFoo'],
    },
  },
  {
    desc: 'should find methods',
    code: `
      class Foo {
        foo() {}
        _privateFoo() {}
        __protectedFoo() {}
      }
    `,
    result: {
      public: ['foo'],
      protected: ['__protectedFoo'],
      private: ['_privateFoo'],
    },
  },
  {
    desc: 'should find properties',
    code: `
      class Foo {
        foo = 1;
        _privateFoo = 1;
        __protectedFoo = 1;
      }
    `,
    result: {
      public: ['foo'],
      protected: ['__protectedFoo'],
      private: ['_privateFoo'],
    },
  },
  {
    desc: 'should not find undocumented properties',
    code: `
      class Foo {
        constructor() {
          this.foo = 1;
          this._privateFoo = 1;
          this.__protectedFoo = 1;
        }
      }
    `,
    result: {
      public: ['constructor'],
      protected: [],
      private: [],
    },
  },
  {
    desc: 'should find flow properties',
    code: `
      class Foo {
        foo: number;
        _privateFoo: number;
        __protectedFoo: number;
      }
    `,
    result: {
      public: ['foo'],
      protected: ['__protectedFoo'],
      private: ['_privateFoo'],
    },
  },
  {
    desc: 'should find the constructor',
    code: `
      class Foo {
        constructor() {}
      }
    `,
    result: {
      public: ['constructor'],
      protected: [],
      private: [],
    },
  },
];

describe('findClassesWithSuperClass', () => {
  TESTS.forEach(test => {
    it(test.desc, () => {
      const root = jscodeshift(test.code)
        .find(jscodeshift.ClassDeclaration, {id: {
          type: 'Identifier',
          name: 'Foo',
        }})
        .paths()[0];
      expect(root.node.type).toBe('ClassDeclaration');
      const actual = findAPIOfClass({jscodeshift}, root);
      ['public', 'protected', 'private'].forEach(key => {
        expect(
          actual[key].map(p => p.node.key.name).sort()
        ).toEqual(
          test.result[key].slice().sort()
        );
      });
    });
  });
});
