/** @type {import('@types/eslint').Linter.BaseConfig} */

module.exports = {
  root: true,
  extends: [
    'react-app',
    'prettier',
    'plugin:@tanstack/eslint-plugin-query/recommended',
    'plugin:tailwindcss/recommended',
  ],
  plugins: ['@tanstack/query'],
  rules: {
    '@typescript-eslint/consistent-type-imports': [
      'warn',
      {
        prefer: 'type-imports',
        disallowTypeAnnotations: true,
        fixStyle: 'inline-type-imports',
      },
    ],
    'testing-library/no-await-sync-events': 'off',
    'jest-dom/prefer-in-document': 'off',
    '@typescript-eslint/no-duplicate-imports': 'warn',
    'no-unused-vars': 'off',
  },
}
