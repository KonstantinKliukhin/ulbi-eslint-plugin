/**
 * @fileoverview restricts imports not from public api
 * @author Kliukhin Konstantin
 */
"use strict";
const { isPathRelative, getAlias } = require('../helpers')

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

/** @type {import('eslint').Rule.RuleModule} */
module.exports = {
  meta: {
    type: 'problem', // `problem`, `suggestion`, or `layout`
    docs: {
      description: "restricts imports not from public api ",
      recommended: false,
      url: null, // URL to the documentation page for this rule
    },
    fixable: null, // Or `code` or `whitespace`
    messages: {
      'invalid-import': 'You can import only from public api',
    },
    schema: [
      {
        type: 'object',
        properties: {
          aliases: {
            type: 'string',
            default: '',
          },
        },
      },
    ],
  },
  create(context) {
    const alias = getAlias(context);

    return {
      ImportDeclaration(node) {
        //app/entities/Article
        const value = node.source.value;
        const isStartsWithAlias = alias && value.startsWith(alias)
        const importTo = isStartsWithAlias ? value.replace(`${alias}/`, '') : value;

        if (isPathRelative(importTo)) {
          return;
        }

        const segments = importTo.split('/');
        const isImportNotFromPublicApi = segments.length > 2;

        if (!availableLayers[segments[0]]) return;
        if (hasIgnorePattern(segments)) return;


        if (isImportNotFromPublicApi) {
          return context.report({
            node,
            messageId: 'invalid-import'
          })
        }
      }
    };
  },
};

function hasIgnorePattern (segments) {
  return segments.some(
      (segment) => ignorePatterns.some(
      (ignorePattern) => ignorePattern === segment
    )
  )
}

const ignorePatterns = ['@x'];

const availableLayers = {
  shared: 'shared',
  entities: 'entities',
  features: 'features',
  widgets: 'widgets',
  pages: 'pages',
}
