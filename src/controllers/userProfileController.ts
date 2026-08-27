import { Response } from 'express';
import { z } from 'zod';
import { db } from '../db';
import { users } from '../db/schema';
import { eq, and, ne } from 'drizzle-orm';
import { AuthenticatedRequest } from '../middleware/auth';

const updateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  profileImage: z.string().optional(),
});

// GET /api/users/profile - Get profile (PRD 12)
export const getUserProfile = async (req: AuthenticatedRequest, res: Response) => {
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
      profileImage: user.avatarUrl,
      createdAt: user.createdAt,
    },
  });
};

// PATCH /api/users/profile - Edit name, email, profile image (PRD 12)
export const updateUserProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const [user] = await db.select().from(users).where(eq(users.id, req.user.id)).limit(1);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const parsed = updateProfileSchema.parse(req.body);

    if (parsed.email && parsed.email.toLowerCase() !== user.email.toLowerCase()) {
      const emailLower = parsed.email.toLowerCase();
      // Check if email is already in use by another user
      const [existing] = await db
        .select()
        .from(users)
        .where(and(eq(users.email, emailLower), ne(users.id, user.id)))
        .limit(1);
      
      if (existing) {
        return res.status(400).json({ success: false, message: 'Email address is already in use by another account' });
      }
    }

    const [updatedUser] = await db
      .update(users)
      .set({
        ...(parsed.name ? { name: parsed.name } : {}),
        ...(parsed.email ? { email: parsed.email.toLowerCase() } : {}),
        ...(parsed.profileImage !== undefined ? { avatarUrl: parsed.profileImage } : {}),
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id))
      .returning();

    return res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        status: updatedUser.status,
        profileImage: updatedUser.avatarUrl,
      },
    });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message || 'Failed to update profile' });
  }
};
