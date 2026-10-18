import React from 'react';

interface CoxmoxProcessingLogoProps {
  size?: number;
  className?: string;
  isProcessing?: boolean;
}

export const CoxmoxProcessingLogo: React.FC<CoxmoxProcessingLogoProps> = ({
  size = 32,
  className = '',
  isProcessing = true,
}) => {
  return (
    <div
      className={`relative inline-flex items-center justify-center select-none flex-shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Ambient background soft glow */}
      {isProcessing && (
        <div className="absolute inset-0 rounded-full bg-blue-500/20 blur-md pointer-events-none animate-pulse" />
      )}
      
      {/* Clean transparent animated GIF created with Google Flow */}
      <img
        src="/coxmox_processing_clean.webp"
        alt="Coxmox Processing"
        className="w-full h-full object-contain relative z-10 drop-shadow-sm"
        onError={(e) => {
          // Fallback to gif if webp not supported
          (e.currentTarget as HTMLImageElement).src = '/coxmox_processing.gif';
        }}
      />
    </div>
  );
};

export default CoxmoxProcessingLogo;
