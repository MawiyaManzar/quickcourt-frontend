import { describe, it, expect } from 'vitest';
import { userService } from '../features/auth/services/userService';

describe('userService', () => {
  it('fetches current user profile', async () => {
    const user = await userService.getCurrentUser();
    expect(user).toHaveProperty('email');
    expect(user).toHaveProperty('role');
  });

  it('updates user profile name and phone', async () => {
    const updated = await userService.updateProfile({
      name: 'John Updated Player',
      phone: '+91 99999 88888',
    });

    expect(updated.name).toBe('John Updated Player');
  });
});
