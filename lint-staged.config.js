module.exports = {
  '*.{js,ts}': ['prettier --cache --write', 'eslint --cache --fix'],
  '*.json': ['prettier --cache --write'],
};
