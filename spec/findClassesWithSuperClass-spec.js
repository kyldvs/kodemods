'use strict';

import {findClassesWithSuperClass} from '..';
import jscodeshift from 'jscodeshift';

const API = {jscodeshift};

describe('findClassesWithSuperClass', () => {
  it('should find simple classes', () => {
    const root = jscodeshift(`
      class Foo extends Bar {}
    `);
    const paths = findClassesWithSuperClass(API, root, {
      type: 'Identifier',
      name: 'Bar',
    });
    expect(paths.length).toBe(1);
    expect(paths[0].node.id.name).toBe('Foo');
  });
});
