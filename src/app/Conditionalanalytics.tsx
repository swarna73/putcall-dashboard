"use client";

import React, { useEffect, useState } from 'react';
import { GoogleAnalytics } from '@next/third-parties/google';
import CookieConsent from '@/components/CookieConsent';

const ConditionalAnalytics: React.FC = () => {
  const [hasConsent, setHasConsent] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    // Check localStorage for consent
    const consent = localStorage.getItem('cookie-consent');
    setHasConsent(consent === 'accepted');
  }, []);

  // Only render on client side to avoid hydration mismatch
  if (!isClient) return null;

  return (
    <>
      {/* Show cookie banner if no choice made yet */}
      <CookieConsent />
      
      {/* Only load Google Analytics if user accepted */}
      {hasConsent && <GoogleAnalytics gaId="G-9WED2VBRB2" />}
    </>
  );
};

export default ConditionalAnalytics;
