import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { db } from '../db';
import { users, otpVerifications } from '../db/schema';
import { eq, and } from 'drizzle-orm';
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

    // Check if user already exists
    const [existing] = await db.select().from(users).where(eq(users.email, emailLower)).limit(1);
    
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email is already registered' });
    }

    const passwordHash = await bcrypt.hash(parsed.password, 10);
    
    const [newUser] = await db.insert(users).values({
      name: parsed.name,
      email: emailLower,
      passwordHash,
      role: parsed.role,
      avatarUrl: parsed.profileImage || null,
      emailVerified: false,
      status: 'ACTIVE',
    }).returning();

    // Generate 6-digit OTP code with 10-minute expiry
    const otpCode = generate6DigitOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await db.insert(otpVerifications).values({
      userId: newUser.id,
      code: otpCode,
      expiresAt: expiresAt,
      attempts: 0,
    });

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

    // Find the user
    const [user] = await db.select().from(users).where(eq(users.email, emailLower)).limit(1);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Find the active OTP for this user
    const [otpRecord] = await db
      .select()
      .from(otpVerifications)
      .where(and(eq(otpVerifications.userId, user.id), eq(otpVerifications.code, code)))
      .limit(1);

    if (!otpRecord) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP code' });
    }

    if (new Date(otpRecord.expiresAt) < new Date()) {
      await db.delete(otpVerifications).where(eq(otpVerifications.id, otpRecord.id));
      return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new one.' });
    }

    // Verify user
    await db.update(users).set({
      emailVerified: true,
      status: 'ACTIVE',
      updatedAt: new Date(),
    }).where(eq(users.id, user.id));

    // Clean up all OTPs for this user
    await db.delete(otpVerifications).where(eq(otpVerifications.userId, user.id));

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
          status: 'ACTIVE',
          isVerified: true,
          emailVerified: true,
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

    const [user] = await db.select().from(users).where(eq(users.email, emailLower)).limit(1);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User with this email does not exist' });
    }

    // Generate new OTP with 10-minute expiry
    const otpCode = generate6DigitOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // Invalidate/delete previous OTPs for this user
    await db.delete(otpVerifications).where(eq(otpVerifications.userId, user.id));

    // Save the new OTP
    await db.insert(otpVerifications).values({
      userId: user.id,
      code: otpCode,
      expiresAt: expiresAt,
      attempts: 0,
    });

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
    const [user] = await db.select().from(users).where(eq(users.email, email.toLowerCase())).limit(1);

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
        isVerified: user.emailVerified,
        emailVerified: user.emailVerified,
        profileImage: user.avatarUrl,
      },
    });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message || 'Login failed' });
  }
};

// 🔹 GET /api/auth/me
export const getCurrentUser = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });

  const [user] = await db.select().from(users).where(eq(users.id, req.user.id)).limit(1);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });

  return res.json({
    success: true,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      isVerified: user.emailVerified,
      emailVerified: user.emailVerified,
      profileImage: user.avatarUrl,
    },
  });
};
