import React from 'react';

interface CoxmoxSunProps {
  size?: number;
  className?: string;
  isProcessing?: boolean;
}

/**
 * CoxmoxSunLogo:
 * Represents the official Eruwa AI / Coxmox Intelligence Sun logo.
 * Features:
 * - Central glowing solar core with smooth gradient
 * - Clockwise rotating outer corona sun rays / orbit ring
 * - Counter-clockwise rotating inner solar flare ring
 * - When isProcessing is true: creates an animated multi-directional rotational pulsing state
 */
export const CoxmoxSunLogo: React.FC<CoxmoxSunProps> = ({
  size = 40,
  className = '',
  isProcessing = false
}) => {
  return (
    <div
      className={`relative flex items-center justify-center select-none ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Ambient background solar aura */}
      <div
        className={`absolute inset-0 rounded-full blur-md transition-opacity duration-500 pointer-events-none ${
          isProcessing
            ? 'opacity-85 bg-gradient-to-tr from-cyan-400 via-indigo-500 to-amber-300 animate-pulse'
            : 'opacity-40 bg-gradient-to-tr from-blue-400 to-indigo-500'
        }`}
      />

      {/* SVG Canvas with dual-rotating clockwise and counter-clockwise solar rings */}
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full relative z-10 overflow-visible"
      >
        <defs>
          {/* Solar core gradient */}
          <linearGradient id="solarCoreGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38BDF8" />
            <stop offset="50%" stopColor="#6366F1" />
            <stop offset="100%" stopColor="#A855F7" />
          </linearGradient>

          {/* Outer Sun Rays gradient (Clockwise) */}
          <linearGradient id="sunRaysClockwise" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.9" />
            <stop offset="50%" stopColor="#818CF8" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#C084FC" stopOpacity="0.2" />
          </linearGradient>

          {/* Inner Counter-Clockwise Solar Flare gradient */}
          <linearGradient id="sunRaysCounter" x1="100%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#F472B6" stopOpacity="0.9" />
            <stop offset="50%" stopColor="#C084FC" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.2" />
          </linearGradient>

          {/* Glow filter */}
          <filter id="solarGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* 1. OUTER SUN CORONA RAYS (Rotates CLOCKWISE) */}
        <g
          className={isProcessing ? "animate-[spin_4s_linear_infinite]" : "animate-[spin_18s_linear_infinite]"}
          style={{ transformOrigin: '50px 50px' }}
        >
          {/* 12 Solar Petals / Sun Rays */}
          {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
            <ellipse
              key={`outer-${deg}`}
              cx="50"
              cy="14"
              rx="3.5"
              ry="10"
              transform={`rotate(${deg} 50 50)`}
              fill="url(#sunRaysClockwise)"
              filter="url(#solarGlow)"
            />
          ))}
          <circle
            cx="50"
            cy="50"
            r="41"
            fill="none"
            stroke="url(#sunRaysClockwise)"
            strokeWidth="1.2"
            strokeDasharray="4 8"
            opacity="0.6"
          />
        </g>

        {/* 2. INNER SOLAR FLARE RING (Rotates COUNTER-CLOCKWISE) */}
        <g
          className={isProcessing ? "animate-[spin_3s_linear_infinite_reverse]" : "animate-[spin_12s_linear_infinite_reverse]"}
          style={{ transformOrigin: '50px 50px' }}
        >
          {[15, 45, 75, 105, 135, 165, 195, 225, 255, 285, 315, 345].map((deg) => (
            <path
              key={`inner-${deg}`}
              d="M 50 24 Q 53 32 50 40 Q 47 32 50 24"
              transform={`rotate(${deg} 50 50)`}
              fill="url(#sunRaysCounter)"
            />
          ))}
          <circle
            cx="50"
            cy="50"
            r="28"
            fill="none"
            stroke="url(#sunRaysCounter)"
            strokeWidth="1.5"
            strokeDasharray="8 6"
            opacity="0.7"
          />
        </g>

        {/* 3. CENTRAL INTELLIGENCE SOLAR CORE */}
        <circle
          cx="50"
          cy="50"
          r="18"
          fill="url(#solarCoreGrad)"
          filter="url(#solarGlow)"
        />

        {/* Subtle white specular highlight at top of core */}
        <ellipse
          cx="46"
          cy="42"
          rx="7"
          ry="4"
          transform="rotate(-25 46 42)"
          fill="#FFFFFF"
          fillOpacity="0.45"
        />

        {/* Core spark symbol */}
        <path
          d="M 50 38 L 52 47 L 61 49 L 52 51 L 50 60 L 48 51 L 39 49 L 48 47 Z"
          fill="#FFFFFF"
          fillOpacity={isProcessing ? "0.95" : "0.75"}
        />
      </svg>
    </div>
  );
};

export default CoxmoxSunLogo;
