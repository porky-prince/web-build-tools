module.exports = {
  '*.{js,ts}': ['prettier --write', 'eslint --fix', 'git add'],
  '*.{json,md}': ['prettier --write', 'git add'],
};
