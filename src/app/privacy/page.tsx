import React from 'react';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-[#020617] text-white">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
        
        <div className="space-y-8 text-slate-300">
          <section>
            <p className="text-sm text-slate-500 mb-4">Last updated: December 7, 2025</p>
            <p className="leading-relaxed">
              PutCall.nl ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you visit our website.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">1. Information We Collect</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Analytics Data</h3>
                <p className="leading-relaxed">
                  With your consent, we use Google Analytics to understand how visitors interact with our website. This includes:
                </p>
                <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
                  <li>Pages viewed</li>
                  <li>Time spent on site</li>
                  <li>Browser type and device information</li>
                  <li>Geographic location (country/city level)</li>
                  <li>Referring websites</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Technical Data</h3>
                <p className="leading-relaxed">
                  We automatically collect certain technical information using Vercel Analytics, including:
                </p>
                <ul className="list-disc list-inside mt-2 space-y-1 ml-4">
                  <li>IP address (anonymized)</li>
                  <li>Browser type</li>
                  <li>Operating system</li>
                  <li>Page load performance metrics</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">2. How We Use Your Information</h2>
            <p className="leading-relaxed mb-3">We use the collected information to:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Improve website performance and user experience</li>
              <li>Understand user behavior and preferences</li>
              <li>Analyze traffic patterns and popular features</li>
              <li>Fix bugs and technical issues</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">3. Cookies</h2>
            <p className="leading-relaxed mb-3">
              We use cookies to enhance your experience. Cookies are small text files stored on your device. We use:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>Essential Cookies:</strong> Required for the website to function (your cookie consent preference)</li>
              <li><strong>Analytics Cookies:</strong> Google Analytics (only with your consent)</li>
            </ul>
            <p className="mt-3 leading-relaxed">
              You can manage your cookie preferences at any time by clearing your browser cookies and revisiting our site.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">4. Third-Party Services</h2>
            <div className="space-y-3">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Google Analytics</h3>
                <p className="leading-relaxed">
                  We use Google Analytics to analyze website traffic. Google Analytics uses cookies to collect anonymous information. 
                  For more information on how Google uses data, visit{' '}
                  <a 
                    href="https://policies.google.com/privacy" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-indigo-400 hover:text-indigo-300 underline"
                  >
                    Google's Privacy Policy
                  </a>.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Vercel Analytics</h3>
                <p className="leading-relaxed">
                  We use Vercel Analytics for privacy-friendly website analytics. Vercel does not use cookies and does not collect personal data. 
                  Learn more at{' '}
                  <a 
                    href="https://vercel.com/docs/analytics/privacy-policy" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-indigo-400 hover:text-indigo-300 underline"
                  >
                    Vercel's Privacy Policy
                  </a>.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">5. Your Rights (GDPR)</h2>
            <p className="leading-relaxed mb-3">Under the EU General Data Protection Regulation (GDPR), you have the right to:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>Access:</strong> Request a copy of your data</li>
              <li><strong>Rectification:</strong> Correct inaccurate data</li>
              <li><strong>Erasure:</strong> Request deletion of your data</li>
              <li><strong>Restriction:</strong> Limit how we use your data</li>
              <li><strong>Portability:</strong> Receive your data in a portable format</li>
              <li><strong>Objection:</strong> Object to data processing</li>
              <li><strong>Withdraw Consent:</strong> Withdraw consent at any time</li>
            </ul>
            <p className="mt-3 leading-relaxed">
              To exercise any of these rights, please contact us at: <a href="mailto:privacy@putcall.nl" className="text-indigo-400 hover:text-indigo-300 underline">privacy@putcall.nl</a>
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">6. Data Retention</h2>
            <p className="leading-relaxed">
              We retain analytics data for up to 26 months. After this period, data is automatically deleted or anonymized.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">7. Data Security</h2>
            <p className="leading-relaxed">
              We implement appropriate technical and organizational measures to protect your data against unauthorized access, alteration, disclosure, or destruction. All data is transmitted over secure HTTPS connections.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">8. Children's Privacy</h2>
            <p className="leading-relaxed">
              Our website is not intended for children under 16. We do not knowingly collect personal information from children.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">9. Changes to This Policy</h2>
            <p className="leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last updated" date.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">10. Contact Us</h2>
            <p className="leading-relaxed">
              If you have any questions about this Privacy Policy, please contact us:
            </p>
            <ul className="mt-3 space-y-2">
              <li><strong>Email:</strong> <a href="mailto:privacy@putcall.nl" className="text-indigo-400 hover:text-indigo-300 underline">privacy@putcall.nl</a></li>
              <li><strong>Website:</strong> <a href="https://putcall.nl" className="text-indigo-400 hover:text-indigo-300 underline">https://putcall.nl</a></li>
            </ul>
          </section>

          <section className="border-t border-slate-800 pt-8">
            <div className="bg-slate-800/50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-2">🇪🇺 EU Users</h3>
              <p className="text-sm leading-relaxed">
                This website is GDPR compliant. We only use Google Analytics with your explicit consent. 
                You can withdraw your consent at any time by clearing your browser cookies and declining consent when prompted.
              </p>
            </div>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800 text-center">
          <a 
            href="/" 
            className="inline-block px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors font-medium"
          >
            ← Back to Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}
