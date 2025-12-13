"use client";

import React, { useState } from 'react';
import { IconMail, IconCheck, IconX, IconLoader } from './Icons';

interface SubscriptionFormProps {
  variant?: 'inline' | 'modal' | 'footer';
}

const SubscriptionForm: React.FC<SubscriptionFormProps> = ({ variant = 'inline' }) => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

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
        
        // Reset after 5 seconds
        setTimeout(() => {
          setStatus('idle');
          setMessage('');
        }, 5000);
      } else {
        setStatus('error');
        setMessage(data.error || 'Failed to subscribe. Please try again.');
        
        // Reset after 3 seconds
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

  if (variant === 'inline') {
    return (
      <div className="w-full max-w-md">
        <div className="bg-gradient-to-r from-indigo-950/50 to-purple-950/50 rounded-xl p-6 border border-indigo-900/50">
          <div className="flex items-center gap-2 mb-3">
            <IconMail className="h-5 w-5 text-indigo-400" />
            <h3 className="text-lg font-bold text-white">Daily Market Brief</h3>
          </div>
          
          <p className="text-sm text-slate-300 mb-4">
            Get the top Reddit stocks, fundamentals, and market insights delivered to your inbox every morning.
          </p>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                disabled={status === 'loading' || status === 'success'}
                className="w-full bg-slate-900 border border-slate-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              />
              {status === 'loading' && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <IconLoader className="h-5 w-5 text-indigo-400 animate-spin" />
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={status === 'loading' || status === 'success'}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm"
            >
              {status === 'loading' ? 'Subscribing...' : status === 'success' ? 'Subscribed!' : 'Subscribe for Free'}
            </button>
          </form>

          {message && (
            <div className={`mt-3 p-3 rounded-lg flex items-start gap-2 text-sm ${
              status === 'success' 
                ? 'bg-emerald-950/50 border border-emerald-500/30 text-emerald-300' 
                : 'bg-red-950/50 border border-red-500/30 text-red-300'
            }`}>
              {status === 'success' ? (
                <IconCheck className="h-5 w-5 flex-shrink-0 mt-0.5" />
              ) : (
                <IconX className="h-5 w-5 flex-shrink-0 mt-0.5" />
              )}
              <span>{message}</span>
            </div>
          )}

          <p className="mt-3 text-xs text-slate-500">
            Free forever. Unsubscribe anytime. We respect your privacy.
          </p>
        </div>
      </div>
    );
  }

  if (variant === 'footer') {
    return (
      <div className="w-full">
        <div className="flex items-center gap-2 mb-3">
          <IconMail className="h-4 w-4 text-indigo-400" />
          <h4 className="text-sm font-bold text-white">Subscribe to Daily Updates</h4>
        </div>
        
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            disabled={status === 'loading' || status === 'success'}
            className="flex-1 bg-slate-900 border border-slate-700 text-white px-3 py-2 rounded text-sm focus:outline-none focus:border-indigo-500 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={status === 'loading' || status === 'success'}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded text-sm disabled:opacity-50 transition-colors whitespace-nowrap"
          >
            {status === 'loading' ? 'Subscribing...' : 'Subscribe'}
          </button>
        </form>

        {message && (
          <p className={`mt-2 text-xs ${status === 'success' ? 'text-emerald-400' : 'text-red-400'}`}>
            {message}
          </p>
        )}
      </div>
    );
  }

  return null;
};

export default SubscriptionForm;
