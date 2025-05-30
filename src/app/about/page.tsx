/* eslint-disable react/no-unescaped-entities */
"use client";
import Link from "next/link";
import { Header } from "../../components/Header";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <Header currentPage="/about" />

      {/* Hero Section */}
      <div className="bg-white">
        <div className="  mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            About <span className="text-blue-600">Alpha Estates</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Your trusted partner in finding the perfect home. We're revolutionizing the real estate experience with modern technology and personalized service.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Mission Section */}
        <div className="bg-white rounded-lg shadow-sm border p-8 mb-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Mission</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              To make real estate transactions transparent, efficient, and accessible for everyone through innovative technology and exceptional service.
            </p>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Advanced Search</h3>
            <p className="text-gray-600">Find your dream home with our powerful search filters and smart recommendations.</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Verified Listings</h3>
            <p className="text-gray-600">All our properties are verified and updated in real-time for accuracy and reliability.</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Expert Support</h3>
            <p className="text-gray-600">Get personalized assistance from our team of experienced real estate professionals.</p>
          </div>
        </div>

        {/* Stats Section */}
        <div className="bg-blue-600 rounded-lg p-8 text-white text-center mb-16">
          <h2 className="text-3xl font-bold mb-8">Our Impact</h2>
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="text-4xl font-bold mb-2">10K+</div>
              <div className="text-blue-100">Properties Listed</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">5K+</div>
              <div className="text-blue-100">Happy Customers</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">500+</div>
              <div className="text-blue-100">Partner Agents</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">50+</div>
              <div className="text-blue-100">Cities Covered</div>
            </div>
          </div>
        </div>

        {/* Team Section */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Meet Our Team</h2>
          <p className="text-lg text-gray-600 mb-8 max-w-3xl mx-auto">
            Our dedicated team of real estate experts is committed to helping you find your perfect home.
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="w-20 h-20 bg-gray-300 rounded-full mx-auto mb-4"></div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">Sarah Johnson</h3>
              <p className="text-blue-600 font-medium mb-2">Chief Executive Officer</p>
              <p className="text-gray-600 text-sm">15+ years in real estate with a passion for innovation and customer service excellence.</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="w-20 h-20 bg-gray-300 rounded-full mx-auto mb-4"></div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">Michael Chen</h3>
              <p className="text-blue-600 font-medium mb-2">Head of Technology</p>
              <p className="text-gray-600 text-sm">Technology leader focused on building scalable platforms that enhance user experience.</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="w-20 h-20 bg-gray-300 rounded-full mx-auto mb-4"></div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">Emily Rodriguez</h3>
              <p className="text-blue-600 font-medium mb-2">Customer Success Director</p>
              <p className="text-gray-600 text-sm">Dedicated to ensuring every customer has an exceptional experience from start to finish.</p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Get Started?</h2>
          <p className="text-lg text-gray-600 mb-8">
            Join thousands of satisfied customers who have found their dream homes with Alpha Estates.
          </p>
          <div className="space-x-4">
            <Link href="/properties" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-colors">
              Browse Properties
            </Link>
            <Link href="/contact" className="bg-gray-100 hover:bg-gray-200 text-gray-900 px-8 py-3 rounded-lg font-medium transition-colors">
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
