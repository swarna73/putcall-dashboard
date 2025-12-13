"use client";

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function UnsubscribePage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleUnsubscribe = async () => {
    if (!token) {
      setStatus('error');
      setMessage('Invalid unsubscribe link');
      return;
    }

    setStatus('loading');

    try {
      const response = await fetch('/api/unsubscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage(data.message || 'You have been unsubscribed');
      } else {
        setStatus('error');
        setMessage(data.error || 'Failed to unsubscribe');
      }
    } catch (error) {
      setStatus('error');
      setMessage('Network error. Please try again.');
    }
  };

  if (status === 'idle') {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-[#0b1221] rounded-xl p-8 border border-slate-800">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Unsubscribe from Daily Updates?</h2>
            <p className="text-slate-400 mb-6">
              We're sorry to see you go! You'll no longer receive daily market briefs from PutCall.nl.
            </p>

            <div className="flex gap-3">
              <button
                onClick={handleUnsubscribe}
                className="flex-1 bg-red-600 hover:bg-red-500 text-white font-semibold px-6 py-3 rounded-lg transition-all"
              >
                Unsubscribe
              </button>
              <Link
                href="/"
                className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-semibold px-6 py-3 rounded-lg transition-all text-center"
              >
                Cancel
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6">
        <div className="bg-[#0b1221] rounded-xl p-8 border border-slate-800 text-center">
          <div className="animate-spin h-12 w-12 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-slate-400">Processing...</p>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-[#0b1221] rounded-xl p-8 border border-slate-800">
          <div className="text-center">
            <div className="h-16 w-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            <h2 className="text-2xl font-bold text-white mb-2">Unsubscribed Successfully</h2>
            <p className="text-slate-400 mb-6">{message}</p>
            
            <p className="text-sm text-slate-500 mb-6">
              You can always re-subscribe anytime from the PutCall.nl homepage.
            </p>

            <Link
              href="/"
              className="inline-block bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-6 py-3 rounded-lg transition-all"
            >
              Return to Homepage
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-red-950/30 rounded-xl p-8 border border-red-500/30">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Error</h2>
          <p className="text-red-200 mb-6">{message}</p>

          <Link
            href="/"
            className="inline-block bg-slate-700 hover:bg-slate-600 text-white font-semibold px-6 py-3 rounded-lg transition-all"
          >
            Return to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
