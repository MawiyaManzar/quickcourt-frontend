import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { useAuthStore } from '../../stores/authStore';
import styles from './ProfilePage.module.css';

export default function ProfilePage() {
  const { user, setUser } = useAuthStore();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Name cannot be empty');
      return;
    }

    setIsLoading(true);
    try {
      if (user) {
        const updatedUser = {
          ...user,
          name: name.trim(),
          avatar: avatar.trim() || undefined,
        };
        setUser(updatedUser);
        toast.success('Profile updated successfully!');
        setIsEditing(false);
      }
    } catch (err: any) {
      toast.error('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <Card variant="bordered" padding="lg" className={styles.profileCard}>
        <div className={styles.header}>
          <div className={styles.avatarWrapper}>
            {user?.avatar ? (
              <img src={user.avatar} alt={user.name} className={styles.avatarImg} />
            ) : (
              <div className={styles.avatarFallback}>
                {user?.name?.[0]?.toUpperCase() || 'U'}
              </div>
            )}
          </div>

          <div className={styles.identity}>
            <h2 className={styles.userName}>{user?.name}</h2>
            <p className={styles.userEmail}>{user?.email}</p>
            <div className={styles.badges}>
              <Badge variant="confirmed">{user?.role || 'USER'}</Badge>
              <Badge variant={user?.status === 'ACTIVE' ? 'active' : 'banned'}>
                {user?.status || 'ACTIVE'}
              </Badge>
            </div>
          </div>

          {!isEditing && (
            <Button
              variant="outline"
              size="sm"
              className={styles.editBtn}
              onClick={() => {
                setName(user?.name || '');
                setAvatar(user?.avatar || '');
                setIsEditing(true);
              }}
            >
              ✏️ Edit Profile
            </Button>
          )}
        </div>

        {isEditing ? (
          <form onSubmit={handleSave} className={styles.editForm}>
            <Input
              label="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your full name"
            />
            <Input
              label="Avatar Image URL"
              value={avatar}
              onChange={(e) => setAvatar(e.target.value)}
              placeholder="https://example.com/avatar.jpg"
              helperText="Provide an image URL or clear to use default"
            />
            <div className={styles.formActions}>
              <Button type="submit" isLoading={isLoading}>
                Save Changes
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsEditing(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <div className={styles.infoGrid}>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Account ID</span>
              <span className={styles.infoVal}>{user?.id || '—'}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Email Verification</span>
              <span className={styles.infoVal}>
                {user?.emailVerified ? '✅ Verified' : '⚠️ Pending'}
              </span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Role</span>
              <span className={styles.infoVal}>{user?.role}</span>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
