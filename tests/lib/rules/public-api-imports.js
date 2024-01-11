/**
 * @fileoverview restricts imports not from public api
 * @author Kliukhin Konstantin
 */
"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const rule = require("../../../lib/rules/public-api-imports"),
  RuleTester = require("eslint").RuleTester;


//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const ruleTester = new RuleTester({
  parserOptions: { ecmaVersion: 6, sourceType: 'module'}
});

ruleTester.run("public-api-imports", rule, {
  valid: [
    {
      code: "import { Some } from 'entities/Some'",
      errors: [],
    },
    {
      code: "import { Some } from 'react-redux/some/deep/module'",
      errors: [],
    },
    {
      code: "import { Some } from '../../../../entities/Some/model/some.js'",
      errors: [],
    },
    {
      code: "import { Some } from 'entities/Some/@x/article.js'",
      errors: [{ message: "You can import only from public api", type: "ImportDeclaration" }],
    },
  ],
  invalid: [
    {
      code: "import { Some } from 'entities/Some/model/some.js'",
      errors: [{ message: "You can import only from public api", type: "ImportDeclaration" }],
    },
    {
      code: "import { Some } from 'features/Some/model/some.js'",
      errors: [{ message: "You can import only from public api", type: "ImportDeclaration" }],
    },
    {
      code: "import { Some } from '@/widgets/Some/model/some.js'",
      options: [{
        alias: '@'
      }],
      errors: [{ message: "You can import only from public api", type: "ImportDeclaration" }],
    },
  ],
});
