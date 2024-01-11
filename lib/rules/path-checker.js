"use strict";
const { isPathRelative } = require('../helpers')

/** @type {import('eslint').Rule.RuleModule} */
module.exports = {
  meta: {
    type: 'problem', // `problem`, `suggestion`, or `layout`
    docs: {
      description: "feature sliced relative path checker",
      recommended: false,
      url: null, // URL to the documentation page for this rule
    },
    messages: {
      'invalid-absolute-import': 'All imports should be relative in one slice',
    },
    fixable: null, // Or `code` or `whitespace`
    schema: [
      {
        type: 'object',
        properties: {
          alias: {
            type: 'string',
            default: '',
          },
        },
      },
    ], // Add a schema if the rule has options
  },

  create(context) {
    const alias = context.options[0]?.alias ?? '';

    return {
      ImportDeclaration(node) {
        //app/entities/Article
        const value = node.source.value;
        const isStartsWithAlias = alias && value.startsWith(alias)
        const importTo = isStartsWithAlias ? value.replace(`${alias}/`, '') : value;

        // C:/Users/Kostya/Desktop/projects/ulbi-course
        const fromFilename = context.getFilename();

        if (shouldBeRelative(fromFilename, importTo)) {
          context.report({
            node: node,
            messageId: 'invalid-absolute-import',
          })
        }
      }
    };
  },
};

const layers = {
  shared: 'shared',
  entities: 'entities',
  features: 'features',
  widgets: 'widgets',
  pages: 'pages',
}

function shouldBeRelative(from, to) {
  if (isPathRelative(to) || !from || !to) {
    return false
  }

  const toArray = to.split('/');
  const toLayer = toArray[0]; // entities
  const toSlice = toArray[1]; // Article

  if (!toLayer || !toSlice || !layers[toLayer]) {
    return false;
  }

  const normalizedPath = normalizePath(from);
  const projectFrom = normalizedPath.split('src')[1];
  if (!projectFrom) return false;
  const fromArray = projectFrom.split('/');

  const fromLayer = fromArray[1];
  const fromSlice = fromArray[2];

  if (!fromLayer || !fromSlice || !layers[fromLayer]) {
    return false;
  }

  return fromSlice === toSlice && toLayer === fromLayer;
}

function normalizePath(inputPath) {
  return inputPath.replace(/\\/g, '/');
}

