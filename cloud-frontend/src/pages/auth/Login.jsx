import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Cloud,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import GoogleIcon from '../../components/GoogleIcon';
import './Auth.css';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setStatusMessage({
        type: 'error',
        text: 'Please enter both your email address and password.'
      });
      return;
    }

    setIsLoading(true);
    setStatusMessage({ type: '', text: '' });

    // Simulate authentication
    setTimeout(() => {
      setIsLoading(false);
      const emailUsername = formData.email ? formData.email.split('@')[0] : 'Alex Rivera';
      const formattedName = emailUsername.charAt(0).toUpperCase() + emailUsername.slice(1);
      const user = {
        fullName: formattedName,
        email: formData.email,
        role: 'PRO MEMBER',
        storageUsed: '64.2 GB',
        storageTotal: '100 GB',
        storagePercent: 64
      };
      localStorage.setItem('currentUser', JSON.stringify(user));

      setStatusMessage({
        type: 'success',
        text: 'Authentication successful! Redirecting to your vault...'
      });

      setTimeout(() => {
        const destination = location.state?.from?.pathname || '/dashboard';
        navigate(destination, { replace: true });
      }, 1000);
    }, 1200);
  };

  const handleGoogleAuth = () => {
    setIsLoading(true);
    const googleUser = {
      fullName: 'Alex Rivera (Google)',
      email: 'alex.rivera@gmail.com',
      role: 'PRO MEMBER',
      storageUsed: '64.2 GB',
      storageTotal: '100 GB',
      storagePercent: 64
    };
    localStorage.setItem('currentUser', JSON.stringify(googleUser));

    setStatusMessage({
      type: 'success',
      text: 'Connecting with Google Account...'
    });

    setTimeout(() => {
      setIsLoading(false);
      const destination = location.state?.from?.pathname || '/dashboard';
      navigate(destination, { replace: true });
    }, 1400);
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-bg-glow"></div>

      <div className="auth-card">
        {/* Header */}
        <div className="auth-header">
          <div className="auth-icon-badge">
            <Cloud size={24} />
          </div>
          <h1 className="auth-title">Welcome Back</h1>
          <p className="auth-subtitle">
            Sign in to access your encrypted files and workspaces
          </p>
        </div>

        {/* Feedback Alert */}
        {statusMessage.text && (
          <div className={`auth-alert auth-alert-${statusMessage.type}`}>
            {statusMessage.type === 'success' ? (
              <CheckCircle2 size={18} />
            ) : (
              <AlertCircle size={18} />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* Google Authentication Button */}
        <button
          type="button"
          className="google-auth-btn"
          onClick={handleGoogleAuth}
          disabled={isLoading}
        >
          <GoogleIcon size={20} />
          <span>Continue with Google</span>
        </button>

        {/* Divider */}
        <div className="auth-divider">
          <span>Or sign in with email</span>
        </div>

        {/* Form */}
        <form className="auth-form" onSubmit={handleSubmit}>
          {/* Email */}
          <div className="form-group">
            <label className="form-label" htmlFor="login-email">
              Email Address
            </label>
            <div className="input-container">
              <span className="input-icon-left">
                <Mail size={18} />
              </span>
              <input
                id="login-email"
                type="email"
                name="email"
                className="form-control"
                placeholder="name@company.com"
                value={formData.email}
                onChange={handleChange}
                required
                autoComplete="email"
              />
            </div>
          </div>

          {/* Password */}
          <div className="form-group">
            <label className="form-label" htmlFor="login-password">
              Password
            </label>
            <div className="input-container">
              <span className="input-icon-left">
                <Lock size={18} />
              </span>
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                className="form-control has-toggle"
                placeholder="••••••••••••"
                value={formData.password}
                onChange={handleChange}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                className="input-password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Options Row */}
          <div className="form-options-row">
            <label className="form-checkbox-label">
              <input
                type="checkbox"
                name="rememberMe"
                className="form-checkbox"
                checked={formData.rememberMe}
                onChange={handleChange}
              />
              <span>Remember me</span>
            </label>
            <a href="#forgot" className="forgot-link" onClick={(e) => { e.preventDefault(); alert('Password reset link sent to your registered email.'); }}>
              Forgot password?
            </a>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="btn btn-primary auth-submit-btn"
            disabled={isLoading}
          >
            <span>{isLoading ? 'Decrypting Vault...' : 'Sign In to Drive'}</span>
            {!isLoading && <ArrowRight size={18} />}
          </button>
        </form>

        {/* Switch Link */}
        <p className="auth-switch-text">
          Don't have an account?
          <Link to="/register" className="auth-switch-link">
            Create account
          </Link>
        </p>

        {/* Security Notice */}
        <div className="auth-security-notice">
          <ShieldCheck size={16} />
          <span>Protected by 256-bit zero-knowledge encryption</span>
        </div>
      </div>
    </div>
  );
};

export default Login;
