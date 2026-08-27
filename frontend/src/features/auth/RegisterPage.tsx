import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { authApi } from './services/authApi';
import type { UserRole } from '../../types';
import styles from './RegisterPage.module.css';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirect');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'USER' as UserRole,
    avatar: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  // Password strength logic
  const calcPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: '', color: '' };
    let score = 0;
    if (pass.length >= 6) score++;
    if (pass.length >= 10) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;

    if (score <= 2) return { score: 1, label: 'Weak', color: 'var(--color-error)' };
    if (score <= 4) return { score: 2, label: 'Medium', color: 'var(--color-warning)' };
    return { score: 3, label: 'Strong', color: 'var(--color-success)' };
  };

  const strength = calcPasswordStrength(formData.password);

  const validate = () => {
    const errs: Record<string, string> = {};

    if (!formData.name.trim()) {
      errs.name = 'Full name is required';
    } else if (formData.name.trim().length < 2) {
      errs.name = 'Name must be at least 2 characters';
    }

    if (!formData.email.trim()) {
      errs.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errs.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      errs.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errs.password = 'Password must be at least 6 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      errs.confirmPassword = 'Passwords do not match';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      const res = await authApi.register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        avatar: formData.avatar || undefined,
      });

      toast.success(res.message || 'Registration successful! Verification code sent.');
      // Pass email and redirect to OTP page
      navigate('/auth/verify-otp', { state: { email: formData.email, redirect: redirectTo } });
    } catch (err: any) {
      toast.error(err.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className={styles.card} variant="bordered" padding="lg">
      <div className={styles.header}>
        <h2 className={styles.title}>Create Account</h2>
        <p className={styles.subtitle}>Join QuickCourt to discover and book local venues</p>
      </div>

      <form onSubmit={handleSubmit} className={styles.form} noValidate>
        {/* Role Selection */}
        <div className={styles.roleContainer}>
          <label className={styles.label}>Select Account Role</label>
          <div className={styles.roleGrid}>
            <button
              type="button"
              className={`${styles.roleCard} ${formData.role === 'USER' ? styles.activeRole : ''}`}
              onClick={() => setFormData((prev) => ({ ...prev, role: 'USER' }))}
            >
              <span className={styles.roleIcon}>👤</span>
              <div>
                <div className={styles.roleName}>Customer</div>
                <div className={styles.roleDesc}>Book courts & play</div>
              </div>
            </button>
            <button
              type="button"
              className={`${styles.roleCard} ${formData.role === 'FACILITY_OWNER' ? styles.activeRole : ''}`}
              onClick={() => setFormData((prev) => ({ ...prev, role: 'FACILITY_OWNER' }))}
            >
              <span className={styles.roleIcon}>🏢</span>
              <div>
                <div className={styles.roleName}>Facility Owner</div>
                <div className={styles.roleDesc}>List & manage courts</div>
              </div>
            </button>
          </div>
        </div>

        {/* Full Name */}
        <Input
          label="Full Name"
          placeholder="e.g. Rahul Sharma"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          error={errors.name}
          leftIcon={<span style={{ fontSize: 16 }}>👤</span>}
        />

        {/* Email */}
        <Input
          label="Email Address"
          type="email"
          placeholder="name@example.com"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          error={errors.email}
          leftIcon={<span style={{ fontSize: 16 }}>✉️</span>}
        />

        {/* Password */}
        <div>
          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            error={errors.password}
            leftIcon={<span style={{ fontSize: 16 }}>🔒</span>}
            rightIcon={
              <button
                type="button"
                className={styles.togglePassBtn}
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? '👁️' : '🙈'}
              </button>
            }
          />
          {formData.password && (
            <div className={styles.strengthMeter}>
              <div className={styles.strengthBars}>
                {[1, 2, 3].map((bar) => (
                  <div
                    key={bar}
                    className={styles.bar}
                    style={{
                      backgroundColor: bar <= strength.score ? strength.color : 'var(--color-border)',
                    }}
                  />
                ))}
              </div>
              <span className={styles.strengthText} style={{ color: strength.color }}>
                {strength.label}
              </span>
            </div>
          )}
        </div>

        {/* Confirm Password */}
        <Input
          label="Confirm Password"
          type={showPassword ? 'text' : 'password'}
          placeholder="••••••••"
          value={formData.confirmPassword}
          onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
          error={errors.confirmPassword}
          leftIcon={<span style={{ fontSize: 16 }}>🔑</span>}
        />

        {/* Optional Avatar URL */}
        <Input
          label="Avatar URL (Optional)"
          placeholder="https://example.com/avatar.jpg"
          value={formData.avatar}
          onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
          helperText="Leave empty to use a default generated avatar"
          leftIcon={<span style={{ fontSize: 16 }}>🖼️</span>}
        />

        <Button type="submit" size="lg" fullWidth isLoading={isLoading}>
          Create Account & Verify OTP
        </Button>
      </form>

      <div className={styles.footer}>
        Already have an account?{' '}
        <Link to={redirectTo ? `/auth/login?redirect=${encodeURIComponent(redirectTo)}` : '/auth/login'} className={styles.link}>
          Log in
        </Link>
      </div>
    </Card>
  );
}
