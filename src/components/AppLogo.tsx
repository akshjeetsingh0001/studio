
import { ChefHat } from 'lucide-react';
import type React from 'react';

interface AppLogoProps {
  className?: string;
  iconSize?: number;
  textSize?: string;
}

const AppLogo: React.FC<AppLogoProps> = ({ className, iconSize = 24, textSize = "text-2xl" }) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <ChefHat size={iconSize} className="text-primary animate-logo-icon-pulse" />
      <h1 className={`font-bold ${textSize}`}>
        <span className="text-rgb-animate">Seera</span>
      </h1>
    </div>
  );
};

export default AppLogo;
