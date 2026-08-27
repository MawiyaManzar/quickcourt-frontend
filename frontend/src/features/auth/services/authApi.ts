import api from '../../../lib/axios';
import type { AuthUser, UserRole } from '../../../types';

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  avatar?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: AuthUser;
    token: string;
  };
}

export interface OtpResponse {
  success: boolean;
  message: string;
  data?: {
    user?: AuthUser;
    token?: string;
  };
}

// Development mock fallback helper if backend is not reachable
const mockUser = (email: string, name = 'Demo User', role: UserRole = 'USER'): AuthUser => ({
  id: 'user_' + Math.random().toString(36).substring(2, 9),
  name,
  email,
  avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
  role,
  status: 'ACTIVE',
  emailVerified: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

export const authApi = {
  // ---- Register ----
  register: async (payload: RegisterPayload): Promise<AuthResponse> => {
    try {
      const res = await api.post<any>('/auth/register', payload);
      const raw = res.data;
      return {
        success: raw.success ?? true,
        message: raw.message || 'OTP sent to your email address.',
        data: {
          user: raw.data?.user || raw.user,
          token: raw.data?.token || raw.token || '',
        },
      };
    } catch (err: any) {
      throw new Error(err.response?.data?.message || err.response?.data?.error || err.message || 'Registration failed');
    }
  },

  // ---- Verify OTP ----
  verifyOtp: async (email: string, otp: string): Promise<OtpResponse> => {
    try {
      const res = await api.post<any>('/auth/verify-otp', { email, code: otp });
      const raw = res.data;
      return {
        success: raw.success ?? true,
        message: raw.message || 'OTP verified successfully.',
        data: {
          user: raw.data?.user || raw.user,
          token: raw.data?.token || raw.token,
        },
      };
    } catch (err: any) {
      throw new Error(err.response?.data?.message || err.response?.data?.error || err.message || 'OTP verification failed');
    }
  },

  // ---- Login ----
  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    try {
      const res = await api.post<any>('/auth/login', payload);
      const raw = res.data;

      const user = raw.data?.user || raw.user;
      const token = raw.data?.token || raw.token;

      if (!user || !token) {
        throw new Error(raw.message || 'Invalid server response during login');
      }

      return {
        success: raw.success ?? true,
        message: raw.message || 'Logged in successfully.',
        data: { user, token },
      };
    } catch (err: any) {
      throw new Error(err.response?.data?.message || err.response?.data?.error || err.message || 'Invalid email or password');
    }
  },

  // ---- Resend OTP ----
  resendOtp: async (email: string): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await api.post('/auth/resend-otp', { email });
      return res.data;
    } catch (err: any) {
      throw new Error(err.response?.data?.message || err.response?.data?.error || err.message || 'Failed to resend OTP');
    }
  },

  // ---- Get Current User Session ----
  getCurrentUser: async (): Promise<AuthUser> => {
    const res = await api.get<any>('/users/me');
    const raw = res.data;
    return raw.data?.user || raw.user || raw;
  },
};
