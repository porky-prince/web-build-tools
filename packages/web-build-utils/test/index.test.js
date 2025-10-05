const pkg = require('../package.json');

describe('test ' + pkg.name, () => {
  test('base', () => {
    expect(1 + 1).toBe(2);
  });
});
