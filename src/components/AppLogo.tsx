
import { ChefHat } from 'lucide-react';
import type React from 'react';
import { cn } from '@/lib/utils';

interface AppLogoProps {
  className?: string;
  iconSize?: number;
  textSize?: string;
}

const AppLogo: React.FC<AppLogoProps> = ({ className, iconSize = 24, textSize = "text-2xl" }) => {
  const letters = "Seera".split("");

  return (
    <div className={cn(`flex items-center gap-2`, className)}>
      <ChefHat
        size={iconSize}
        className="animated-logo-icon"
      />
      <h1 className={cn(`font-bold seera-text-container font-seera-brand`, textSize)}>
        {letters.map((letter, index) => (
          <span
            key={index}
            className="letter"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            {letter}
          </span>
        ))}
      </h1>
    </div>
  );
};

export default AppLogo;
