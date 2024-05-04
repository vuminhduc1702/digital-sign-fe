module.exports = {
  '*.{js,jsx,cjs,mjs,ts,tsx}': ['eslint --fix', 'prettier --check --write'],
  '*.css': ['stylelint --allow-empty-input', 'prettier --write'],
  '*.json': ['prettier --check --write'],
  // '**/*.ts?(x)': () => 'npm run type-check',
}
