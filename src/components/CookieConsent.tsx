"use client";

import React, { useState, useEffect } from 'react';

const CookieConsent: React.FC = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      // Delay showing banner slightly for better UX
      setTimeout(() => {
        setShowBanner(true);
        setTimeout(() => setIsVisible(true), 100);
      }, 1000);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie-consent', 'accepted');
    setIsVisible(false);
    setTimeout(() => {
      setShowBanner(false);
      // Reload to activate Google Analytics
      window.location.reload();
    }, 300);
  };

  const handleReject = () => {
    localStorage.setItem('cookie-consent', 'rejected');
    setIsVisible(false);
    setTimeout(() => setShowBanner(false), 300);
  };

  if (!showBanner) return null;

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-50 transition-all duration-300 ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
      }`}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      
      {/* Banner */}
      <div className="relative max-w-7xl mx-auto p-4 sm:p-6">
        <div className="bg-slate-900 rounded-xl border border-slate-700 shadow-2xl p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            {/* Icon */}
            <div className="flex-shrink-0">
              <div className="w-12 h-12 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center">
                <svg className="w-6 h-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 space-y-2">
              <h3 className="text-lg font-bold text-white">
                🍪 We value your privacy
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                We use cookies to analyze website traffic and improve your experience. 
                We use <strong>Google Analytics</strong> to understand how visitors interact with our site. 
                Your data is anonymized and never sold. By clicking "Accept", you consent to our use of cookies.
                {' '}
                <a 
                  href="/privacy" 
                  className="text-indigo-400 hover:text-indigo-300 underline"
                  target="_blank"
                >
                  Privacy Policy
                </a>
              </p>
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <button
                onClick={handleReject}
                className="px-6 py-2.5 rounded-lg border border-slate-600 text-slate-300 hover:bg-slate-800 transition-colors font-medium text-sm whitespace-nowrap"
              >
                Reject
              </button>
              <button
                onClick={handleAccept}
                className="px-6 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-colors font-medium text-sm whitespace-nowrap"
              >
                Accept All
              </button>
            </div>
          </div>

          {/* GDPR Notice */}
          <div className="mt-4 pt-4 border-t border-slate-700">
            <p className="text-xs text-slate-500">
              🇪🇺 GDPR Compliant • Your choice is saved locally • You can change your preference anytime
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;
