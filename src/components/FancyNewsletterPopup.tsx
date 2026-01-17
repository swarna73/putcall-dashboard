"use client";

import React, { useEffect, useState, useRef } from 'react';

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
  const cardRef = useRef<HTMLDivElement>(null);
  
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

  // 3D tilt effect
  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = (y - centerY) / 20;
      const rotateY = (centerX - x) / 20;
      
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
    };

    const handleMouseLeave = () => {
      card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
    };

    card.addEventListener('mousemove', handleMouseMove);
    card.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      card.removeEventListener('mousemove', handleMouseMove);
      card.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [isVisible]);

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
      {/* Animated backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md animate-in fade-in duration-500" />
      
      {/* Floating background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Animated gradient orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-3xl animate-spin-slow" />
        
        {/* Floating chart lines */}
        <svg className="absolute inset-0 w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="chartGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0" />
              <stop offset="50%" stopColor="#6366f1" stopOpacity="1" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path 
            d="M0,200 Q100,150 200,180 T400,160 T600,200 T800,140 T1000,180 T1200,150 T1400,190" 
            fill="none" 
            stroke="url(#chartGrad)" 
            strokeWidth="2"
            className="animate-chart-draw"
          />
          <path 
            d="M0,300 Q150,250 300,280 T600,240 T900,300 T1200,260 T1500,280" 
            fill="none" 
            stroke="url(#chartGrad)" 
            strokeWidth="2"
            strokeOpacity="0.5"
            className="animate-chart-draw delay-500"
          />
        </svg>
        
        {/* Floating ticker symbols */}
        <div className="absolute top-20 left-10 text-indigo-500/30 text-4xl font-bold animate-float">📈</div>
        <div className="absolute top-40 right-20 text-emerald-500/30 text-3xl font-bold animate-float delay-700">$</div>
        <div className="absolute bottom-32 left-20 text-purple-500/30 text-4xl font-bold animate-float delay-1000">💹</div>
        <div className="absolute bottom-20 right-10 text-cyan-500/30 text-3xl font-bold animate-float delay-300">%</div>
      </div>

      {/* Confetti */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute w-3 h-3 animate-confetti"
              style={{
                left: `${Math.random() * 100}%`,
                top: '-10px',
                backgroundColor: ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b'][Math.floor(Math.random() * 5)],
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
                transform: `rotate(${Math.random() * 360}deg)`,
              }}
            />
          ))}
        </div>
      )}

      {/* Main card */}
      <div 
        ref={cardRef}
        className="relative w-full max-w-lg transition-transform duration-200 ease-out animate-in zoom-in-95 slide-in-from-bottom-8 duration-500"
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Glow effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 rounded-3xl blur-xl opacity-50 animate-pulse" />
        
        {/* Card content */}
        <div className="relative bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 rounded-2xl border border-indigo-500/30 shadow-2xl overflow-hidden">
          {/* Animated top border */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 animate-gradient-x" />
          
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 z-10 p-2 text-slate-400 hover:text-white transition-all hover:rotate-90 duration-300 rounded-full hover:bg-white/10"
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
                <div className="absolute inset-0 bg-indigo-500 rounded-2xl blur-xl opacity-50 animate-pulse" />
                <div className="relative p-4 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl shadow-lg transform hover:scale-110 transition-transform duration-300">
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
                <span className="animate-blink text-indigo-400">|</span>
              </h2>
            </div>
            
            {/* Subtitle with animated underline */}
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
                  className="group p-3 bg-slate-800/50 rounded-xl border border-slate-700/50 hover:border-indigo-500/50 hover:bg-indigo-950/30 transition-all duration-300 text-center cursor-default"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <div className="text-2xl mb-1 group-hover:scale-125 transition-transform duration-300">{item.icon}</div>
                  <div className="text-xs text-slate-400 group-hover:text-indigo-300 transition-colors">{item.label}</div>
                </div>
              ))}
            </div>

            {/* Form */}
            {status === 'success' ? (
              <div className="text-center py-6 animate-in zoom-in duration-300">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-500/20 rounded-full mb-4">
                  <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">You're in! 🎉</h3>
                <p className="text-slate-400 text-sm">{message}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl blur opacity-0 group-hover:opacity-30 transition-opacity duration-300" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    disabled={status === 'loading'}
                    className="relative w-full bg-slate-800/80 border border-slate-700 text-white px-5 py-4 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 disabled:opacity-50 text-sm placeholder:text-slate-500 transition-all duration-300"
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
                  className="group relative w-full overflow-hidden bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold py-4 rounded-xl disabled:opacity-50 transition-all text-sm shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {status === 'loading' ? (
                      'Subscribing...'
                    ) : (
                      <>
                        Subscribe for Free
                        <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </>
                    )}
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-cyan-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </button>
              </form>
            )}

            {/* Error message */}
            {message && status === 'error' && (
              <div className="mt-4 p-3 bg-red-950/50 border border-red-500/30 rounded-lg text-red-300 text-sm flex items-center gap-2 animate-in shake duration-300">
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

      {/* Custom styles */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(10deg); }
        }
        @keyframes confetti {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
        @keyframes chart-draw {
          0% { stroke-dasharray: 1000; stroke-dashoffset: 1000; }
          100% { stroke-dashoffset: 0; }
        }
        @keyframes spin-slow {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to { transform: translate(-50%, -50%) rotate(360deg); }
        }
        .animate-float { animation: float 4s ease-in-out infinite; }
        .animate-confetti { animation: confetti 3s ease-out forwards; }
        .animate-gradient-x { 
          background-size: 200% 200%;
          animation: gradient-x 3s ease infinite; 
        }
        .animate-blink { animation: blink 1s step-end infinite; }
        .animate-chart-draw { animation: chart-draw 3s ease-out forwards; }
        .animate-spin-slow { animation: spin-slow 20s linear infinite; }
        .delay-300 { animation-delay: 300ms; }
        .delay-500 { animation-delay: 500ms; }
        .delay-700 { animation-delay: 700ms; }
        .delay-1000 { animation-delay: 1000ms; }
      `}</style>
    </div>
  );
};

export default FancyNewsletterPopup;
