import { user } from './user'

describe('@amplitude/user', () => {
  test('should export a default user', () => {
    expect(user).not.toBe(null);
  });
});
