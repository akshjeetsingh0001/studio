
'use client';

import React, { useState, useEffect } from 'react';
import AppLogo from '@/components/AppLogo';
import { cn } from '@/lib/utils';

interface SplashScreenProps {
  onFinished: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onFinished }) => {
  // Phases:
  // 'visible': Logo and screen are fully visible.
  // 'logoHiding': Logo starts its shrink/fade animation. Screen still fully visible.
  // 'screenFading': Screen starts fading out. Logo continues/completes its animation.
  const [phase, setPhase] = useState<'visible' | 'logoHiding' | 'screenFading'>('visible');

  useEffect(() => {
    if (phase === 'visible') {
      // Duration logo is fully visible before it starts animating out
      const timer = setTimeout(() => setPhase('logoHiding'), 1200); // Increased from 1000ms
      return () => clearTimeout(timer);
    }
    if (phase === 'logoHiding') {
      // Duration for the logo's shrink/fade animation (700ms) plus a small buffer
      // before the screen starts fading.
      const timer = setTimeout(() => setPhase('screenFading'), 800); // Was 1000ms, making it slightly faster to start screen fade
      return () => clearTimeout(timer);
    }
    if (phase === 'screenFading') {
      // Duration for the screen to fade out
      const timer = setTimeout(() => {
        onFinished();
      }, 500); // Screen fade duration
      return () => clearTimeout(timer);
    }
  }, [phase, onFinished]);

  return (
    <div
      className={cn(
        'fixed inset-0 z-[200] flex items-center justify-center bg-background transition-opacity duration-500 ease-in-out',
        phase === 'screenFading' ? 'opacity-0' : 'opacity-100'
      )}
    >
      <div
        className={cn(
          'transition-all duration-700 ease-in-out', // Logo's own animation duration for scale/opacity
          phase === 'logoHiding' || phase === 'screenFading' ? 'scale-50 opacity-0' : 'scale-100 opacity-100'
        )}
      >
        <AppLogo iconSize={64} textSize="text-6xl" />
      </div>
    </div>
  );
};

export default SplashScreen;
