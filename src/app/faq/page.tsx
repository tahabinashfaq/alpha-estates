"use client";
import Link from 'next/link';
import { useState } from 'react';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  
  category: string;
}

export default function EnhancedFAQPage() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [openFAQ, setOpenFAQ] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const faqData: FAQItem[] = [
    // General Questions
    {
      id: '1',
      question: 'What is Alpha Estates?',
      answer: 'Alpha Estates is a comprehensive real estate platform that connects buyers, sellers, and agents. We provide tools for property listings, advanced search, virtual tours, and seamless communication between all parties.',
      category: 'general'
    },
    {
      id: '2',
      question: 'How do I create an account?',
      answer: 'Click on "Sign Up" in the top navigation, choose your user type (buyer, seller, or agent), fill in your personal information, and verify your email address. Your account will be ready to use immediately.',
      category: 'general'
    },
    {
      id: '3',
      question: 'Is Alpha Estates free to use?',
      answer: 'Basic browsing and searching is completely free. Listing properties may have fees depending on your plan. Contact us for detailed pricing information.',
      category: 'general'
    },

    // For Buyers
    {
      id: '4',
      question: 'How do I search for properties?',
      answer: 'Use our advanced search filters to find properties by location, price range, property type, bedrooms, bathrooms, and specific features. You can also view properties on our interactive map.',
      category: 'buyers'
    },
    {
      id: '5',
      question: 'Can I save properties to view later?',
      answer: 'Yes! Create an account and use the "Save" button on any property listing. All saved properties will appear in your dashboard for easy access.',
      category: 'buyers'
    },
    {
      id: '6',
      question: 'How do I contact a seller or agent?',
      answer: 'Each property listing has a contact form where you can send direct messages to the listing agent or seller. You can also find their contact information in the property details.',
      category: 'buyers'
    },
    {
      id: '7',
      question: 'Can I schedule property viewings?',
      answer: 'Yes, you can request viewings through the contact form on each property listing. The agent or seller will coordinate with you to schedule a convenient time.',
      category: 'buyers'
    },

    // For Sellers
    {
      id: '8',
      question: 'How do I list my property?',
      answer: 'After creating a seller account, go to your dashboard and click "Add Property". Fill in all property details, upload high-quality photos, and publish your listing.',
      category: 'sellers'
    },
    {
      id: '9',
      question: 'How much does it cost to list a property?',
      answer: 'We offer various listing packages. Basic listings start free for a limited time, while premium listings with featured placement and additional marketing tools have monthly fees.',
      category: 'sellers'
    },
    {
      id: '10',
      question: 'Can I edit my property listing after publishing?',
      answer: 'Absolutely! You can edit all aspects of your listing at any time through your dashboard, including photos, price, description, and availability.',
      category: 'sellers'
    },
    {
      id: '11',
      question: 'How do I manage inquiries from potential buyers?',
      answer: 'All inquiries appear in your dashboard with buyer contact information and messages. You can respond directly through our platform or use the provided contact details.',
      category: 'sellers'
    },

    // For Agents
    {
      id: '12',
      question: 'How do I become a verified agent?',
      answer: 'Create an agent account and submit your license information for verification. Once approved, you&apos;ll receive a verified badge and access to advanced agent tools.',
      category: 'agents'
    },
    {
      id: '13',
      question: 'Can I manage multiple client listings?',
      answer: 'Yes, verified agents can manage unlimited client listings through their dashboard. You can organize listings by client and track all inquiries and communications.',
      category: 'agents'
    },
    {
      id: '14',
      question: 'Do you provide lead generation tools?',
      answer: 'Yes, we offer lead generation tools for verified agents, including buyer matching based on search criteria and automated email campaigns.',
      category: 'agents'
    },

    // Technical Support
    {
      id: '15',
      question: 'I&apos;m having trouble uploading photos. What should I do?',
      answer: 'Ensure your photos are in JPG or PNG format and under 10MB each. Clear your browser cache and try again. If issues persist, contact our support team.',
      category: 'technical'
    },
    {
      id: '16',
      question: 'Is my personal information secure?',
      answer: 'Yes, we use industry-standard encryption and security measures to protect all user data. We never share personal information with third parties without consent.',
      category: 'technical'
    },
    {
      id: '17',
      question: 'Can I access Alpha Estates on mobile devices?',
      answer: 'Yes, our platform is fully responsive and works seamlessly on all devices including smartphones and tablets.',
      category: 'technical'
    },

    // Payments and Pricing
    {
      id: '18',
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards, debit cards, and digital payment methods including PayPal and Stripe.',
      category: 'payments'
    },
    {
      id: '19',
      question: 'Can I get a refund if I&apos;m not satisfied?',
      answer: 'We offer a 30-day money-back guarantee for premium listing packages. Contact our support team to process any refund requests.',
      category: 'payments'
    },
    {
      id: '20',
      question: 'Do you offer discounts for multiple listings?',
      answer: 'Yes, we offer volume discounts for sellers with multiple properties and special pricing for real estate agencies. Contact us for custom pricing.',
      category: 'payments'
    }
  ];

  const categories = [
    { id: 'all', label: 'All Questions', icon: '❓' },
    { id: 'general', label: 'General', icon: '🏠' },
    { id: 'buyers', label: 'For Buyers', icon: '🔍' },
    { id: 'sellers', label: 'For Sellers', icon: '💰' },
    { id: 'agents', label: 'For Agents', icon: '👔' },
    { id: 'technical', label: 'Technical', icon: '⚙️' },
    { id: 'payments', label: 'Payments', icon: '💳' }
  ];

  const filteredFAQs = faqData.filter(faq => {
    const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleFAQ = (id: string) => {
    setOpenFAQ(openFAQ === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-[#10141a] text-white">
      {/* Navigation Header */}
      <nav className="bg-[#181c23] shadow-lg border-b border-[#232a36] sticky top-0 z-50">
        <div className="  mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">A</span>
              </div>
              <span className="text-xl font-bold text-white">Alpha Estates</span>
            </Link>

            <div className="hidden md:flex items-center space-x-8">
              <Link href="/properties" className="text-gray-300 hover:text-blue-400 font-medium">
                Properties
              </Link>
              <Link href="/contact" className="text-gray-300 hover:text-blue-400 font-medium">
                Contact
              </Link>
              <Link href="/search" className="text-gray-300 hover:text-blue-400 font-medium">
                Search
              </Link>
            </div>

            <div className="flex items-center space-x-4">
              <Link
                href="/auth/login"
                className="text-gray-300 hover:text-blue-400 font-medium"
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

      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Frequently Asked Questions</h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Find answers to common questions about Alpha Estates. Can&apos;t find what you&apos;re looking for?
            <Link href="/contact" className="text-blue-400 hover:text-blue-300 ml-1">Contact us</Link>
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-xl mx-auto">
            <input
              type="text"
              placeholder="Search for answers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#181c23] border border-[#232a36] rounded-lg pl-12 pr-4 py-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <svg
              className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Category Filter */}
        <div className="mb-8">
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${activeCategory === category.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-[#181c23] text-gray-300 hover:bg-[#232a36] border border-[#232a36]'
                  }`}
              >
                <span>{category.icon}</span>
                <span>{category.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {filteredFAQs.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🤔</div>
              <h3 className="text-xl font-semibold mb-2">No results found</h3>
              <p className="text-gray-400">
                Try adjusting your search terms or browse different categories.
              </p>
            </div>
          ) : (
            filteredFAQs.map(faq => (
              <div
                key={faq.id}
                className="bg-[#181c23] border border-[#232a36] rounded-lg overflow-hidden"
              >
                <button
                  onClick={() => toggleFAQ(faq.id)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-[#232a36] transition-colors"
                >
                  <h3 className="text-lg font-semibold text-white">{faq.question}</h3>
                  <svg
                    className={`w-5 h-5 text-gray-400 transition-transform ${openFAQ === faq.id ? 'transform rotate-180' : ''
                      }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {openFAQ === faq.id && (
                  <div className="px-6 pb-4">
                    <p className="text-gray-300 leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Contact CTA */}
        <div className="mt-16 text-center bg-[#181c23] rounded-xl p-8 border border-[#232a36]">
          <h2 className="text-2xl font-bold mb-4">Still have questions?</h2>
          <p className="text-gray-300 mb-6">
            Our support team is here to help you get the most out of Alpha Estates.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Contact Support
            </Link>
            <Link
              href="/contact?purpose=support"
              className="border border-[#232a36] text-gray-300 hover:bg-[#232a36] px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Request a Call
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
