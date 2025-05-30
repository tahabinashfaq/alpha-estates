// Enhanced Contact Form with validation and features
// Real estate specific contact forms for different purposes

"use client";
import { FormEvent, useState } from 'react';

interface ContactFormProps {
  title?: string;
  purpose?: 'general' | 'property' | 'agent' | 'support';
  propertyId?: string;
  agentId?: string;
}

export function ContactForm({
  title = "Get in Touch",
  purpose = 'general',
  propertyId,
  agentId
}: ContactFormProps) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    preferredContact: 'email' as 'email' | 'phone',
    bestTime: '',
    urgency: 'normal' as 'low' | 'normal' | 'high',
    consent: false
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validation
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.message) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    if (!formData.consent) {
      setError('Please agree to be contacted');
      setLoading(false);
      return;
    }

    // Simulate API call
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Here you would typically send the data to your backend
      console.log('Contact form submitted:', {
        ...formData,
        purpose,
        propertyId,
        agentId,
        timestamp: new Date().toISOString()
      });

      setSuccess(true);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
        preferredContact: 'email',
        bestTime: '',
        urgency: 'normal',
        consent: false
      });

      // Auto-hide success message after 5 seconds
      setTimeout(() => setSuccess(false), 5000);
    } catch {
      setError('Failed to send message. Please try again.');
    }

    setLoading(false);
  };

  const getSubjectPlaceholder = () => {
    switch (purpose) {
      case 'property':
        return 'Inquiry about property listing';
      case 'agent':
        return 'Question for real estate agent';
      case 'support':
        return 'Technical support request';
      default:
        return 'General inquiry';
    }
  };

  const getMessagePlaceholder = () => {
    switch (purpose) {
      case 'property':
        return 'I am interested in this property. Please provide more information about pricing, availability, and scheduling a viewing.';
      case 'agent':
        return 'I would like to discuss my real estate needs with an agent. Please contact me to schedule a consultation.';
      case 'support':
        return 'I am experiencing an issue with the website. Please describe your problem in detail.';
      default:
        return 'Please describe how we can help you...';
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
        <p className="text-gray-600">
          {purpose === 'property' && 'Interested in this property? Get in touch with us.'}
          {purpose === 'agent' && 'Connect with our experienced real estate professionals.'}
          {purpose === 'support' && 'Need help? Our support team is here to assist you.'}
          {purpose === 'general' && 'We\'d love to hear from you. Send us a message and we\'ll respond as soon as possible.'}
        </p>
      </div>

      {success && (
        <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          <div className="flex items-center">
            <span className="mr-2">✅</span>
            Thank you for your message! We&apos;ll get back to you within 24 hours.
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name fields */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
              First Name *
            </label>
            <input
              type="text"
              id="firstName"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
              Last Name *
            </label>
            <input
              type="text"
              id="lastName"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
        </div>

        {/* Contact info */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address *
            </label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="(555) 123-4567"
            />
          </div>
        </div>

        {/* Subject */}
        <div>
          <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
            Subject
          </label>
          <input
            type="text"
            id="subject"
            value={formData.subject}
            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder={getSubjectPlaceholder()}
          />
        </div>

        {/* Contact preferences */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preferred Contact Method
            </label>
            <select
              value={formData.preferredContact}
              onChange={(e) => setFormData({ ...formData, preferredContact: e.target.value as 'email' | 'phone' })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="email">Email</option>
              <option value="phone">Phone</option>
            </select>
          </div>
          <div>
            <label htmlFor="bestTime" className="block text-sm font-medium text-gray-700 mb-2">
              Best Time to Contact
            </label>
            <select
              id="bestTime"
              value={formData.bestTime}
              onChange={(e) => setFormData({ ...formData, bestTime: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Any time</option>
              <option value="morning">Morning (9 AM - 12 PM)</option>
              <option value="afternoon">Afternoon (12 PM - 5 PM)</option>
              <option value="evening">Evening (5 PM - 8 PM)</option>
            </select>
          </div>
        </div>

        {/* Urgency */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Request Priority
          </label>
          <div className="flex space-x-4">
            {[
              { value: 'low', label: 'Low Priority', color: 'border-gray-300 text-gray-700' },
              { value: 'normal', label: 'Normal', color: 'border-blue-300 text-blue-700' },
              { value: 'high', label: 'Urgent', color: 'border-red-300 text-red-700' }
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setFormData({ ...formData, urgency: option.value as 'low' | 'normal' | 'high' })}
                className={`px-4 py-2 border-2 rounded-lg font-medium transition-all ${formData.urgency === option.value
                    ? option.color + ' bg-opacity-10'
                    : 'border-gray-200 text-gray-500 hover:border-gray-300'
                  }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Message */}
        <div>
          <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
            Message *
          </label>
          <textarea
            id="message"
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            rows={6}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder={getMessagePlaceholder()}
            required
          />
          <p className="text-sm text-gray-500 mt-1">
            {formData.message.length}/500 characters
          </p>
        </div>

        {/* Consent */}
        <div className="flex items-start space-x-3">
          <input
            type="checkbox"
            id="consent"
            checked={formData.consent}
            onChange={(e) => setFormData({ ...formData, consent: e.target.checked })}
            className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            required
          />
          <label htmlFor="consent" className="text-sm text-gray-600">
            I agree to be contacted by Alpha Argons regarding my inquiry. I understand that my information will be handled according to the{' '}
            <a href="/privacy" className="text-blue-600 hover:text-blue-700 underline">
              Privacy Policy
            </a>.
          </label>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Submit button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors text-white py-3 rounded-lg font-semibold text-lg shadow-sm"
        >
          {loading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Sending Message...</span>
            </div>
          ) : (
            'Send Message'
          )}
        </button>
      </form>

      {/* Contact info */}
      <div className="mt-8 pt-8 border-t border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl mb-2">📧</div>
            <div className="font-medium text-gray-900">Email</div>
            <div className="text-gray-600">contact@alphaargons.com</div>
          </div>
          <div>
            <div className="text-2xl mb-2">📞</div>
            <div className="font-medium text-gray-900">Phone</div>
            <div className="text-gray-600">(555) 123-4567</div>
          </div>
          <div>
            <div className="text-2xl mb-2">🕒</div>
            <div className="font-medium text-gray-900">Hours</div>
            <div className="text-gray-600">Mon-Fri: 9 AM - 6 PM</div>
          </div>
        </div>
      </div>
    </div>
  );
}
