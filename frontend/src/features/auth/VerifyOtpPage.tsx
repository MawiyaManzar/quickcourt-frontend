import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { useAuthStore } from '../../stores/authStore';
import { authApi } from './services/authApi';
import styles from './VerifyOtpPage.module.css';

export default function VerifyOtpPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  const initialEmail = (location.state as any)?.email || 'your email';
  const [email] = useState(initialEmail);
  const [otp, setOtp] = useState<string[]>(Array(6).fill(''));
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorShake, setErrorShake] = useState(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Timer effect for Resend button
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
      return () => clearInterval(interval);
    } else {
      setCanResend(true);
    }
  }, [timer]);

  // Focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // Take last char
    setOtp(newOtp);

    // Auto-advance to next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto submit if all filled
    const fullOtp = newOtp.join('');
    if (fullOtp.length === 6) {
      handleVerify(fullOtp);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split('');
      setOtp(digits);
      inputRefs.current[5]?.focus();
      handleVerify(pastedData);
    }
  };

  const handleVerify = async (codeToVerify?: string) => {
    const code = codeToVerify || otp.join('');
    if (code.length < 6) {
      toast.error('Please enter all 6 digits of the OTP');
      return;
    }

    setIsLoading(true);
    try {
      const res = await authApi.verifyOtp(email, code);
      toast.success(res.message || 'OTP verified successfully!');

      if (res.data?.user && res.data?.token) {
        setAuth(res.data.user, res.data.token);
        const role = res.data.user.role;
        if (role === 'FACILITY_OWNER') navigate('/owner');
        else if (role === 'ADMIN') navigate('/admin');
        else navigate('/');
      } else {
        navigate('/auth/login');
      }
    } catch (err: any) {
      setErrorShake(true);
      setTimeout(() => setErrorShake(false), 600);
      toast.error(err.message || 'OTP verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;
    try {
      const res = await authApi.resendOtp(email);
      toast.success(res.message || 'New OTP sent to your email.');
      setTimer(60);
      setCanResend(false);
      setOtp(Array(6).fill(''));
      inputRefs.current[0]?.focus();
    } catch (err: any) {
      toast.error(err.message || 'Failed to resend OTP');
    }
  };

  return (
    <Card className={`${styles.card} ${errorShake ? styles.shake : ''}`} variant="bordered" padding="lg">
      <div className={styles.header}>
        <div className={styles.iconCircle}>📱</div>
        <h2 className={styles.title}>OTP Verification</h2>
        <p className={styles.subtitle}>
          Enter the 6-digit code sent to <strong className={styles.emailText}>{email}</strong>
        </p>
        <span className={styles.hintTag}>Dev tip: Enter 123456</span>
      </div>

      <div className={styles.otpGrid} onPaste={handlePaste}>
        {otp.map((digit, index) => (
          <input
            key={index}
            ref={(el) => { inputRefs.current[index] = el; }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            className={`${styles.otpInput} ${digit ? styles.filled : ''}`}
            disabled={isLoading}
          />
        ))}
      </div>

      <Button
        onClick={() => handleVerify()}
        size="lg"
        fullWidth
        isLoading={isLoading}
        disabled={otp.join('').length < 6}
      >
        Verify & Activate Account
      </Button>

      <div className={styles.resendSection}>
        {canResend ? (
          <button type="button" className={styles.resendBtn} onClick={handleResend}>
            Resend OTP Code
          </button>
        ) : (
          <span className={styles.timerText}>Resend code in {timer}s</span>
        )}
      </div>

      <div className={styles.footer}>
        Need help? <Link to="/auth/login" className={styles.link}>Back to Login</Link>
      </div>
    </Card>
  );
}
