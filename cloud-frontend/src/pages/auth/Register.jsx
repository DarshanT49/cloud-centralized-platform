import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Sparkles
} from 'lucide-react';
import GoogleIcon from '../../components/GoogleIcon';
import authService from '../../services/authService';
import './Auth.css';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    agreeTerms: true
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });

  // Calculate password strength
  const getPasswordStrength = (pass) => {
    if (!pass) return { score: 0, label: '', class: '' };
    let score = 0;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score === 1) return { score: 1, label: 'Weak', class: 'weak' };
    if (score === 2) return { score: 2, label: 'Fair', class: 'fair' };
    if (score === 3) return { score: 3, label: 'Good', class: 'good' };
    if (score >= 4) return { score: 4, label: 'Strong', class: 'strong' };
    return { score: 0, label: '', class: '' };
  };

  const strength = getPasswordStrength(formData.password);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.fullName.trim() || !formData.email.trim() || !formData.password) {
      setStatusMessage({
        type: 'error',
        text: 'Please fill out all required fields.'
      });
      return;
    }

    if (formData.password.length < 8) {
      setStatusMessage({
        type: 'error',
        text: 'Password must be at least 8 characters long.'
      });
      return;
    }

    if (!formData.agreeTerms) {
      setStatusMessage({
        type: 'error',
        text: 'You must agree to the Terms of Service to continue.'
      });
      return;
    }

    setIsLoading(true);
    setStatusMessage({ type: '', text: '' });

    try {
      const response = await authService.register({
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password
      });

      setStatusMessage({
        type: 'success',
        text: response.message || 'Account registered successfully in database! Redirecting to login...'
      });

      if (response.user) {
        localStorage.setItem('currentUser', JSON.stringify(response.user));
      }

      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text: err.message || 'Registration failed. Please verify the backend server is running.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = () => {
    setIsLoading(true);
    setStatusMessage({
      type: 'success',
      text: 'Signing up with Google Account...'
    });

    setTimeout(() => {
      setIsLoading(false);
      navigate('/dashboard');
    }, 1400);
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-bg-glow"></div>

      <div className="auth-card">
        {/* Header */}
        <div className="auth-header">
          <div className="auth-icon-badge">
            <Sparkles size={24} />
          </div>
          <h1 className="auth-title">Create Account</h1>
          <p className="auth-subtitle">
            Get 15 GB of encrypted cloud storage free forever
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
          <span>Sign up with Google</span>
        </button>

        {/* Divider */}
        <div className="auth-divider">
          <span>Or register with email</span>
        </div>

        {/* Form */}
        <form className="auth-form" onSubmit={handleSubmit}>
          {/* Full Name */}
          <div className="form-group">
            <label className="form-label" htmlFor="register-name">
              Full Name
            </label>
            <div className="input-container">
              <span className="input-icon-left">
                <User size={18} />
              </span>
              <input
                id="register-name"
                type="text"
                name="fullName"
                className="form-control"
                placeholder="Alex Morgan"
                value={formData.fullName}
                onChange={handleChange}
                required
                autoComplete="name"
              />
            </div>
          </div>

          {/* Email */}
          <div className="form-group">
            <label className="form-label" htmlFor="register-email">
              Work or Personal Email
            </label>
            <div className="input-container">
              <span className="input-icon-left">
                <Mail size={18} />
              </span>
              <input
                id="register-email"
                type="email"
                name="email"
                className="form-control"
                placeholder="alex@example.com"
                value={formData.email}
                onChange={handleChange}
                required
                autoComplete="email"
              />
            </div>
          </div>

          {/* Password */}
          <div className="form-group">
            <label className="form-label" htmlFor="register-password">
              Password
            </label>
            <div className="input-container">
              <span className="input-icon-left">
                <Lock size={18} />
              </span>
              <input
                id="register-password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                className="form-control has-toggle"
                placeholder="Create a strong password"
                value={formData.password}
                onChange={handleChange}
                required
                autoComplete="new-password"
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

            {/* Password strength visualizer */}
            {formData.password && (
              <div className="password-strength-container">
                <div className="strength-bars">
                  <div className={`strength-bar ${strength.score >= 1 ? strength.class : ''}`} />
                  <div className={`strength-bar ${strength.score >= 2 ? strength.class : ''}`} />
                  <div className={`strength-bar ${strength.score >= 3 ? strength.class : ''}`} />
                  <div className={`strength-bar ${strength.score >= 4 ? strength.class : ''}`} />
                </div>
                <div className="strength-text">
                  <span>Strength: {strength.label}</span>
                  <span>Minimum 8 characters</span>
                </div>
              </div>
            )}
          </div>

          {/* Terms Checkbox */}
          <div className="form-options-row">
            <label className="form-checkbox-label">
              <input
                type="checkbox"
                name="agreeTerms"
                className="form-checkbox"
                checked={formData.agreeTerms}
                onChange={handleChange}
              />
              <span style={{ fontSize: '0.825rem' }}>
                I agree to the <a href="#terms" className="forgot-link">Terms</a> & <a href="#privacy" className="forgot-link">Privacy Policy</a>
              </span>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="btn btn-primary auth-submit-btn"
            disabled={isLoading}
          >
            <span>{isLoading ? 'Generating Vault Keys...' : 'Create Vault Account'}</span>
            {!isLoading && <ArrowRight size={18} />}
          </button>
        </form>

        {/* Switch Link */}
        <p className="auth-switch-text">
          Already have an account?
          <Link to="/login" className="auth-switch-link">
            Sign in
          </Link>
        </p>

        {/* Security Notice */}
        <div className="auth-security-notice">
          <ShieldCheck size={16} />
          <span>Zero-knowledge encryption keys generated locally</span>
        </div>
      </div>
    </div>
  );
};

export default Register;
