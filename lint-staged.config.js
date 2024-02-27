module.exports = {
  '*.{js,jsx,ts,tsx}': ['eslint --fix', 'eslint'],
  // '**/*.ts?(x)': () => 'npm run type-check',
  '*.{js,jsx,ts,tsx,css,md,json,yaml}': ['prettier --write'],
}
