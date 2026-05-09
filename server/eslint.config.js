import js from "@eslint/js";
import globals from "globals";

export default [
  // Files and folders to skip entirely
  {
    ignores: ["node_modules/**", "dist/**"]
  },

  // Enables ESLint's built-in recommended rules as a base
  js.configs.recommended,

  {
    languageOptions: {
      // Declare global variables available in Node 18+ runtime
      // Without this, ESLint throws "no-undef" on valid built-ins
      globals: {
        ...globals.node,  // adds ALL Node.js globals at once (Buffer, process, fetch, console, etc.)
      }
    },
    rules: {
      "no-unused-vars": "warn",         // warn on variables declared but never used
      "no-undef": "error",              // error on variables that are never declared
      "eqeqeq": "error",                // enforce === instead of ==
      "no-duplicate-imports": "error",  // disallow importing the same module twice
      "no-unreachable": "error",        // error on code after return/throw that can never run
    }
  }
];