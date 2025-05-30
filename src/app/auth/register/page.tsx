"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { EnhancedAuthForm } from "../../../components/EnhancedAuthForm";

export default function RegisterPage() {
  const router = useRouter();

  const handleAuthSuccess = () => {
    // Redirect to dashboard after successful registration
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-12">
      {/* Header */}
      <div className="w-full max-w-lg mb-8">
        <Link href="/" className="flex items-center justify-center space-x-2">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">A</span>
          </div>
          <span className="text-2xl font-bold text-gray-900">Alpha Estates</span>
        </Link>
      </div>

      {/* Register Form */}
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-lg border border-gray-200">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create your account</h1>
          <p className="text-gray-600">Start your journey to finding the perfect property</p>
        </div>

        <EnhancedAuthForm onAuth={handleAuthSuccess} initialMode="register" />

      </div>

      {/* Footer */}
      <div className="mt-8 text-center text-sm text-gray-500">
        <p>&copy; {new Date().getFullYear()} Alpha Estates. All rights reserved.</p>
      </div>
    </div>
  );
}
