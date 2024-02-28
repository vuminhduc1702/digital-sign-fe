module.exports = {
  '/*.{js,mjs,ts,tsx}': ['eslint --fix', 'prettier --check --write'],
  '/*.css': ['stylelint --allow-empty-input', 'prettier --write'],
  '/*.{json,yml}': ['prettier --check --write'],
}
