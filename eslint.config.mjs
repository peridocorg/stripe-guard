// @ts-check
/// <reference types="./eslint.config.d.ts" />
import * as path from 'node:path'
import * as url from 'node:url'
import eslint from '@eslint/js'
import stylisticPlugin from '@stylistic/eslint-plugin'
import prettierConfig from 'eslint-config-prettier'
import importPlugin from 'eslint-plugin-import'
import preferArrowPlugin from 'eslint-plugin-prefer-arrow'
import unicornPlugin from 'eslint-plugin-unicorn'
import tseslint from 'typescript-eslint'

const __filename = url.fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/**
 * All packages that leverage t3-env should use this rule
 */
/** @type {Awaited<import('typescript-eslint').ConfigArray>} */
export const restrictEnvAccess = tseslint.config(
  { ignores: ['**/env.ts', '**/env-client.ts'] },
  {
    files: ['**/*.js', '**/*.ts', '**/*.tsx'],
    rules: {
      'no-restricted-properties': [
        'error',
        {
          object: 'process',
          property: 'env',
          message:
            "Use `import { env } from '~/env'` instead to ensure validated types.",
        },
      ],
      'no-restricted-imports': [
        'error',
        {
          name: 'process',
          importNames: ['env'],
          message:
            "Use `import { env } from '~/env'` instead to ensure validated types.",
        },
      ],
    },
  },
)

