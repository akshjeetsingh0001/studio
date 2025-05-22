
import { ChefHat } from 'lucide-react';
import type React from 'react';

interface AppLogoProps {
  className?: string;
  iconSize?: number;
  textSize?: string;
}

const AppLogo: React.FC<AppLogoProps> = ({ className, iconSize = 24, textSize = "text-2xl" }) => {
  const letters = "Seera".split("");

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <ChefHat
        size={iconSize}
        className="animated-logo-icon"
      />
      <h1 className={`font-bold ${textSize} seera-text-container`}>
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
