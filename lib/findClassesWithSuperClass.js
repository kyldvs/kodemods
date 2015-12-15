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
export default function findClassesWithSuperClass(api, root, query) {
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
