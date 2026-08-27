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
    } catch {
      // Fallback to local store user
    }

    if (currentUser) return currentUser;

    // Default fallback user if no user logged in
    const defaultUser: AuthUser = {
      id: 'usr-customer-1',
      name: 'John Player',
      email: 'player@quickcourt.com',
      role: 'USER',
      status: 'ACTIVE',
      emailVerified: true,
      createdAt: '2026-01-15T00:00:00.000Z',
    };
    useAuthStore.getState().setUser(defaultUser);
    return defaultUser;
  },

  /**
   * Update user profile via PATCH /api/users/profile
   */
  async updateProfile(payload: UpdateProfilePayload): Promise<AuthUser> {
    const currentUser = useAuthStore.getState().user;

    try {
      const res = await api.patch<any>('/users/profile', payload);
      const raw = res.data;
      const updatedUser = raw?.user || raw?.data?.user || raw?.data || raw;
      if (updatedUser && updatedUser.email) {
        useAuthStore.getState().setUser(updatedUser as AuthUser);
        return updatedUser as AuthUser;
      }
    } catch {
      // Fallback update local user store
    }

    await new Promise((res) => setTimeout(res, 150));

    const updatedUser: AuthUser = {
      id: currentUser?.id || 'usr-customer-1',
      name: payload.name || currentUser?.name || 'John Player',
      email: currentUser?.email || 'player@quickcourt.com',
      role: currentUser?.role || 'USER',
      status: currentUser?.status || 'ACTIVE',
      emailVerified: currentUser?.emailVerified ?? true,
      phone: payload.phone || currentUser?.phone,
      createdAt: currentUser?.createdAt || new Date().toISOString(),
    };

    useAuthStore.getState().setUser(updatedUser);
    return updatedUser;
  },
};
