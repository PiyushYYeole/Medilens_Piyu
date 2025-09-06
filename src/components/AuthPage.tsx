import React, { useState } from 'react';
import MedicalLogo from './MedicalLogo';
import { User } from '../App';
import ThemeToggle from './ThemeToggle';
import TermsModal from './TermsModal';

interface AuthPageProps {
  onLogin: (user: User) => void;
}

interface StoredUser {
  email: string;
  name: string;
  password: string;
}

const AuthPage: React.FC<AuthPageProps> = ({ onLogin }) => {
  const [activeTab, setActiveTab] = useState<'login' | 'signup' | 'reset'>('login');
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  // Get stored users from localStorage
  const getStoredUsers = (): StoredUser[] => {
    const users = localStorage.getItem('medilens-users');
    return users ? JSON.parse(users) : [];
  };

  // Save user to localStorage
  const saveUser = (user: StoredUser) => {
    const users = getStoredUsers();
    users.push(user);
    localStorage.setItem('medilens-users', JSON.stringify(users));
  };

  // Find user by email
  const findUser = (email: string): StoredUser | undefined => {
    const users = getStoredUsers();
    return users.find(user => user.email.toLowerCase() === email.toLowerCase());
  };

  // Update user password
  const updateUserPassword = (email: string, newPassword: string) => {
    const users = getStoredUsers();
    const userIndex = users.findIndex(user => user.email.toLowerCase() === email.toLowerCase());
    if (userIndex !== -1) {
      users[userIndex].password = newPassword;
      localStorage.setItem('medilens-users', JSON.stringify(users));
    }
  };

  // Password validation
  const validatePassword = (password: string): { isValid: boolean; message: string } => {
    if (password.length < 6) {
      return { isValid: false, message: 'Password must be at least 6 characters long' };
    }
    if (!/(?=.*[a-z])/.test(password)) {
      return { isValid: false, message: 'Password must contain at least one lowercase letter' };
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      return { isValid: false, message: 'Password must contain at least one uppercase letter' };
    }
    if (!/(?=.*\d)/.test(password)) {
      return { isValid: false, message: 'Password must contain at least one number' };
    }
    return { isValid: true, message: '' };
  };

  // Email validation
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setShowError(false);
    setShowSuccess(false);
    setErrorMessage('');
    setSuccessMessage('');

    const formData = new FormData(event.currentTarget);
    const email = (formData.get('email') as string)?.trim();
    const password = formData.get('password') as string;
    const name = (formData.get('name') as string)?.trim();
    const confirmPassword = formData.get('confirmPassword') as string;

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    try {
      if (activeTab === 'signup') {
        // Check if terms are accepted
        if (!acceptedTerms) {
          throw new Error('You must accept the Terms & Conditions to create an account');
        }

        // Signup validation
        if (!name || name.length < 2) {
          throw new Error('Name must be at least 2 characters long');
        }

        if (!validateEmail(email)) {
          throw new Error('Please enter a valid email address');
        }

        const passwordValidation = validatePassword(password);
        if (!passwordValidation.isValid) {
          throw new Error(passwordValidation.message);
        }

        if (password !== confirmPassword) {
          throw new Error('Passwords do not match');
        }

        // Check if user already exists
        const existingUser = findUser(email);
        if (existingUser) {
          throw new Error('An account with this email already exists');
        }

        // Create new user
        const newUser: StoredUser = { email, name, password };
        saveUser(newUser);

        setSuccessMessage('Account created successfully! You are now logged in.');
        setShowSuccess(true);

        setTimeout(() => {
          onLogin({ email, name });
        }, 1500);

      } else if (activeTab === 'login') {
        // Login validation
        if (!validateEmail(email)) {
          throw new Error('Please enter a valid email address');
        }

        if (!password) {
          throw new Error('Please enter your password');
        }

        // Check credentials
        const user = findUser(email);
        if (!user || user.password !== password) {
          throw new Error('Invalid username or password');
        }

        setSuccessMessage('Login successful! Welcome back.');
        setShowSuccess(true);

        setTimeout(() => {
          onLogin({ email: user.email, name: user.name });
        }, 1000);

      } else if (activeTab === 'reset') {
        // Password reset
        if (!validateEmail(email)) {
          throw new Error('Please enter a valid email address');
        }

        const user = findUser(email);
        if (!user) {
          throw new Error('No account found with this email address');
        }

        const passwordValidation = validatePassword(password);
        if (!passwordValidation.isValid) {
          throw new Error(passwordValidation.message);
        }

        if (password !== confirmPassword) {
          throw new Error('Passwords do not match');
        }

        // Update password
        updateUserPassword(email, password);

        setSuccessMessage('Password reset successfully! You can now log in with your new password.');
        setShowSuccess(true);

        setTimeout(() => {
          setActiveTab('login');
          setShowSuccess(false);
        }, 2000);
      }

    } catch (error) {
      setErrorMessage((error as Error).message);
      setShowError(true);
    }

    setIsLoading(false);
  };

  const handleForgotPassword = () => {
    setActiveTab('reset');
    setShowError(false);
    setShowSuccess(false);
  };

  const getTabTitle = () => {
    switch (activeTab) {
      case 'login': return 'Welcome Back!';
      case 'signup': return 'Join MediLens';
      case 'reset': return 'Reset Password';
      default: return 'Welcome!';
    }
  };

  const getTabSubtitle = () => {
    switch (activeTab) {
      case 'login': return 'Sign in to your MediLens account';
      case 'signup': return 'Create your healthcare AI account';
      case 'reset': return 'Enter your email and new password';
      default: return '';
    }
  };

  return (
    <div className="page auth-page active min-h-screen flex items-center justify-center p-5">
      {/* Theme toggle in top right corner */}
      <div className="fixed top-6 right-6 z-50">
        <ThemeToggle />
      </div>
      
      <div className="main-container bg-[var(--glass-bg)] backdrop-blur-[30px] border border-[var(--glass-border)] rounded-3xl p-10 w-full max-w-[450px] shadow-[0_25px_50px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.1)] animate-[containerGlow_0.8s_ease-out]">
        <div className="logo-section text-center mb-10">
          <div className="mx-auto mb-6">
            <MedicalLogo size={120} />
          </div>
          <h1 className="brand-title font-['Orbitron'] text-[3.2rem] font-bold bg-gradient-to-r from-[var(--primary-cyan)] via-[#4dd8c4] via-[#7d9ff7] to-[var(--primary-purple)] bg-clip-text text-transparent mb-3 tracking-[0.05em] animate-[titleGlow_3s_ease-in-out_infinite_alternate]">
            MediLens
          </h1>
          <p className="brand-subtitle font-['Space_Grotesk'] text-[var(--text-secondary)] text-lg font-medium mb-8 tracking-[0.03em] uppercase">
            Clarity • Innovation • Care
          </p>
        </div>

        {activeTab !== 'reset' && (
          <div className="auth-tabs grid grid-cols-2 bg-[rgba(255,255,255,0.05)] rounded-2xl p-1 mb-8 relative">
            <div
              className={`auth-tab p-4 text-center rounded-xl cursor-pointer transition-all duration-[400ms] cubic-bezier-[0.4,0,0.2,1] font-['Space_Grotesk'] font-semibold text-sm tracking-[0.02em] uppercase relative z-[2] ${
                activeTab === 'login'
                  ? 'bg-gradient-to-r from-[var(--primary-cyan)] to-[var(--primary-purple)] text-white shadow-[0_8px_25px_rgba(0,212,170,0.3)] transform -translate-y-[1px]'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[rgba(255,255,255,0.08)]'
              }`}
              onClick={() => setActiveTab('login')}
            >
              LOGIN
            </div>
            <div
              className={`auth-tab p-4 text-center rounded-xl cursor-pointer transition-all duration-[400ms] cubic-bezier-[0.4,0,0.2,1] font-['Space_Grotesk'] font-semibold text-sm tracking-[0.02em] uppercase relative z-[2] ${
                activeTab === 'signup'
                  ? 'bg-gradient-to-r from-[var(--primary-cyan)] to-[var(--primary-purple)] text-white shadow-[0_8px_25px_rgba(0,212,170,0.3)] transform -translate-y-[1px]'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[rgba(255,255,255,0.08)]'
              }`}
              onClick={() => setActiveTab('signup')}
            >
              SIGN UP
            </div>
          </div>
        )}

        {activeTab === 'reset' && (
          <div className="reset-header text-center mb-6">
            <button
              onClick={() => setActiveTab('login')}
              className="back-button text-[var(--primary-cyan)] text-sm hover:text-[var(--text-primary)] transition-colors duration-200 mb-4"
            >
              ← Back to Login
            </button>
          </div>
        )}

        {showSuccess && (
          <div className="success-message bg-[rgba(0,212,170,0.1)] border border-[rgba(0,212,170,0.3)] rounded-xl p-3 text-[var(--primary-cyan)] text-sm mb-5 text-center">
            {successMessage}
          </div>
        )}

        {showError && (
          <div className="error-message bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.3)] rounded-xl p-3 text-[#ef4444] text-sm mb-5 text-center">
            {errorMessage}
            {errorMessage === 'Invalid username or password' && (
              <div className="mt-2">
                <button
                  onClick={handleForgotPassword}
                  className="text-[var(--primary-cyan)] hover:text-[var(--text-primary)] transition-colors duration-200 text-xs underline"
                >
                  Reset Password
                </button>
              </div>
            )}
          </div>
        )}

        <form className="auth-form animate-[slideIn_0.4s_cubic-bezier(0.4,0,0.2,1)]" onSubmit={handleSubmit}>
          <div className="tab-header text-center mb-6">
            <h2 className="tab-title font-['Orbitron'] text-[var(--text-primary)] text-2xl font-semibold mb-2 tracking-[0.02em]">
              {getTabTitle()}
            </h2>
            <p className="tab-subtitle font-['Space_Grotesk'] text-[var(--text-secondary)] text-sm font-normal tracking-[0.01em]">
              {getTabSubtitle()}
            </p>
          </div>

          {(activeTab === 'signup') && (
            <div className="form-group mb-[18px]">
              <input
                type="text"
                name="name"
                className="form-input w-full p-[14px_16px] bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.12)] rounded-xl text-[var(--text-primary)] text-sm transition-all duration-300 cubic-bezier-[0.4,0,0.2,1] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--primary-cyan)] focus:shadow-[0_0_0_3px_rgba(0,212,170,0.15)] focus:bg-[rgba(255,255,255,0.12)]"
                placeholder="Full Name"
                required
              />
            </div>
          )}

          <div className="form-group mb-[18px]">
            <input
              type="email"
              name="email"
              className="form-input w-full p-[14px_16px] bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.12)] rounded-xl text-[var(--text-primary)] text-sm transition-all duration-300 cubic-bezier-[0.4,0,0.2,1] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--primary-cyan)] focus:shadow-[0_0_0_3px_rgba(0,212,170,0.15)] focus:bg-[rgba(255,255,255,0.12)]"
              placeholder="Email Address"
              required
            />
          </div>

          <div className="form-group mb-[18px]">
            <input
              type="password"
              name="password"
              className="form-input w-full p-[14px_16px] bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.12)] rounded-xl text-[var(--text-primary)] text-sm transition-all duration-300 cubic-bezier-[0.4,0,0.2,1] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--primary-cyan)] focus:shadow-[0_0_0_3px_rgba(0,212,170,0.15)] focus:bg-[rgba(255,255,255,0.12)]"
              placeholder={activeTab === 'reset' ? 'New Password' : 'Password'}
              required
            />
          </div>

          {(activeTab === 'signup' || activeTab === 'reset') && (
            <div className="form-group mb-[18px]">
              <input
                type="password"
                name="confirmPassword"
                className="form-input w-full p-[14px_16px] bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.12)] rounded-xl text-[var(--text-primary)] text-sm transition-all duration-300 cubic-bezier-[0.4,0,0.2,1] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--primary-cyan)] focus:shadow-[0_0_0_3px_rgba(0,212,170,0.15)] focus:bg-[rgba(255,255,255,0.12)]"
                placeholder="Confirm Password"
                required
              />
            </div>
          )}

          {activeTab === 'signup' && (
            <div className="password-requirements text-xs text-[var(--text-muted)] mb-4 p-3 bg-[rgba(255,255,255,0.05)] rounded-lg">
              <p className="mb-1">Password must contain:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>At least 6 characters</li>
                <li>One uppercase letter</li>
                <li>One lowercase letter</li>
                <li>One number</li>
              </ul>
            </div>
          )}

          {activeTab === 'signup' && (
            <div className="terms-checkbox mb-[18px]">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="mt-1 w-4 h-4 text-[var(--primary-cyan)] bg-[rgba(255,255,255,0.08)] border border-[var(--glass-border)] rounded focus:ring-[var(--primary-cyan)] focus:ring-2"
                />
                <span className="text-sm text-[var(--text-secondary)] leading-[1.4]">
                  I agree to the{' '}
                  <button
                    type="button"
                    onClick={() => setShowTermsModal(true)}
                    className="text-[var(--primary-cyan)] hover:text-[var(--text-primary)] transition-colors duration-200 underline font-medium"
                  >
                    Terms & Conditions and Privacy Policy
                  </button>
                </span>
              </label>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || (activeTab === 'signup' && !acceptedTerms)}
            className="auth-button w-full p-4 bg-gradient-to-r from-[var(--primary-cyan)] to-[var(--primary-purple)] text-white border-none rounded-xl font-['Space_Grotesk'] text-base font-bold tracking-[0.05em] uppercase cursor-pointer transition-all duration-300 cubic-bezier-[0.4,0,0.2,1] mt-2 relative overflow-hidden hover:transform hover:-translate-y-[2px] hover:shadow-[0_15px_40px_rgba(0,212,170,0.4)] active:transform active:translate-y-0 before:content-[''] before:absolute before:top-0 before:-left-full before:w-full before:h-full before:bg-gradient-to-r before:from-transparent before:via-[rgba(255,255,255,0.2)] before:to-transparent before:transition-[left_0.6s_ease] hover:before:left-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {activeTab === 'login' && 'LOG IN'}
            {activeTab === 'signup' && 'CREATE ACCOUNT'}
            {activeTab === 'reset' && 'RESET PASSWORD'}
            {isLoading && (
              <div className="loading w-[18px] h-[18px] border-2 border-[rgba(255,255,255,0.3)] border-t-white rounded-full animate-spin ml-2"></div>
            )}
          </button>

          <div className="auth-footer text-center mt-6">
            {activeTab === 'login' && (
              <a
                href="#"
                className="auth-link text-[var(--primary-cyan)] no-underline font-medium text-sm transition-colors duration-200 hover:text-[var(--text-primary)]"
                onClick={(e) => {
                  e.preventDefault();
                  handleForgotPassword();
                }}
              >
                Forgot your password?
              </a>
            )}
            {activeTab === 'signup' && (
              <a
                href="#"
                className="auth-link text-[var(--primary-cyan)] no-underline font-medium text-sm transition-colors duration-200 hover:text-[var(--text-primary)]"
                onClick={(e) => {
                  e.preventDefault();
                  setActiveTab('login');
                }}
              >
                Already have an account? Log in
              </a>
            )}
          </div>
        </form>
      </div>

      {/* Terms & Conditions Modal */}
      <TermsModal
        isOpen={showTermsModal}
        onClose={() => setShowTermsModal(false)}
      />
    </div>
  );
};

export default AuthPage;