import { Response } from 'express';
import { z } from 'zod';
import { mockUsers } from '../data/mockStore';
import { AuthenticatedRequest } from '../middleware/auth';

const updateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  profileImage: z.string().optional(),
});

// GET /api/users/profile - Get profile (PRD 12)
export const getUserProfile = (req: AuthenticatedRequest, res: Response) => {
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
      profileImage: user.profileImage,
      createdAt: user.createdAt,
    },
  });
};

// PATCH /api/users/profile - Edit name, email, profile image (PRD 12)
export const updateUserProfile = (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const userIndex = mockUsers.findIndex((u) => u.id === req.user?.id);
    if (userIndex === -1) return res.status(404).json({ success: false, message: 'User not found' });

    const parsed = updateProfileSchema.parse(req.body);
    const user = mockUsers[userIndex];

    if (parsed.email && parsed.email.toLowerCase() !== user.email.toLowerCase()) {
      const emailLower = parsed.email.toLowerCase();
      const existing = mockUsers.find((u) => u.email.toLowerCase() === emailLower && u.id !== user.id);
      if (existing) {
        return res.status(400).json({ success: false, message: 'Email address is already in use by another account' });
      }
    }

    const updatedUser = {
      ...user,
      ...parsed,
      updatedAt: new Date().toISOString(),
    };

    mockUsers[userIndex] = updatedUser;

    return res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        status: updatedUser.status,
        profileImage: updatedUser.profileImage,
      },
    });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message || 'Failed to update profile' });
  }
};
