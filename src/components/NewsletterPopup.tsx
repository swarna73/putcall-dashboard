"use client";

import React, { useEffect, useState } from 'react';

interface NewsletterPopupProps {
  delayMs?: number; // Delay before showing popup (default 2 seconds)
}

const NewsletterPopup: React.FC<NewsletterPopupProps> = ({ delayMs = 2000 }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Check if user has already dismissed or subscribed
    const dismissed = localStorage.getItem('newsletter_popup_dismissed');
    const subscribed = localStorage.getItem('newsletter_subscribed');
    
    if (dismissed || subscribed) {
      return;
    }

    // Show popup after delay
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delayMs);

    return () => clearTimeout(timer);
  }, [delayMs]);

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem('newsletter_popup_dismissed', 'true');
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setStatus('error');
      setMessage('Please enter an email address');
      return;
    }

    setStatus('loading');
    setMessage('');

    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage(data.message || 'Successfully subscribed! Check your email to confirm.');
        setEmail('');
        localStorage.setItem('newsletter_subscribed', 'true');
        
        // Close popup after success
        setTimeout(() => {
          setIsVisible(false);
        }, 3000);
      } else {
        setStatus('error');
        setMessage(data.error || 'Failed to subscribe. Please try again.');
        
        setTimeout(() => {
          setStatus('idle');
          setMessage('');
        }, 3000);
      }
    } catch (error) {
      setStatus('error');
      setMessage('Network error. Please try again.');
      
      setTimeout(() => {
        setStatus('idle');
        setMessage('');
      }, 3000);
    }
  };

  if (!isVisible) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
      onClick={handleBackdropClick}
    >
      <div className="relative w-full max-w-md bg-gradient-to-br from-slate-900 via-indigo-950/90 to-purple-950/80 rounded-2xl border border-indigo-500/30 shadow-2xl shadow-indigo-500/20 animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-1 text-slate-400 hover:text-white transition-colors rounded-full hover:bg-slate-800/50"
          aria-label="Close"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="p-6 sm:p-8">
          {/* Icon & Header */}
          <div className="flex flex-col items-center text-center mb-6">
            <div className="p-3 bg-indigo-500/20 rounded-full ring-1 ring-indigo-500/50 mb-4">
              <svg className="h-8 w-8 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Market Brief</h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              Get the top Reddit stocks, fundamentals, and market insights delivered to your inbox <span className="text-indigo-400 font-semibold">every Mon, Wed & Fri</span>.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                disabled={status === 'loading' || status === 'success'}
                className="w-full bg-slate-900/80 border border-slate-700 text-white px-4 py-3.5 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 disabled:opacity-50 disabled:cursor-not-allowed text-sm placeholder:text-slate-500"
                autoFocus
              />
              {status === 'loading' && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <svg className="h-5 w-5 text-indigo-400 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={status === 'loading' || status === 'success'}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold py-3.5 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm shadow-lg shadow-indigo-500/25"
            >
              {status === 'loading' ? 'Subscribing...' : status === 'success' ? '✓ Subscribed!' : 'Subscribe for Free'}
            </button>
          </form>

          {/* Status Message */}
          {message && (
            <div className={`mt-4 p-3 rounded-lg flex items-start gap-2 text-sm ${
              status === 'success' 
                ? 'bg-emerald-950/50 border border-emerald-500/30 text-emerald-300' 
                : 'bg-red-950/50 border border-red-500/30 text-red-300'
            }`}>
              {status === 'success' ? (
                <svg className="h-5 w-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="h-5 w-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
              <span>{message}</span>
            </div>
          )}

          {/* Footer */}
          <p className="mt-4 text-xs text-slate-500 text-center">
            Free forever. Unsubscribe anytime. We respect your privacy.
          </p>
        </div>
      </div>
    </div>
  );
};

export default NewsletterPopup;