/** @type {Awaited<import('typescript-eslint').ConfigArray>} */
const baseConfig = tseslint.config(
  { ignores: ['**/*.config.*'] },
  {
    files: ['**/*.ts', '**/*.tsx'],
    plugins: {
      import: importPlugin,
      unicorn: unicornPlugin,
      'prefer-arrow': preferArrowPlugin,
    },
    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.recommended,
      ...tseslint.configs.recommendedTypeChecked,
      ...tseslint.configs.stylisticTypeChecked,
      stylisticPlugin.configs.recommended,
      prettierConfig,
    ],
    rules: {
      '@stylistic/indent': ['off'],
      'func-style': ['warn', 'expression', { allowArrowFunctions: true }],
      'no-console': ['off'],
      'no-restricted-syntax': 'off',
      // Modern JavaScript features
      '@typescript-eslint/adjacent-overload-signatures': 'error',
      '@typescript-eslint/array-type': 'error',
      '@typescript-eslint/await-thenable': 'warn',
      '@typescript-eslint/class-literal-property-style': 'error',
      '@typescript-eslint/class-methods-use-this': 'error',
      '@typescript-eslint/consistent-generic-constructors': 'error',
      '@typescript-eslint/consistent-return': 'error',
      '@typescript-eslint/consistent-type-assertions': 'error',
      '@typescript-eslint/consistent-type-definitions': 'error',
      '@typescript-eslint/default-param-last': 'error',
      '@typescript-eslint/dot-notation': 'error',
      // '@typescript-eslint/explicit-function-return-type': 'error',
      '@typescript-eslint/explicit-member-accessibility': 'error',
      // '@typescript-eslint/explicit-module-boundary-types': 'error',
      '@typescript-eslint/prefer-as-const': 'error', // Prefer const assertions
      '@typescript-eslint/prefer-destructuring': 'error',
      '@typescript-eslint/prefer-find': 'error',
      '@typescript-eslint/prefer-for-of': 'error', // Prefer for-of over for-in
      '@typescript-eslint/prefer-function-type': 'error',
      '@typescript-eslint/prefer-includes': 'error',
      '@typescript-eslint/prefer-literal-enum-member': 'error',
      '@typescript-eslint/prefer-namespace-keyword': 'error',
      '@typescript-eslint/prefer-nullish-coalescing': 'error', // Prefer ?? over ||
      '@typescript-eslint/prefer-optional-chain': 'error', // Prefer ?. over && chaining
      '@typescript-eslint/prefer-readonly': 'error',
      // '@typescript-eslint/prefer-readonly-parameter-types': 'error',
      '@typescript-eslint/prefer-reduce-type-parameter': 'error',
      '@typescript-eslint/prefer-regexp-exec': 'error',
      '@typescript-eslint/prefer-string-starts-ends-with': 'error',
      '@typescript-eslint/promise-function-async': 'off',
      '@typescript-eslint/related-getter-setter-pairs': 'error',
      '@typescript-eslint/require-array-sort-compare': 'error',
      '@typescript-eslint/require-await': 'warn',
      '@typescript-eslint/restrict-plus-operands': 'error',
      '@typescript-eslint/restrict-template-expressions': 'error',
      '@typescript-eslint/return-await': 'warn',
      '@typescript-eslint/sort-type-constituents': 'error',
      '@typescript-eslint/strict-boolean-expressions': 'error',
      '@typescript-eslint/switch-exhaustiveness-check': 'error',
      '@typescript-eslint/triple-slash-reference': 'error',
      '@typescript-eslint/typedef': 'error',
      '@typescript-eslint/unbound-method': 'error',
      '@typescript-eslint/unified-signatures': 'error',
      '@typescript-eslint/use-unknown-in-catch-callback-variable': 'error',

      '@/prefer-arrow-callback': 'error', // Prefer arrow functions for callbacks

      // Simplify arrow functions when possible
      '@/arrow-body-style': ['error', 'as-needed'],
      'prefer-arrow/prefer-arrow-functions': 'error',

      // Modern syntax preferences
      'unicorn/prefer-at': 'error', // Prefer .at() for array access
      'unicorn/prefer-string-replace-all': 'error', // Prefer replaceAll over replace with global regex
      'unicorn/prefer-top-level-await': 'error', // Allow top-level await
      'unicorn/prefer-module': 'error', // Prefer ESM over CommonJS
      'unicorn/prefer-node-protocol': 'error', // Prefer node: protocol imports
      'unicorn/prefer-event-target': 'error', // Prefer EventTarget over EventEmitter
      // TypeScript-specific modern features
      // "no-unused-vars": "off",
      // Destructuring preferences
      'prefer-destructuring': [
        'error',
        {
          array: true,
          object: true,
        },
      ],
      // Modern async/await practices
      'require-atomic-updates': 'error',
      'no-return-await': 'off',
      // Object syntax modernization
      'object-shorthand': ['error', 'always'],
      'prefer-object-spread': 'error',
      // Template literal preferences
      'prefer-template': 'error',
      'no-useless-concat': 'error',
      // Number handling
      'unicorn/prefer-number-properties': 'error', // prefer Number.isNaN over isNaN
      'unicorn/prefer-math-trunc': 'error', // prefer Math.trunc over bitwise ops
      // Control flow
      'unicorn/prefer-switch': 'error', // Prefer switch over multiple else-if
      'no-else-return': ['error', { allowElseIf: false }],
      // Module systems
      'import/no-commonjs': 'error',
      'import/no-amd': 'error',
      // Error handling
      'unicorn/prefer-optional-catch-binding': 'error',
      '@/no-throw-literal': 'error',
      // Array methods
      'unicorn/prefer-array-find': 'error',
      'unicorn/prefer-array-flat': 'error',
      'unicorn/prefer-array-flat-map': 'error',
      // Modern iteration
      'unicorn/prefer-native-coercion-functions': 'error',
      'unicorn/prefer-includes': 'error',
      // String methods
      'unicorn/prefer-string-slice': 'error',
      'unicorn/prefer-string-starts-ends-with': 'error',
      'unicorn/prefer-string-trim-start-end': 'error',
      // DOM APIs
      'unicorn/prefer-add-event-listener': 'error',
      'unicorn/prefer-modern-dom-apis': 'error',
      // Development practices
      'unicorn/prefer-date-now': 'error', // Prefer Date.now() over new Date()
      'unicorn/no-document-cookie': 'error', // Prefer modern APIs over document.cookie
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/consistent-type-imports': [
        'warn',
        { prefer: 'type-imports', fixStyle: 'separate-type-imports' },
      ],
      '@typescript-eslint/consistent-type-exports': [
        'error',
        { fixMixedExportsWithInlineTypeSpecifier: true },
      ],
      '@typescript-eslint/no-misused-promises': [
        2,
        { checksVoidReturn: { attributes: false } },
      ],
      '@typescript-eslint/no-unnecessary-condition': [
        'error',
        {
          allowConstantLoopConditions: true,
        },
      ],
      '@typescript-eslint/no-non-null-assertion': 'off',
      'import/consistent-type-specifier-style': ['error', 'prefer-top-level'],

      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/prefer-readonly-parameter-types': 'off',
    },
  },
  {
    linterOptions: { reportUnusedDisableDirectives: true },
    languageOptions: { parserOptions: { projectService: true } },
  },
)

export default baseConfig
