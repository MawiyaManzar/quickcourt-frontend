import api from '../../../lib/axios';
import { useAuthStore, type AuthUser } from '../../../stores/authStore';

export interface UpdateProfilePayload {
  name?: string;
  phone?: string;
  avatar?: string;
}

export const userService = {
  /**
   * Fetch current authenticated user details from GET /api/users/me
   */
  async getCurrentUser(): Promise<AuthUser> {
    const currentUser = useAuthStore.getState().user;

    try {
      const res = await api.get<any>('/users/me');
      const raw = res.data;
      const user = raw?.user || raw?.data?.user || raw?.data || raw;
      if (user && user.email) {
        useAuthStore.getState().setUser(user as AuthUser);
        return user as AuthUser;
      }
    } catch (err: any) {
      if (currentUser) return currentUser;
      throw new Error(err.response?.data?.message || err.message || 'Failed to fetch user session');
    }

    if (currentUser) return currentUser;
    throw new Error('No authenticated user session found.');
  },

  /**
   * Update user profile via PATCH /api/users/profile
   */
  async updateProfile(payload: UpdateProfilePayload): Promise<AuthUser> {
    try {
      const res = await api.patch<any>('/users/profile', payload);
      const raw = res.data;
      const updatedUser = raw?.user || raw?.data?.user || raw?.data || raw;
      if (updatedUser && updatedUser.email) {
        useAuthStore.getState().setUser(updatedUser as AuthUser);
        return updatedUser as AuthUser;
      }
      throw new Error(raw.message || 'Failed to update profile');
    } catch (err: any) {
      throw new Error(err.response?.data?.message || err.message || 'Failed to update user profile');
    }
  },
};
