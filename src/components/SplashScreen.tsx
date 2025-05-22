
'use client';

import React, { useState, useEffect } from 'react';
import AppLogo from '@/components/AppLogo';
import { cn } from '@/lib/utils';

interface SplashScreenProps {
  onFinished: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onFinished }) => {
  const [step, setStep] = useState<'initial' | 'logoAnimate' | 'fadeOut' | 'finished'>('initial');

  useEffect(() => {
    if (step === 'initial') {
      // Delay before logo animation starts
      const timer = setTimeout(() => setStep('logoAnimate'), 1000);
      return () => clearTimeout(timer);
    }
    if (step === 'logoAnimate') {
      // Duration for logo animation to complete + small buffer before screen fade
      const timer = setTimeout(() => setStep('fadeOut'), 1000); // Logo animation is 700ms
      return () => clearTimeout(timer);
    }
    if (step === 'fadeOut') {
      // Duration for screen fade out
      const timer = setTimeout(() => {
        setStep('finished');
        onFinished();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [step, onFinished]);

  return (
    <div
      className={cn(
        'fixed inset-0 z-[200] flex items-center justify-center bg-background transition-opacity duration-500 ease-in-out',
        step === 'fadeOut' ? 'opacity-0' : 'opacity-100'
      )}
    >
      <div
        className={cn(
          'transition-all duration-700 ease-in-out',
          // Animate logo: scale down and fade out
          step === 'logoAnimate' || step === 'fadeOut' ? 'scale-50 opacity-0' : 'scale-100 opacity-100'
        )}
      >
        <AppLogo iconSize={64} textSize="text-6xl" />
      </div>
    </div>
  );
};

export default SplashScreen;
