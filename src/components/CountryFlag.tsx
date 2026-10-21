import React from 'react';
import { getCountryMeta } from '../data/africanDirectory';

interface CountryFlagProps {
  country: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showEmojiFallback?: boolean;
}

export const CountryFlag: React.FC<CountryFlagProps> = ({
  country,
  className = '',
  size = 'md',
  showEmojiFallback = true
}) => {
  const meta = getCountryMeta(country);
  const code = meta.code?.toLowerCase();
  
  const dimensions = {
    sm: { width: 18, height: 13, text: 'text-sm' },
    md: { width: 22, height: 16, text: 'text-base' },
    lg: { width: 28, height: 20, text: 'text-lg' }
  }[size];

  // If valid 2-letter ISO country code exists, render image with emoji fallback
  if (code && code.length === 2 && code !== 'af') {
    return (
      <span className={`inline-flex items-center justify-center shrink-0 ${className}`}>
        <img
          src={`https://flagcdn.com/w40/${code}.png`}
          srcSet={`https://flagcdn.com/w80/${code}.png 2x`}
          alt={country || 'Drapeau'}
          className="rounded-xs object-cover shadow-2xs border border-slate-300/40 inline-block align-middle"
          style={{ width: dimensions.width, height: dimensions.height }}
          loading="lazy"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
            const fallback = e.currentTarget.parentElement?.querySelector('.flag-emoji-fallback') as HTMLElement;
            if (fallback) fallback.style.display = 'inline';
          }}
        />
        {showEmojiFallback && (
          <span className="flag-emoji-fallback leading-none" style={{ display: 'none' }}>
            {meta.flag || '🌍'}
          </span>
        )}
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center justify-center shrink-0 leading-none ${dimensions.text} ${className}`}>
      {meta.flag || '🌍'}
    </span>
  );
};

export default CountryFlag;
