/**
 * @fileoverview restricts imports not from public api
 * @author Kliukhin Konstantin
 */
"use strict";
const { isPathRelative } = require('../helpers')
const micromatch = require('micromatch');

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
          ignorePatters: {
            type: 'array',
            default: [],
          }
        },
      },
    ],
  },
  create(context) {
    const alias = context.options[0]?.alias ?? '';
    const ignorePatterns = context.options[0]?.ignorePatterns ?? [];

    return {
      ImportDeclaration(node) {
        //app/entities/Article
        const value = node.source.value;
        const isStartsWithAlias = alias && value.startsWith(alias)
        const importTo = isStartsWithAlias ? value.replace(`${alias}/`, '') : value;

        if (isPathRelative(importTo)) return;
        if (ignorePatterns.length) {
          const fromFilename = context.getFilename();

          const isCurrentFileIgnored = ignorePatterns
              .some(ignorePattern => micromatch.isMatch(fromFilename, ignorePattern));
          if (isCurrentFileIgnored) return;
        }

        const segments = importTo.split('/');

        if (!availableLayers[segments[0]]) return;
        if (hasIgnoreSegments(segments, ignorePatterns)) return;

        const isImportNotFromPublicApi = segments.length > 2;

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

function hasIgnoreSegments (segments) {
  return segments.some(
      (segment) => ignoreImportSegments.some(
      (ignoreSegment) => ignoreSegment === segment
    )
  )
}

const ignoreImportSegments = ['@x'];

const availableLayers = {
  shared: 'shared',
  entities: 'entities',
  features: 'features',
  widgets: 'widgets',
  pages: 'pages',
}
