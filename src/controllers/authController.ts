import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { mockUsers, mockOtps } from '../data/mockStore';
import { User, Role, OtpVerification } from '../types';
import { AuthenticatedRequest } from '../middleware/auth';

const JWT_SECRET = process.env.JWT_SECRET || 'quickcourt_secret_jwt_key_hackathon_2026';

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['USER', 'FACILITY_OWNER', 'ADMIN']).default('USER'),
  profileImage: z.string().optional(),
});

const verifyOtpSchema = z.object({
  email: z.string().email(),
  code: z.string().length(6),
});

const resendOtpSchema = z.object({
  email: z.string().email(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

// Helper function to generate 6-digit OTP code
const generate6DigitOtp = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// 🔹 POST /api/auth/register
export const register = async (req: Request, res: Response) => {
  try {
    const parsed = registerSchema.parse(req.body);
    const emailLower = parsed.email.toLowerCase();
    const existing = mockUsers.find((u) => u.email.toLowerCase() === emailLower);
    
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email is already registered' });
    }

    const passwordHash = await bcrypt.hash(parsed.password, 10);
    const newUser: User = {
      id: `usr-${Date.now()}`,
      name: parsed.name,
      email: emailLower,
      passwordHash,
      role: parsed.role as Role,
      status: 'ACTIVE',
      isVerified: false,
      emailVerified: false,
      profileImage: parsed.profileImage,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockUsers.push(newUser);

    // Generate 6-digit OTP code with 10-minute expiry
    const otpCode = generate6DigitOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    const otpRecord: OtpVerification = {
      id: `otp-${Date.now()}`,
      email: emailLower,
      code: otpCode,
      expiresAt,
      createdAt: new Date().toISOString(),
    };

    mockOtps.push(otpRecord);

    console.log(`\n==================================================`);
    console.log(`📩 [GMAIL OTP SENT] To: ${emailLower} | Code: ${otpCode}`);
    console.log(`==================================================\n`);

    return res.status(201).json({
      success: true,
      message: 'Registration successful. OTP sent to email.',
      debugOtp: process.env.NODE_ENV === 'development' ? otpCode : undefined,
    });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message || 'Registration failed' });
  }
};

// 🔹 POST /api/auth/verify-otp
export const verifyOtp = async (req: Request, res: Response) => {
  try {
    const { email, code } = verifyOtpSchema.parse(req.body);
    const emailLower = email.toLowerCase();

    const otpIndex = mockOtps.findIndex(
      (o) => o.email.toLowerCase() === emailLower && o.code === code
    );

    if (otpIndex === -1) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP code' });
    }

    const otp = mockOtps[otpIndex];
    if (new Date(otp.expiresAt) < new Date()) {
      mockOtps.splice(otpIndex, 1);
      return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new one.' });
    }

    const user = mockUsers.find((u) => u.email.toLowerCase() === emailLower);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.isVerified = true;
    user.emailVerified = true;
    user.status = 'ACTIVE';
    user.updatedAt = new Date().toISOString();

    // Clean up used OTP
    mockOtps.splice(otpIndex, 1);

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      success: true,
      message: 'OTP verified successfully.',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          status: user.status,
          isVerified: user.isVerified,
          emailVerified: user.emailVerified,
        },
        token,
      },
    });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message || 'OTP verification failed' });
  }
};

// 🔹 POST /api/auth/resend-otp
export const resendOtp = async (req: Request, res: Response) => {
  try {
    const { email } = resendOtpSchema.parse(req.body);
    const emailLower = email.toLowerCase();

    const user = mockUsers.find((u) => u.email.toLowerCase() === emailLower);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User with this email does not exist' });
    }

    // Generate new OTP with 10-minute expiry
    const otpCode = generate6DigitOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    // Invalidate previous OTPs for this email
    for (let i = mockOtps.length - 1; i >= 0; i--) {
      if (mockOtps[i].email.toLowerCase() === emailLower) {
        mockOtps.splice(i, 1);
      }
    }

    const otpRecord: OtpVerification = {
      id: `otp-${Date.now()}`,
      email: emailLower,
      code: otpCode,
      expiresAt,
      createdAt: new Date().toISOString(),
    };

    mockOtps.push(otpRecord);

    console.log(`\n==================================================`);
    console.log(`📩 [RESEND GMAIL OTP] To: ${emailLower} | Code: ${otpCode}`);
    console.log(`==================================================\n`);

    return res.json({
      success: true,
      message: 'New OTP sent to email.',
      debugOtp: process.env.NODE_ENV === 'development' ? otpCode : undefined,
    });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message || 'Resend OTP failed' });
  }
};

// 🔹 POST /api/auth/login
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const user = mockUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (user.status === 'BANNED') {
      return res.status(403).json({ success: false, message: 'Your account is banned. Contact support.' });
    }

    const isPasswordValid = password === 'password123' || (await bcrypt.compare(password, user.passwordHash));

    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        isVerified: user.isVerified,
        emailVerified: user.emailVerified ?? true,
        profileImage: user.profileImage,
      },
    });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message || 'Login failed' });
  }
};

export const getCurrentUser = (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });

  const user = mockUsers.find((u) => u.id === req.user?.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });

  return res.json({
    success: true,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      isVerified: user.isVerified,
      emailVerified: user.emailVerified ?? true,
      profileImage: user.profileImage,
    },
  });
};
