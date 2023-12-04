/**
 * @fileoverview feature sliced relative path checker
 * @author Konstantin Kliukhin
 */
"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const rule = require("../../../lib/rules/path-checker"),
  RuleTester = require("eslint").RuleTester;


//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const ruleTester = new RuleTester();
ruleTester.run("path-checker", rule, {
  valid: [
    // give me some code that won't trigger a warning
  ],

  invalid: [
    {
      filename: '/src/entities/Article/some.js',
      "parserOptions": {
        "sourceType": "module",
        ecmaVersion: 2015
      },
      code: "import { article } from 'entities/Article'",
      errors: [{ message: "All imports should be relative in one slice", type: "ImportDeclaration" }],
    },
  ],
});
