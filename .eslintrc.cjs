/** @type {import('@types/eslint').Linter.BaseConfig} */

module.exports = {
  extends: ['react-app', 'prettier'],
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
