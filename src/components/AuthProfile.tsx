/* eslint-disable @typescript-eslint/no-unused-vars */
// Authentication and user profile logic using Firebase Auth and Cloudinary for avatar upload
// Components: AuthForm, UserProfile, AvatarUpload

import { createUserWithEmailAndPassword, getAuth, signInWithEmailAndPassword, User } from 'firebase/auth';
import Image from 'next/image';
import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import { app } from '../firebase';

interface AuthFormProps {
  onAuth: () => void;
  initialMode?: "login" | "register";
}

export function AuthForm({ onAuth, initialMode = "login" }: AuthFormProps) {
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

    // Test Firebase configuration
    console.log('Firebase Auth instance:', auth);
    console.log('Firebase App:', app);
    console.log('Auth config:', auth.config);
  }, [initialMode, auth]);

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
    const phoneRegex = /^(\+1-?)?(\([0-9]{3}\)|[0-9]{3})[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4}$/;
    return phoneRegex.test(phone) || phone === '';
  };

  const getPasswordStrengthText = () => {
    const strengthLabels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
    const strengthColors = ['text-red-500', 'text-orange-500', 'text-yellow-500', 'text-blue-500', 'text-green-500'];
    return {
      text: strengthLabels[passwordStrength] || 'Very Weak',
      color: strengthColors[passwordStrength] || 'text-red-500'
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
  } const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
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
      }

      if (phoneNumber && !validatePhoneNumber(phoneNumber)) {
        setError('Please enter a valid phone number');
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
      if (err instanceof Error) {        // Parse Firebase error codes for better user messages
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
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Email address
          </label>          <input
            id="email"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            suppressHydrationWarning={true}
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
            Password
          </label>          <input
            id="password"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            suppressHydrationWarning={true}
          />
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}      <button
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

      {!isLogin && (
        <button
          type="button"
          className="w-full text-gray-600 hover:text-gray-800 font-medium text-center"
          onClick={() => setIsLogin(!isLogin)}
        >
          Already have an account? Sign in
        </button>
      )}
    </form>
  );
}

interface UserProfileProps {
  user: User;
  onLogout: () => void;
}

export function UserProfile({ user, onLogout }: UserProfileProps) {
  return (
    <div className="max-w-sm mx-auto p-4 bg-[#181c23] rounded-xl shadow-lg mt-6 border border-[#232a36] text-white">
      <h2 className="text-xl font-bold mb-2">Profile</h2>
      <div className="mb-2">Email: {user.email}</div>
      <AvatarUpload user={user} />
      <button
        onClick={onLogout}
        className="mt-4 bg-red-500 hover:bg-red-600 transition text-white p-2 rounded font-semibold"
      >
        Logout
      </button>
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
        <Image src={avatar} alt="Avatar" width={96} height={96} className="rounded-full mb-2 border-2 border-[#232a36]" />
      )}
      <input type="file" accept="image/*" onChange={handleFileChange} disabled={uploading} className="mb-2 text-white bg-[#232a36] p-2 rounded border border-[#232a36]" />
      {error && <div className="text-red-500">{error}</div>}
    </div>
  );
}
