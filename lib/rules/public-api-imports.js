/**
 * @fileoverview restricts imports not from public api
 * @author Kliukhin Konstantin
 */
"use strict";
const { isPathRelative, getIsIgnoredFile } = require('../helpers')
const micromatch = require('micromatch');

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------


const INVALID_IMPORT_ERROR = 'invalid-import';
/** @type {import('eslint').Rule.RuleModule} */
module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: "restricts imports not from public api ",
      recommended: false,
      url: null,
    },
    fixable: 'code',
    messages: {
      [INVALID_IMPORT_ERROR]: 'You can import only from public api',
    },
    schema: [
      {
        type: 'object',
        properties: {
          aliases: {
            type: 'string',
            default: '',
          },
          ignorePatterns: {
            type: 'array',
            default: [],
          },
          testFilesPatterns: {
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
    const testFilesPatterns = context.options[0]?.testFilesPatterns ?? [];

    return {
      ImportDeclaration(node) {
        //app/entities/Article
        const value = node.source.value;
        const isStartsWithAlias = alias && value.startsWith(alias)
        const importTo = isStartsWithAlias ? value.replace(`${alias}/`, '') : value;
        const fromFilename = context.getFilename();

        if (isPathRelative(importTo)) return;

        const isFileIgnored = getIsIgnoredFile(ignorePatterns, fromFilename)
        if (isFileIgnored) return;

        const segments = importTo.split('/');

        const layer = segments[0];
        const slice = segments[1];

        if (!availableLayers[segments[0]]) return;
        if (hasIgnoreSegments(segments, ignorePatterns)) return;

        const allowedSegmentsCount = shouldAllowOneMoreLayer(fromFilename, testFilesPatterns) ? 3 : 2;
        const isImportNotFromPublicApi = segments.length > allowedSegmentsCount;

        if (isImportNotFromPublicApi) {
          return context.report({
            node,
            messageId: INVALID_IMPORT_ERROR,
            fix: (fixer) => {
              return fixer.replaceText(node.source, `'${alias ? `${alias}/` : ''}${layer}/${slice}'`)
            }
          })
        }
      }
    };
  },
};

function shouldAllowOneMoreLayer(fromFilename, testFilesPatterns) {
  return testFilesPatterns.some(testFilesPattern => micromatch.isMatch(fromFilename, testFilesPattern));
}

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
