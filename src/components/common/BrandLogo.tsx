import React from 'react';

interface BrandLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  className = '',
  size = 'md',
  showText = true,
}) => {
  const iconSizes = {
    sm: 'w-10 h-10',
    md: 'w-14 h-14',
    lg: 'w-20 h-20',
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Plant Pot + Brain + Sprout + Watering Can SVG Illustration */}
      <div className={`relative flex-shrink-0 ${iconSizes[size]}`}>
        <svg
          viewBox="0 0 120 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-sm transition-transform duration-300 hover:scale-105"
        >
          {/* Terracotta Plant Pot */}
          <path
            d="M36 78 L42 108 C42.5 110.5 45 112 48 112 L72 112 C75 112 77.5 110.5 78 108 L84 78 Z"
            fill="#B4533C"
          />
          <rect
            x="32"
            y="74"
            width="56"
            height="9"
            rx="3"
            fill="#C25E45"
          />
          {/* Pot Rim Highlight */}
          <rect
            x="35"
            y="75.5"
            width="50"
            height="2"
            rx="1"
            fill="#E27D63"
            opacity="0.6"
          />

          {/* Plant Soil */}
          <ellipse cx="60" cy="76" rx="25" ry="4" fill="#5A3828" />

          {/* Brain (Pink/Coral) sitting in the pot like soil/bulb */}
          <g>
            {/* Left Brain Hemisphere */}
            <path
              d="M42 75 C37 74 34 68 35 62 C33 58 35 52 39 49 C39 44 44 41 50 42 C54 40 58 43 59 47 C59 56 59 66 59 75 C52 76 46 76 42 75 Z"
              fill="#F4978E"
            />
            {/* Right Brain Hemisphere */}
            <path
              d="M78 75 C83 74 86 68 85 62 C87 58 85 52 81 49 C81 44 76 41 70 42 C66 40 62 43 61 47 C61 56 61 66 61 75 C68 76 74 76 78 75 Z"
              fill="#F8A79D"
            />
            {/* Brain Sulci / Wrinkles */}
            <path
              d="M43 64 Q48 60 45 54 M52 50 Q50 58 55 65 M50 68 Q53 72 46 73"
              stroke="#E07A6F"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M77 64 Q72 60 75 54 M68 50 Q70 58 65 65 M70 68 Q67 72 74 73"
              stroke="#E07A6F"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </g>

          {/* Sprout Stem growing out of top of brain */}
          <path
            d="M60 44 Q58 30 63 20"
            stroke="#2E7D32"
            strokeWidth="3.5"
            strokeLinecap="round"
          />

          {/* Lush Green Plant Leaves */}
          {/* Left Leaf */}
          <path
            d="M60 32 C50 30 46 22 52 18 C58 14 62 25 60 32 Z"
            fill="#4CAF50"
          />
          <path
            d="M58 28 C52 24 50 20 52 18"
            stroke="#2E7D32"
            strokeWidth="1"
            strokeLinecap="round"
          />
          {/* Right Leaf */}
          <path
            d="M61 24 C71 22 75 14 69 10 C63 6 59 17 61 24 Z"
            fill="#66BB6A"
          />
          {/* Top Sprout Leaf */}
          <path
            d="M63 20 C64 12 70 8 72 12 C74 16 67 20 63 20 Z"
            fill="#81C784"
          />

          {/* Green Watering Can (Top-Right pouring onto brain) */}
          <g transform="translate(68, 6) rotate(18)">
            {/* Can Body */}
            <rect x="10" y="8" width="22" height="18" rx="5" fill="#2E7D32" />
            <rect x="8" y="7" width="26" height="4" rx="2" fill="#388E3C" />
            {/* Can Handle */}
            <path
              d="M32 12 C38 12 39 23 32 24"
              stroke="#2E7D32"
              strokeWidth="3.5"
              strokeLinecap="round"
              fill="none"
            />
            {/* Can Spout */}
            <path
              d="M10 20 L-2 14 L-4 17 L8 24 Z"
              fill="#1B5E20"
            />
            {/* Spout Head Rose */}
            <ellipse cx="-4" cy="15.5" rx="2.5" ry="4" fill="#388E3C" />
          </g>

          {/* Blue Water Droplets pouring down */}
          <ellipse cx="66" cy="35" rx="1.8" ry="3" fill="#42A5F5" opacity="0.85" />
          <ellipse cx="61" cy="40" rx="2" ry="3.5" fill="#29B6F6" opacity="0.9" />
          <ellipse cx="68" cy="45" rx="1.5" ry="2.5" fill="#42A5F5" opacity="0.8" />
          <ellipse cx="56" cy="48" rx="1.5" ry="2.5" fill="#29B6F6" opacity="0.8" />
          <ellipse cx="63" cy="52" rx="1.2" ry="2" fill="#64B5F6" opacity="0.75" />

          {/* Gentle Sparkles / Growth accents */}
          <circle cx="28" cy="45" r="1.5" fill="#81C784" opacity="0.8" />
          <circle cx="94" cy="52" r="1.8" fill="#81C784" opacity="0.8" />
          <circle cx="34" cy="30" r="1.2" fill="#A5D6A7" opacity="0.7" />
        </svg>
      </div>

      {/* Brand Text */}
      {showText && (
        <div className="flex flex-col">
          <div className="flex items-baseline tracking-tight">
            <span className="font-extrabold text-xl sm:text-2xl text-[#0f172a] dark:text-[#f8fafc]">
              accountability
            </span>
            <span className="font-extrabold text-xl sm:text-2xl text-[#16a34a] dark:text-[#22c55e]">
              Info
            </span>
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400 font-medium -mt-0.5 tracking-wide">
            Nurture Today. A Better You Tomorrow.
          </span>
        </div>
      )}
    </div>
  );
};
