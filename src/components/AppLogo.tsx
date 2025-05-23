
import { ChefHat } from 'lucide-react';
import type React from 'react';
import { cn } from '@/lib/utils';

interface AppLogoProps {
  className?: string;
  iconSize?: number;
  textSize?: string;
  onClick?: () => void; // New onClick prop
}

const AppLogo: React.FC<AppLogoProps> = ({ className, iconSize = 24, textSize = "text-2xl", onClick }) => {
  const letters = "Seera".split("");

  return (
    <div 
      className={cn(
        `flex items-center gap-2`, 
        onClick && 'cursor-pointer', // Add cursor-pointer if onClick is provided
        className
      )}
      onClick={onClick} // Apply onClick handler
    >
      <ChefHat
        size={iconSize}
        className="animated-logo-icon" // Retains existing icon animations
      />
      <h1 className={cn(`font-bold seera-text-container font-seera-brand`, textSize)}> 
        {letters.map((letter, index) => (
          <span
            key={index}
            className="letter" // Retains existing letter animations
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
