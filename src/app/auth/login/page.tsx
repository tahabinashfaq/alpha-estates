"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { EnhancedAuthForm } from "../../../components/EnhancedAuthForm";

export default function LoginPage() {
  const router = useRouter();

  const handleAuthSuccess = () => {
    // Redirect to dashboard after successful login
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      {/* Header */}
      <div className="w-full max-w-md mb-8">
        <Link href="/" className="flex items-center justify-center space-x-2">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">A</span>
          </div>
          <span className="text-2xl font-bold text-gray-900">Alpha Estates</span>
        </Link>
      </div>

      {/* Login Form */}
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md border border-gray-200">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back</h1>
          <p className="text-gray-600">Sign in to your account to continue</p>
        </div>

        <EnhancedAuthForm onAuth={handleAuthSuccess} initialMode="login" />

        <div className="text-center mt-6 pt-6 border-t border-gray-200">
          <p className="text-gray-600">
            Don&apos;t have an account?{" "}
            <Link
              href="/auth/register"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Sign up for free
            </Link>
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 text-center text-sm text-gray-500">
        <p>&copy; {new Date().getFullYear()} Alpha Estates. All rights reserved.</p>
      </div>
    </div>
  );
}
