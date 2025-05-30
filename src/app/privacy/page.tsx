import Link from 'next/link';

export default function PrivacyPolicyPage() {
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
              <span className="text-xl font-bold text-white">Alpha Argons</span>
            </Link>

            <div className="hidden md:flex items-center space-x-8">
              <Link href="/properties" className="text-gray-300 hover:text-blue-400 font-medium">
                Properties
              </Link>
              <Link href="/contact" className="text-gray-300 hover:text-blue-400 font-medium">
                Contact
              </Link>
              <Link href="/faq" className="text-gray-300 hover:text-blue-400 font-medium">
                FAQ
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

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
          <p className="text-gray-300 text-lg">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        {/* Content */}
        <div className="bg-[#181c23] rounded-xl p-8 border border-[#232a36] space-y-8">

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-blue-400">1. Introduction</h2>
            <p className="text-gray-300 leading-relaxed">
              Welcome to Alpha Argons (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;). We are committed to protecting your privacy and personal information.
              This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our real estate platform.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-blue-400">2. Information We Collect</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2 text-white">Personal Information</h3>
                <ul className="list-disc list-inside text-gray-300 space-y-1">
                  <li>Name, email address, phone number</li>
                  <li>User account credentials</li>
                  <li>Profile information and preferences</li>
                  <li>Communication history and inquiries</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-medium mb-2 text-white">Property Information</h3>
                <ul className="list-disc list-inside text-gray-300 space-y-1">
                  <li>Property listings and descriptions</li>
                  <li>Property photos and virtual tour data</li>
                  <li>Location and address information</li>
                  <li>Pricing and availability details</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-medium mb-2 text-white">Technical Information</h3>
                <ul className="list-disc list-inside text-gray-300 space-y-1">
                  <li>IP address and browser information</li>
                  <li>Device type and operating system</li>
                  <li>Usage patterns and site analytics</li>
                  <li>Cookies and tracking technologies</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-blue-400">3. How We Use Your Information</h2>
            <ul className="list-disc list-inside text-gray-300 space-y-2">
              <li>To provide and maintain our real estate platform services</li>
              <li>To process property listings and manage user accounts</li>
              <li>To facilitate communication between buyers, sellers, and agents</li>
              <li>To improve our services and user experience</li>
              <li>To send important updates and notifications</li>
              <li>To prevent fraud and ensure platform security</li>
              <li>To comply with legal obligations and regulations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-blue-400">4. Information Sharing and Disclosure</h2>
            <div className="space-y-4">
              <p className="text-gray-300 leading-relaxed">
                We do not sell, trade, or rent your personal information to third parties. We may share your information in the following circumstances:
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2">
                <li><strong>With Real Estate Professionals:</strong> When you inquire about properties, we share your contact information with the relevant agents or sellers</li>
                <li><strong>Service Providers:</strong> We work with trusted third-party providers for hosting, analytics, and communication services</li>
                <li><strong>Legal Requirements:</strong> When required by law, court order, or to protect our rights and safety</li>
                <li><strong>Business Transfers:</strong> In connection with any merger, acquisition, or sale of assets</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-blue-400">5. Data Security</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              We implement industry-standard security measures to protect your personal information:
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-2">
              <li>SSL encryption for all data transmission</li>
              <li>Secure cloud storage with encrypted databases</li>
              <li>Regular security audits and monitoring</li>
              <li>Access controls and authentication systems</li>
              <li>Employee training on data protection practices</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-blue-400">6. Your Rights and Choices</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              You have the following rights regarding your personal information:
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-2">
              <li><strong>Access:</strong> Request access to your personal data we hold</li>
              <li><strong>Correction:</strong> Update or correct inaccurate information</li>
              <li><strong>Deletion:</strong> Request deletion of your personal data (subject to legal requirements)</li>
              <li><strong>Portability:</strong> Receive your data in a portable format</li>
              <li><strong>Opt-out:</strong> Unsubscribe from marketing communications</li>
              <li><strong>Restrict Processing:</strong> Limit how we use your data</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-blue-400">7. Cookies and Tracking</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              We use cookies and similar technologies to enhance your experience on our platform:
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-2">
              <li><strong>Essential Cookies:</strong> Required for basic platform functionality</li>
              <li><strong>Analytics Cookies:</strong> Help us understand how users interact with our site</li>
              <li><strong>Preference Cookies:</strong> Remember your settings and preferences</li>
              <li><strong>Marketing Cookies:</strong> Used to show relevant advertisements (with your consent)</li>
            </ul>
            <p className="text-gray-300 leading-relaxed mt-4">
              You can manage cookie preferences through your browser settings or our cookie consent banner.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-blue-400">8. Children&apos;s Privacy</h2>
            <p className="text-gray-300 leading-relaxed">
              Our platform is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13.
              If you are a parent or guardian and believe your child has provided us with personal information, please contact us immediately.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-blue-400">9. International Data Transfers</h2>
            <p className="text-gray-300 leading-relaxed">
              Your information may be transferred to and processed in countries other than your own. We ensure that such transfers comply with applicable
              data protection laws and implement appropriate safeguards to protect your personal information.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-blue-400">10. Data Retention</h2>
            <p className="text-gray-300 leading-relaxed">
              We retain your personal information only as long as necessary to fulfill the purposes outlined in this Privacy Policy,
              comply with our legal obligations, resolve disputes, and enforce our agreements. Property listing data may be retained
              for historical and market analysis purposes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-blue-400">11. Updates to This Policy</h2>
            <p className="text-gray-300 leading-relaxed">
              We may update this Privacy Policy from time to time to reflect changes in our practices or for legal, operational,
              or regulatory reasons. We will notify you of any material changes by posting the updated policy on our website and
              updating the &quot;Last updated&quot; date at the top of this page.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-blue-400">12. Contact Us</h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              If you have any questions about this Privacy Policy or our data practices, please contact us:
            </p>
            <div className="bg-[#10141a] p-4 rounded-lg">
              <ul className="text-gray-300 space-y-2">
                <li><strong>Email:</strong> privacy@alphaargons.com</li>
                <li><strong>Phone:</strong> (555) 123-4567</li>
                <li><strong>Address:</strong> 123 Real Estate Boulevard, Suite 456, Property City, PC 12345</li>
                <li><strong>Data Protection Officer:</strong> dpo@alphaargons.com</li>
              </ul>
            </div>
          </section>

        </div>

        {/* Footer CTA */}
        <div className="mt-12 text-center">
          <p className="text-gray-400 mb-4">
            By using Alpha Argons, you agree to the terms outlined in this Privacy Policy.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Contact Us
            </Link>
            <Link
              href="/faq"
              className="border border-[#232a36] text-gray-300 hover:bg-[#232a36] px-6 py-3 rounded-lg font-medium transition-colors"
            >
              View FAQ
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
