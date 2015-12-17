'use strict';

/**
 * This method helps find the API of a class. `root` should be an AST node of
 * the type `ClassDeclaration`.
 *
 * Right now this isn't perfect, it won't find the undocumented parts of your
 * API. It will only pull out classes and method definitions. In general this
 * will find the API of your class assuming the file is docmented with @flow.
 *
 * The return type will be an object with three properties, each containing an
 * array of node paths:
 *
 *   {
 *     public: [...],
 *     protected: [...],
 *     private: [...],
 *   }
 *
 * @return {Object}
 */
export default function findAPIOfClass(api, root) {
  const j = api.jscodeshift;
  const {match} = j;

  root = j(root);

  const result = {
    public: [],
    protected: [],
    private: [],
  };

  root
    .find(j.Node)
    .forEach(p => {
      // Methods
      if (match(p, {
        type: 'MethodDefinition',
        key: {
          type: 'Identifier',
        },
      })) {
        const name = p.node.key.name;
        assignToVisibility(name, p, result);
      }

      // Properties
      if (match(p, {
        type: 'ClassProperty',
        key: {
          type: 'Identifier',
        },
      })) {
        const name = p.node.key.name;
        assignToVisibility(name, p, result);
      }
    });

  return result;
}

/**
 * Given a name, nodePath, and result object. Assign the nodePath to the correct
 * visibility array within result based on the name.
 */
function assignToVisibility(name, nodePath, result) {
  if (!name) {
    return;
  }
  if (/^__[^_].*$/.test(name)) {
    result.protected.push(nodePath);
  } else if (/^_[^_].*$/.test(name)) {
    result.private.push(nodePath);
  } else if (/^[^_].*$/.test(name)) {
    result.public.push(nodePath);
  }
}
