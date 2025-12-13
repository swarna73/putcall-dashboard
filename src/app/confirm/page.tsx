'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function ConfirmContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Invalid confirmation link');
      return;
    }

    const confirmSubscription = async () => {
      try {
        const response = await fetch('/api/confirm', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();

        if (response.ok) {
          setStatus('success');
          setMessage(data.message || 'Your subscription is confirmed!');
        } else {
          setStatus('error');
          setMessage(data.error || 'Failed to confirm subscription');
        }
      } catch (error) {
        setStatus('error');
        setMessage('Network error. Please try again.');
      }
    };

    confirmSubscription();
  }, [token]);

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        
        {status === 'loading' && (
          <div className="bg-[#0b1221] rounded-xl p-8 border border-slate-800 text-center">
            <div className="animate-spin h-12 w-12 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <h2 className="text-xl font-bold text-white mb-2">Confirming...</h2>
            <p className="text-slate-400 text-sm">Please wait while we confirm your subscription</p>
          </div>
        )}

        {status === 'success' && (
          <div className="bg-gradient-to-br from-emerald-950/50 to-emerald-900/30 rounded-xl p-8 border border-emerald-500/30">
            <div className="text-center">
              <div className="h-16 w-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              
              <h2 className="text-2xl font-bold text-white mb-2">You&apos;re All Set! 🎉</h2>
              <p className="text-emerald-200 mb-6">{message}</p>
              
              <div className="bg-emerald-950/50 rounded-lg p-4 mb-6 text-left">
                <p className="text-sm text-emerald-100 mb-2">
                  <strong>What&apos;s next?</strong>
                </p>
                <ul className="text-sm text-emerald-200 space-y-1">
                  <li>📧 You&apos;ll receive your first market brief tomorrow morning</li>
                  <li>📊 Includes Reddit trends, fundamentals, and news</li>
                  <li>🔓 Unsubscribe anytime with one click</li>
                </ul>
              </div>

              <Link
                href="/"
                className="inline-block bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold px-6 py-3 rounded-lg transition-all"
              >
                Go to Dashboard
              </Link>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="bg-gradient-to-br from-red-950/50 to-red-900/30 rounded-xl p-8 border border-red-500/30">
            <div className="text-center">
              <div className="h-16 w-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              
              <h2 className="text-2xl font-bold text-white mb-2">Confirmation Failed</h2>
              <p className="text-red-200 mb-6">{message}</p>

              <Link
                href="/"
                className="inline-block bg-slate-700 hover:bg-slate-600 text-white font-semibold px-6 py-3 rounded-lg transition-all"
              >
                Return to Homepage
              </Link>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default function ConfirmPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6">
        <div className="bg-[#0b1221] rounded-xl p-8 border border-slate-800 text-center">
          <div className="animate-spin h-12 w-12 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-slate-400">Loading...</p>
        </div>
      </div>
    }>
      <ConfirmContent />
    </Suspense>
  );
}
