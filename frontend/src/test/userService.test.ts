import { describe, it, expect } from 'vitest';
import { userService } from '../features/auth/services/userService';

describe('userService', () => {
  it('handles unauthenticated user profile request', async () => {
    await expect(userService.getCurrentUser()).rejects.toThrow();
  });

  it('handles unauthenticated user profile update request', async () => {
    await expect(userService.updateProfile({ name: 'Test' })).rejects.toThrow();
  });
});
