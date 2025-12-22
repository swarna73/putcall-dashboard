// app/confirm/page.tsx
'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function ConfirmContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  
  const [status, setStatus] = useState<'loading' | 'success' | 'already_confirmed' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Invalid confirmation link. No token provided.');
      return;
    }

    const confirmSubscription = async () => {
      try {
        const response = await fetch(`/api/confirm?token=${token}`);
        const data = await response.json();

        if (response.ok && data.success) {
          setStatus('success');
          setMessage(data.message || 'Your email has been confirmed!');
        } else if (data.alreadyConfirmed) {
          // User already confirmed - show friendly message
          setStatus('already_confirmed');
          setMessage('Your email is already confirmed. You\'re all set!');
        } else {
          setStatus('error');
          setMessage(data.error || 'Failed to confirm subscription');
        }
      } catch (error) {
        setStatus('error');
        setMessage('Network error. Please try again later.');
      }
    };

    confirmSubscription();
  }, [token]);

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        
        {/* Loading State */}
        {status === 'loading' && (
          <div className="bg-[#0b1221] rounded-xl p-8 border border-slate-800 text-center">
            <div className="animate-spin h-12 w-12 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-slate-400">Confirming your subscription...</p>
          </div>
        )}

        {/* Success State - First time confirmation */}
        {status === 'success' && (
          <div className="bg-[#0b1221] rounded-xl p-8 border border-slate-800 text-center">
            <div className="h-16 w-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            <h2 className="text-2xl font-bold text-white mb-2">You're Subscribed! 🎉</h2>
            <p className="text-slate-400 mb-6">{message}</p>
            
            <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-lg p-4 mb-6">
              <p className="text-sm text-indigo-300">
                📧 Check your inbox! Your first Daily Market Brief is on its way.
              </p>
            </div>

            <Link
              href="/"
              className="inline-block bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-6 py-3 rounded-lg transition-all"
            >
              Go to Dashboard
            </Link>
          </div>
        )}

        {/* Already Confirmed State */}
        {status === 'already_confirmed' && (
          <div className="bg-[#0b1221] rounded-xl p-8 border border-slate-800 text-center">
            <div className="h-16 w-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            
            <h2 className="text-2xl font-bold text-white mb-2">Already Confirmed ✓</h2>
            <p className="text-slate-400 mb-6">{message}</p>
            
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-300">
                📬 You're already receiving daily market briefs. No action needed!
              </p>
            </div>

            <Link
              href="/"
              className="inline-block bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-6 py-3 rounded-lg transition-all"
            >
              Go to Dashboard
            </Link>
          </div>
        )}

        {/* Error State */}
        {status === 'error' && (
          <div className="bg-red-950/30 rounded-xl p-8 border border-red-500/30 text-center">
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
        )}

        <p className="text-center text-slate-600 text-sm mt-6">
          © {new Date().getFullYear()} PutCall.nl
        </p>
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
