import { useState, useEffect, type SyntheticEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useAuthStore } from '../../stores/authStore';
import { userService } from './services/userService';
import styles from './ProfilePage.module.css';

export default function ProfilePage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const [name, setName] = useState<string>(user?.name || '');
  const [phone, setPhone] = useState<string>(user?.phone || '+91 98765 43210');

  useEffect(() => {
    userService.getCurrentUser().then((u) => {
      if (u) {
        setName(u.name || '');
        if (u.phone) setPhone(u.phone);
      }
    });
  }, []);

  const handleSaveProfile = async (e: SyntheticEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Name cannot be empty');
      return;
    }

    setIsSaving(true);
    try {
      await userService.updateProfile({ name: name.trim(), phone: phone.trim() });
      toast.success('Profile updated successfully');
      setIsEditing(false);
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const initialLetter = (user?.name || 'User')[0].toUpperCase();

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.profileHeader}>
          <div className={styles.avatarRing}>{initialLetter}</div>
          <div className={styles.headerMeta}>
            <h1 className={styles.userName}>{user?.name || 'QuickCourt User'}</h1>
            <span className={styles.userRoleBadge}>{user?.role || 'CUSTOMER'}</span>
          </div>
        </div>

        {!isEditing ? (
          <div className={styles.fieldsGrid}>
            <div className={styles.fieldRow}>
              <span className={styles.fieldLabel}>Full Name</span>
              <span className={styles.fieldVal}>{user?.name || 'Not provided'}</span>
            </div>

            <div className={styles.fieldRow}>
              <span className={styles.fieldLabel}>
                Email Address <span className={styles.readOnlyBadge}>(Read-only)</span>
              </span>
              <span className={styles.fieldVal}>{user?.email || 'player@quickcourt.com'}</span>
            </div>

            <div className={styles.fieldRow}>
              <span className={styles.fieldLabel}>Phone Number</span>
              <span className={styles.fieldVal}>{phone || '+91 98765 43210'}</span>
            </div>

            <div className={styles.fieldRow}>
              <span className={styles.fieldLabel}>Account Role</span>
              <span className={styles.fieldVal}>{user?.role || 'CUSTOMER'}</span>
            </div>

            <div className={styles.fieldRow}>
              <span className={styles.fieldLabel}>Member Since</span>
              <span className={styles.fieldVal}>
                {user?.createdAt
                  ? new Date(user.createdAt).toLocaleDateString('en-US', {
                      month: 'long',
                      year: 'numeric',
                    })
                  : 'January 2026'}
              </span>
            </div>

            <div className={styles.actionRow}>
              <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
              <Button variant="outline" onClick={() => navigate('/bookings')}>
                My Bookings →
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSaveProfile} className={styles.fieldsGrid}>
            <Input
              label="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your full name"
              required
            />

            <Input
              label="Email Address (Read-only)"
              value={user?.email || ''}
              disabled
            />

            <Input
              label="Phone Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98765 43210"
            />

            <div className={styles.actionRow}>
              <Button
                variant="outline"
                type="button"
                onClick={() => setIsEditing(false)}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button type="submit" isLoading={isSaving}>
                Save Changes
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
