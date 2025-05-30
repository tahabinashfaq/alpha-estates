// Enhanced Authentication Form with advanced features
// Components: EnhancedAuthForm with registration fields, password strength, validation

import { createUserWithEmailAndPassword, getAuth, signInWithEmailAndPassword, updateProfile, User } from 'firebase/auth';
import Image from 'next/image';
import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import { app } from '../firebase';

interface EnhancedAuthFormProps {
  onAuth: () => void;
  initialMode?: "login" | "register";
}

export function EnhancedAuthForm({ onAuth, initialMode = "login" }: EnhancedAuthFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [userType, setUserType] = useState<'buyer' | 'seller' | 'agent'>('buyer');
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [isLogin, setIsLogin] = useState(initialMode === "login");
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const auth = getAuth(app);

  useEffect(() => {
    setMounted(true);
    setIsLogin(initialMode === "login");
  }, [initialMode]);

  // Password strength calculator
  useEffect(() => {
    if (!isLogin && password) {
      let strength = 0;
      if (password.length >= 8) strength += 1;
      if (/[A-Z]/.test(password)) strength += 1;
      if (/[a-z]/.test(password)) strength += 1;
      if (/[0-9]/.test(password)) strength += 1;
      if (/[^A-Za-z0-9]/.test(password)) strength += 1;
      setPasswordStrength(strength);
    }
  }, [password, isLogin]);

  // Form validation functions
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  const validatePhoneNumber = (phone: string) => {
    // More flexible phone number validation - accepts international formats
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$|^[\+]?[(]?[\d\s\-\(\)]{7,20}$/;
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, ''); // Remove spaces, dashes, parentheses
    return phoneRegex.test(cleanPhone) || phone === '';
  };
  const getPasswordStrengthText = () => {
    const strengthLabels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Very Strong'];
    const strengthColors = ['text-red-500', 'text-orange-500', 'text-yellow-500', 'text-blue-500', 'text-green-500'];
    const index = Math.max(0, passwordStrength - 1); // Fix array indexing
    return {
      text: strengthLabels[index] || 'Very Weak',
      color: strengthColors[index] || 'text-red-500'
    };
  };

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="space-y-6">
        <div className="space-y-4">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
            <div className="h-12 bg-gray-200 rounded"></div>
          </div>
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
            <div className="h-12 bg-gray-200 rounded"></div>
          </div>
        </div>
        <div className="h-12 bg-gray-200 rounded animate-pulse"></div>
      </div>
    );
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    // Enhanced validation
    if (!email || !password) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    if (!isLogin) {
      // Registration-specific validation
      if (!firstName || !lastName) {
        setError('Please enter your first and last name');
        setLoading(false);
        return;
      }

      if (password !== confirmPassword) {
        setError('Passwords do not match');
        setLoading(false);
        return;
      }

      if (passwordStrength < 2) {
        setError('Please choose a stronger password (at least 8 characters with uppercase, lowercase, and numbers)');
        setLoading(false);
        return;
      } if (phoneNumber && !validatePhoneNumber(phoneNumber)) {
        setError('Please enter a valid phone number (numbers only, 7-15 digits)');
        setLoading(false);
        return;
      }

      if (!agreeToTerms) {
        setError('Please agree to the Terms of Service and Privacy Policy');
        setLoading(false);
        return;
      }
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    try {
      console.log('Attempting authentication with:', { email, isLogin, userType: !isLogin ? userType : undefined });

      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        console.log('Login successful!');
        setSuccess('Successfully signed in! Redirecting...');
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        console.log('Registration successful!', userCredential.user);

        // Update user profile with display name
        await updateProfile(userCredential.user, {
          displayName: `${firstName} ${lastName}`
        });

        // Here you could save additional user data to Firestore
        // await saveUserProfile(userCredential.user.uid, { firstName, lastName, phoneNumber, userType });

        setSuccess('Account created successfully! Redirecting...');
      }

      // Small delay to show success before redirect
      setTimeout(() => {
        setLoading(false);
        onAuth();
      }, 1000);

    } catch (err: unknown) {
      console.error('Authentication error:', err);
      setLoading(false);
      if (err instanceof Error) {
        // Parse Firebase error codes for better user messages
        let errorMessage = err.message;
        console.log('Full error object:', err);

        if (err.message.includes('auth/user-not-found')) {
          errorMessage = 'No account found with this email address';
        } else if (err.message.includes('auth/wrong-password')) {
          errorMessage = 'Incorrect password';
        } else if (err.message.includes('auth/email-already-in-use')) {
          errorMessage = 'An account with this email already exists';
        } else if (err.message.includes('auth/weak-password')) {
          errorMessage = 'Password is too weak (must be at least 6 characters)';
        } else if (err.message.includes('auth/invalid-email')) {
          errorMessage = 'Please enter a valid email address';
        } else if (err.message.includes('auth/operation-not-allowed')) {
          errorMessage = 'Email/password authentication is not enabled in Firebase Console. Please check your Firebase project settings.';
        } else if (err.message.includes('auth/invalid-api-key')) {
          errorMessage = 'Invalid Firebase API key. Please check your configuration.';
        } else if (err.message.includes('auth/network-request-failed')) {
          errorMessage = 'Network error. Please check your internet connection.';
        } else if (err.message.includes('400')) {
          errorMessage = 'Bad request - Email/password authentication may not be enabled in Firebase Console.';
        }
        setError(errorMessage);
      } else {
        setError('Authentication error occurred');
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        {/* Name fields for registration */}
        {!isLogin && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                First Name *
              </label>
              <input
                id="firstName"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                type="text"
                placeholder="John"
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
                required
                suppressHydrationWarning={true}
              />
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                Last Name *
              </label>
              <input
                id="lastName"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                type="text"
                placeholder="Doe"
                value={lastName}
                onChange={e => setLastName(e.target.value)}
                required
                suppressHydrationWarning={true}
              />
            </div>
          </div>
        )}

        {/* Email field */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Email address *
          </label>
          <input
            id="email"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
            type="email"
            placeholder="john.doe@example.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            suppressHydrationWarning={true}
          />
        </div>

        {/* Phone number for registration */}
        {!isLogin && (
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>            <input
              id="phone"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
              type="tel"
              placeholder="+1 (555) 123-4567 or your local format"
              value={phoneNumber}
              onChange={e => setPhoneNumber(e.target.value)}
              suppressHydrationWarning={true}
            />
          </div>
        )}

        {/* User type selection for registration */}
        {!isLogin && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              I am a *
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: 'buyer', label: 'Home Buyer', icon: '🏠' },
                { value: 'seller', label: 'Property Seller', icon: '💰' },
                { value: 'agent', label: 'Real Estate Agent', icon: '👔' }
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setUserType(option.value as 'buyer' | 'seller' | 'agent')}
                  className={`p-3 border-2 rounded-lg text-center transition-all ${userType === option.value
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                    }`}
                >
                  <div className="text-2xl mb-1">{option.icon}</div>
                  <div className="text-sm font-medium">{option.label}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Password field */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
            Password *
          </label>
          <div className="relative">
            <input
              id="password"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500 pr-12"
              type={showPassword ? "text" : "password"}
              placeholder={isLogin ? "Enter your password" : "Create a strong password"}
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              suppressHydrationWarning={true}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>

          {/* Password strength indicator for registration */}
          {!isLogin && password && (
            <div className="mt-2">
              <div className="flex items-center space-x-2">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${passwordStrength <= 1 ? 'bg-red-500' :
                      passwordStrength <= 2 ? 'bg-orange-500' :
                        passwordStrength <= 3 ? 'bg-yellow-500' :
                          passwordStrength <= 4 ? 'bg-blue-500' : 'bg-green-500'
                      }`}
                    style={{ width: `${(passwordStrength / 5) * 100}%` }}
                  ></div>
                </div>
                <span className={`text-sm font-medium ${getPasswordStrengthText().color}`}>
                  {getPasswordStrengthText().text}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Use 8+ characters with uppercase, lowercase, numbers, and symbols
              </p>
            </div>
          )}
        </div>

        {/* Confirm password for registration */}
        {!isLogin && (
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
              Confirm Password *
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500 pr-12"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
                suppressHydrationWarning={true}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
            {confirmPassword && password !== confirmPassword && (
              <p className="text-red-500 text-sm mt-1">Passwords do not match</p>
            )}
          </div>
        )}

        {/* Terms agreement for registration */}
        {!isLogin && (
          <div className="flex items-start space-x-3">
            <input
              id="terms"
              type="checkbox"
              checked={agreeToTerms}
              onChange={e => setAgreeToTerms(e.target.checked)}
              className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              required
            />
            <label htmlFor="terms" className="text-sm text-gray-600">
              I agree to the{' '}
              <a href="/privacy" className="text-blue-600 hover:text-blue-700 underline">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="/privacy" className="text-blue-600 hover:text-blue-700 underline">
                Privacy Policy
              </a>
            </label>
          </div>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Success message */}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          {success}
        </div>
      )}

      {/* Submit button */}
      <button
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors text-white py-3 rounded-lg font-semibold text-lg shadow-sm"
        type="submit"
        disabled={loading}
      >
        {loading ? (
          <div className="flex items-center justify-center space-x-2">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>{isLogin ? 'Signing in...' : 'Creating account...'}</span>
          </div>
        ) : (
          isLogin ? 'Sign In' : 'Create Account'
        )}
      </button>

      {/* Toggle between login/register */}
      {!isLogin && (
        <div className="text-center">
          <button
            type="button"
            className="text-gray-600 hover:text-gray-800 font-medium"
            onClick={() => setIsLogin(!isLogin)}
          >
            Already have an account? Sign in
          </button>
        </div>
      )}
    </form>
  );
}

// Keep existing components
interface UserProfileProps {
  user: User;
  onLogout: () => void;
}

export function UserProfile({ user, onLogout }: UserProfileProps) {
  return (
    <div className="max-w-sm mx-auto p-4 bg-white rounded-xl shadow-lg mt-6 border border-gray-200">
      <h2 className="text-xl font-bold mb-4 text-gray-900">Profile</h2>
      <div className="space-y-3">
        <div className="text-gray-600">
          <span className="font-medium">Name:</span> {user.displayName || 'Not set'}
        </div>
        <div className="text-gray-600">
          <span className="font-medium">Email:</span> {user.email}
        </div>
        <AvatarUpload user={user} />
        <button
          onClick={onLogout}
          className="w-full mt-4 bg-red-500 hover:bg-red-600 transition text-white py-2 px-4 rounded-lg font-semibold"
        >
          Logout
        </button>
      </div>
    </div>
  );
}

interface AvatarUploadProps {
  user: User;
}

export function AvatarUpload({ user }: AvatarUploadProps) {
  const [avatar, setAvatar] = useState(user.photoURL || '');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError('');
    const preset = process.env.NEXT_PUBLIC_CLOUDINARY_PRESET;
    const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD;
    if (!preset || !cloud) {
      setError('Cloudinary config missing');
      setUploading(false);
      return;
    }
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', preset);
    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloud}/image/upload`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      setAvatar(data.secure_url);
      // Optionally update Firebase user profile here
    } catch {
      setError('Upload failed');
    }
    setUploading(false);
  };

  return (
    <div className="flex flex-col items-center">
      {avatar && (
        <Image src={avatar} alt="Avatar" width={96} height={96} className="rounded-full mb-2 border-2 border-gray-200" />
      )}
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        disabled={uploading}
        className="mb-2 text-gray-600 bg-gray-50 p-2 rounded border border-gray-200 text-sm file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
      />
      {error && <div className="text-red-500 text-sm">{error}</div>}
    </div>
  );
}
