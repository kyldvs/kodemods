'use strict';

/**
 * Given the root this will find all classes where the superClass matches the
 * given query. The query may look like:
 *
 *  {
 *    type: 'Identifier',
 *    name: 'Foo',
 *  }
 *
 * @return {Array<NodePath>}
 */
export function findClassesThatExtend(api, root, query) {
  const j = api.jscodeshift;
  const CLASS_TYPES = new Set([
    'ClassDeclaration',
    'ClassExpression',
  ]);
  return root
    .find(j.Node, {superClass: query})
    .filter(p => CLASS_TYPES.has(p.node.type))
    .paths();
}

/**
 * This finds the identifier that is the default import of `from`.
 *
 * When called like this:
 *
 *  findDefaultImport(api, root, 'bar')
 *
 * These examples will return 'foo'.
 *
 *  import foo from 'bar';
 *  import foo, {notFoo} from 'bar';
 *  const foo = require('bar');
 *
 * These examples will return undefined.
 *
 *  import * as foo from 'bar';
 *  import {foo} from 'bar';
 *  const {foo} = require('bar');
 *
 * Overriding of imports is not handled in any way. If this happens do not rely
 * on the result of this function.
 *
 *  let foo = require('bar');
 *  foo = require('baz');
 *
 * @return {?string}
 */
export function findDefaultImport(api, root, from) {
  const j = api.jscodeshift;
  const {match} = j;
  const result = [];
  root
    .find(j.Node)
    .filter(p => {
      // handle imports
      if (match(p, {
        type: 'ImportDeclaration',
        source: {
          type: 'Literal',
          value: from,
        },
      })) {
        p.node.specifiers.forEach(s => {
          if (match(s, {type: 'ImportDefaultSpecifier'})) {
            result.push(s.local.name);
          }
        });
      }

      // handle requires
      if (match(p, {
        type: 'VariableDeclarator',
        id: {
          type: 'Identifier',
        },
        init: {
          type: 'CallExpression',
          callee: {
            type: 'Identifier',
            name: 'require',
          },
          arguments: [{
            type: 'Literal',
            value: from,
          }],
        },
      })) {
        result.push(p.node.id.name);
      }
    });
  return result[0];
}
