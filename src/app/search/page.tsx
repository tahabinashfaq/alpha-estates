"use client";
import Link from "next/link";
import { PropertyListingsPage } from "../../components/PropertyListingsPage";

export default function SearchPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="  mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">A</span>
              </div>
              <span className="text-xl font-bold text-gray-900">Alpha Estates</span>
            </Link>

            <div className="hidden md:flex items-center space-x-8">
              <Link href="/properties" className="text-gray-700 hover:text-blue-600 font-medium">
                Buy
              </Link>
              <Link href="/properties?type=rent" className="text-gray-700 hover:text-blue-600 font-medium">
                Rent
              </Link>
              <Link href="/about" className="text-gray-700 hover:text-blue-600 font-medium">
                About
              </Link>
            </div>

            <div className="flex items-center space-x-4">
              <Link
                href="/auth/login"
                className="text-gray-700 hover:text-blue-600 font-medium"
              >
                Sign In
              </Link>
              <Link
                href="/auth/register"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Page Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="  mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-4">
            <Link href="/" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              ← Back to Home
            </Link>
            <span className="text-gray-300">|</span>
            <h1 className="text-3xl font-bold text-gray-900">Search Results</h1>
          </div>
          <p className="text-gray-600 mt-1">Properties matching your search criteria</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="  mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PropertyListingsPage />
      </div>
    </div>
  );
}
