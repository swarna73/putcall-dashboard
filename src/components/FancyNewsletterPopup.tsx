"use client";

import React, { useEffect, useState } from 'react';

interface FancyNewsletterPopupProps {
  delayMs?: number;
}

const FancyNewsletterPopup: React.FC<FancyNewsletterPopupProps> = ({ delayMs = 2000 }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [typedText, setTypedText] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);
  
  const fullText = "Market Brief";

  // Typing animation
  useEffect(() => {
    if (!isVisible) return;
    
    let index = 0;
    const timer = setInterval(() => {
      if (index <= fullText.length) {
        setTypedText(fullText.slice(0, index));
        index++;
      } else {
        clearInterval(timer);
      }
    }, 100);
    
    return () => clearInterval(timer);
  }, [isVisible]);

  // Show popup after delay
  useEffect(() => {
    const dismissed = localStorage.getItem('newsletter_popup_dismissed');
    const subscribed = localStorage.getItem('newsletter_subscribed');
    
    if (dismissed || subscribed) return;

    const timer = setTimeout(() => setIsVisible(true), delayMs);
    return () => clearTimeout(timer);
  }, [delayMs]);

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem('newsletter_popup_dismissed', 'true');
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) handleClose();
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage(data.message || 'Successfully subscribed!');
        setEmail('');
        setShowConfetti(true);
        localStorage.setItem('newsletter_subscribed', 'true');
        
        setTimeout(() => setIsVisible(false), 4000);
      } else {
        setStatus('error');
        setMessage(data.error || 'Failed to subscribe.');
        setTimeout(() => { setStatus('idle'); setMessage(''); }, 3000);
      }
    } catch {
      setStatus('error');
      setMessage('Network error. Please try again.');
      setTimeout(() => { setStatus('idle'); setMessage(''); }, 3000);
    }
  };

  if (!isVisible) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-hidden"
      onClick={handleBackdropClick}
    >
      {/* Animated backdrop - z-0 */}
      <div className="absolute inset-0 z-0 bg-black/70 backdrop-blur-md" />
      
      {/* Floating background elements - z-10, pointer-events-none */}
      <div className="absolute inset-0 z-10 overflow-hidden pointer-events-none">
        {/* Animated gradient orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-3xl" />
        
        {/* Floating ticker symbols */}
        <div className="absolute top-20 left-10 text-indigo-500/30 text-4xl font-bold animate-bounce" style={{ animationDuration: '3s' }}>📈</div>
        <div className="absolute top-40 right-20 text-emerald-500/30 text-3xl font-bold animate-bounce" style={{ animationDuration: '4s', animationDelay: '0.5s' }}>$</div>
        <div className="absolute bottom-32 left-20 text-purple-500/30 text-4xl font-bold animate-bounce" style={{ animationDuration: '3.5s', animationDelay: '1s' }}>💹</div>
        <div className="absolute bottom-20 right-10 text-cyan-500/30 text-3xl font-bold animate-bounce" style={{ animationDuration: '4s', animationDelay: '0.3s' }}>%</div>
      </div>

      {/* Confetti - z-40, pointer-events-none */}
      {showConfetti && (
        <div className="absolute inset-0 z-40 pointer-events-none overflow-hidden">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute w-3 h-3 animate-ping"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                backgroundColor: ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b'][Math.floor(Math.random() * 5)],
                animationDuration: `${1 + Math.random()}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* Main card - z-20 */}
      <div 
        className="relative z-20 w-full max-w-lg"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 rounded-3xl blur-xl opacity-50 animate-pulse pointer-events-none" />
        
        {/* Card content */}
        <div className="relative bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 rounded-2xl border border-indigo-500/30 shadow-2xl overflow-hidden">
          {/* Animated top border */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 pointer-events-none" />
          
          {/* Close button */}
          <button
            type="button"
            onClick={handleClose}
            className="absolute top-4 right-4 z-30 p-2 text-slate-400 hover:text-white transition-all hover:rotate-90 duration-300 rounded-full hover:bg-white/10"
            aria-label="Close"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="p-8 sm:p-10">
            {/* Logo animation */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-indigo-500 rounded-2xl blur-xl opacity-50 animate-pulse pointer-events-none" />
                <div className="relative p-4 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl shadow-lg">
                  <svg className="h-10 w-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Typing headline */}
            <div className="text-center mb-2">
              <h2 className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-200 to-purple-200">
                {typedText}
                <span className="text-indigo-400 animate-pulse">|</span>
              </h2>
            </div>
            
            {/* Subtitle */}
            <div className="text-center mb-8">
              <p className="text-slate-400 text-sm sm:text-base">
                AI-powered market intelligence
              </p>
              <div className="flex items-center justify-center gap-2 mt-3">
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-500/20 border border-indigo-500/30 rounded-full text-xs text-indigo-300 font-medium">
                  <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                  Mon • Wed • Fri
                </span>
              </div>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-3 mb-8">
              {[
                { icon: '📊', label: 'Sentiment' },
                { icon: '🔥', label: 'Trending' },
                { icon: '📰', label: 'News' },
              ].map((item, i) => (
                <div 
                  key={i}
                  className="group p-3 bg-slate-800/50 rounded-xl border border-slate-700/50 hover:border-indigo-500/50 hover:bg-indigo-950/30 transition-all duration-300 text-center"
                >
                  <div className="text-2xl mb-1 group-hover:scale-125 transition-transform duration-300">{item.icon}</div>
                  <div className="text-xs text-slate-400 group-hover:text-indigo-300 transition-colors">{item.label}</div>
                </div>
              ))}
            </div>

            {/* Form */}
            {status === 'success' ? (
              <div className="text-center py-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-500/20 rounded-full mb-4">
                  <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">You&apos;re in! 🎉</h3>
                <p className="text-slate-400 text-sm">{message}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    disabled={status === 'loading'}
                    className="w-full bg-slate-800/80 border border-slate-700 text-white px-5 py-4 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 disabled:opacity-50 text-sm placeholder:text-slate-500 transition-all duration-300"
                    autoFocus
                  />
                  {status === 'loading' && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      <div className="w-5 h-5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-4 rounded-xl disabled:opacity-50 transition-all text-sm shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span className="flex items-center justify-center gap-2">
                    {status === 'loading' ? (
                      'Subscribing...'
                    ) : (
                      <>
                        Subscribe for Free
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </>
                    )}
                  </span>
                </button>
              </form>
            )}

            {/* Error message */}
            {message && status === 'error' && (
              <div className="mt-4 p-3 bg-red-950/50 border border-red-500/30 rounded-lg text-red-300 text-sm flex items-center gap-2">
                <svg className="h-4 w-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {message}
              </div>
            )}

            {/* Footer */}
            <p className="mt-6 text-xs text-slate-500 text-center">
              Join 500+ traders • Free forever • Unsubscribe anytime
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FancyNewsletterPopup;
