import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { useAuthStore } from '../../stores/authStore';
import { authApi } from './services/authApi';
import styles from './LoginPage.module.css';

export default function LoginPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!email.trim()) {
      errs.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errs.email = 'Please enter a valid email address';
    }
    if (!password) {
      errs.password = 'Password is required';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      const res = await authApi.login({ email, password });
      toast.success(res.message || 'Logged in successfully!');

      setAuth(res.data.user, res.data.token);
      const role = res.data.user.role;

      if (role === 'FACILITY_OWNER') navigate('/owner');
      else if (role === 'ADMIN') navigate('/admin');
      else navigate('/');
    } catch (err: any) {
      toast.error(err.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Quick fill helper for hackathon demoing
  const quickFill = (roleEmail: string) => {
    setEmail(roleEmail);
    setPassword('password123');
  };

  return (
    <Card className={styles.card} variant="bordered" padding="lg">
      <div className={styles.header}>
        <h2 className={styles.title}>Welcome Back</h2>
        <p className={styles.subtitle}>Log in to manage your bookings and facilities</p>
      </div>

      <form onSubmit={handleSubmit} className={styles.form} noValidate>
        {/* Quick Demo Shortcuts */}
        <div className={styles.demoSection}>
          <span className={styles.demoLabel}>Demo Quick-Fill:</span>
          <div className={styles.demoButtons}>
            <button
              type="button"
              className={styles.demoChip}
              onClick={() => quickFill('player@quickcourt.com')}
            >
              👤 Customer
            </button>
            <button
              type="button"
              className={styles.demoChip}
              onClick={() => quickFill('owner@quickcourt.com')}
            >
              🏢 Owner
            </button>
            <button
              type="button"
              className={styles.demoChip}
              onClick={() => quickFill('admin@quickcourt.com')}
            >
              👑 Admin
            </button>
          </div>
        </div>

        {/* Email */}
        <Input
          label="Email Address"
          type="email"
          placeholder="name@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
          leftIcon={<span style={{ fontSize: 16 }}>✉️</span>}
        />

        {/* Password */}
        <div>
          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
        </div>

        <Button type="submit" size="lg" fullWidth isLoading={isLoading}>
          Sign In
        </Button>
      </form>

      <div className={styles.footer}>
        Don't have an account?{' '}
        <Link to="/auth/register" className={styles.link}>
          Register here
        </Link>
      </div>
    </Card>
  );
}
