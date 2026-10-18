import React from 'react';

export { CoxmoxSunLogo } from '../icons/CoxmoxSunLogo';

// 1. Eruwa AI Official Logo Icon (Matches official Eruwa branding from /favicon.png)
export const EruwaSparkleIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <img
    src="/favicon.png"
    alt="Eruwa AI"
    className={`${className} object-contain`}
  />
);

// Small tab favicon (Matches official Eruwa branding)
export const EruwaTabIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <img
    src="/favicon.png"
    alt="Eruwa AI"
    className={`${className} object-contain`}
  />
);

// ============================================================================
// 2. NEW ORIGINAL DOCUMENTS / TEXT ICON & LOGO
// Design: Modern layered document canvas with folded corner, clean typography
// lines, and an accent quill/pen nib in sleek electric blue & indigo gradients.
// ============================================================================
export const DocumentIcon = ({ className = "w-8 h-8" }: { className?: string }) => (
  <svg viewBox="0 0 48 48" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="docGradMain" x1="10" y1="4" x2="38" y2="44" gradientUnits="userSpaceOnUse">
        <stop stopColor="#3B82F6" />
        <stop offset="1" stopColor="#1D4ED8" />
      </linearGradient>
      <linearGradient id="docGradFold" x1="28" y1="4" x2="40" y2="16" gradientUnits="userSpaceOnUse">
        <stop stopColor="#93C5FD" />
        <stop offset="1" stopColor="#60A5FA" />
      </linearGradient>
      <filter id="docShadow" x="4" y="2" width="40" height="44" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
        <feDropShadow dx="0" dy="2.5" stdDeviation="2" floodColor="#1E3A8A" floodOpacity="0.25" />
      </filter>
    </defs>
    <g filter="url(#docShadow)">
      {/* Document Sheet Body */}
      <path
        d="M11 7C11 5.34315 12.3431 4 14 4H28L39 15V41C39 42.6569 37.6569 44 36 44H14C12.3431 44 11 42.6569 11 41V7Z"
        fill="url(#docGradMain)"
      />
      {/* Corner Fold */}
      <path
        d="M28 4V12C28 13.6569 29.3431 15 31 15H39L28 4Z"
        fill="url(#docGradFold)"
      />
      {/* Content Text Lines */}
      <rect x="17" y="20" width="16" height="2.5" rx="1.25" fill="#FFFFFF" fillOpacity="0.95" />
      <rect x="17" y="26" width="16" height="2.5" rx="1.25" fill="#FFFFFF" fillOpacity="0.8" />
      <rect x="17" y="32" width="11" height="2.5" rx="1.25" fill="#FFFFFF" fillOpacity="0.8" />
      {/* Stylus / Pen Tip Accent Badge */}
      <circle cx="31" cy="33" r="5" fill="#2563EB" stroke="#FFFFFF" strokeWidth="1.5" />
      <path d="M29 34.5L32.5 31L33.5 32L30 35.5L28.8 35.8L29 34.5Z" fill="#FFFFFF" />
    </g>
  </svg>
);
export const DocumentLogo = DocumentIcon;
export const WordIcon = DocumentIcon;
export const TextIcon = DocumentIcon;

// ============================================================================
// 3. NEW ORIGINAL SHEET / SPREADSHEET ICON & LOGO
// Design: Emerald & teal modern analytical grid matrix with column headers,
// active cell glow, and upward trending data metric badge.
// ============================================================================
export const SheetIcon = ({ className = "w-8 h-8" }: { className?: string }) => (
  <svg viewBox="0 0 48 48" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="sheetGradMain" x1="8" y1="6" x2="40" y2="42" gradientUnits="userSpaceOnUse">
        <stop stopColor="#10B981" />
        <stop offset="1" stopColor="#047857" />
      </linearGradient>
      <filter id="sheetShadow" x="4" y="3" width="40" height="42" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
        <feDropShadow dx="0" dy="2.5" stdDeviation="2" floodColor="#064E3B" floodOpacity="0.25" />
      </filter>
    </defs>
    <g filter="url(#sheetShadow)">
      {/* Main Table Card */}
      <rect x="8" y="6" width="32" height="36" rx="6" fill="url(#sheetGradMain)" />
      {/* Top Header Strip */}
      <rect x="12" y="11" width="24" height="6" rx="2" fill="#FFFFFF" fillOpacity="0.25" />
      {/* Cell Matrix Grid */}
      <rect x="12" y="20" width="10.5" height="8" rx="2" fill="#FFFFFF" fillOpacity="0.9" />
      <rect x="25.5" y="20" width="10.5" height="8" rx="2" fill="#FFFFFF" fillOpacity="0.2" />
      <rect x="12" y="31" width="10.5" height="7" rx="2" fill="#FFFFFF" fillOpacity="0.2" />
      <rect x="25.5" y="31" width="10.5" height="7" rx="2" fill="#A7F3D0" fillOpacity="0.9" />
      {/* Chart Spark inside Active Cell */}
      <path
        d="M14.5 25.5L16.5 23.5L18.5 24.5L20.5 22"
        stroke="#047857"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
  </svg>
);
export const SheetLogo = SheetIcon;
export const ExcelIcon = SheetIcon;

// ============================================================================
// 4. NEW ORIGINAL SLIDE / PRESENTATION ICON & LOGO
// Design: 16:9 widescreen presentation canvas with amber & sunset orange
// gradients, projection pedestal, and vibrant analytics donut / pie chart.
// ============================================================================
export const SlideIcon = ({ className = "w-8 h-8" }: { className?: string }) => (
  <svg viewBox="0 0 48 48" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="slideGradMain" x1="6" y1="8" x2="42" y2="34" gradientUnits="userSpaceOnUse">
        <stop stopColor="#F59E0B" />
        <stop offset="1" stopColor="#EA580C" />
      </linearGradient>
      <filter id="slideShadow" x="3" y="5" width="42" height="38" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
        <feDropShadow dx="0" dy="2.5" stdDeviation="2" floodColor="#7C2D12" floodOpacity="0.25" />
      </filter>
    </defs>
    <g filter="url(#slideShadow)">
      {/* Presentation Screen Frame (16:9) */}
      <rect x="6" y="8" width="36" height="26" rx="5" fill="url(#slideGradMain)" />
      {/* Slide Stand / Easel Base */}
      <path d="M24 34V40M17 40H31" stroke="#EA580C" strokeWidth="2.5" strokeLinecap="round" />
      {/* Donut / Pie Chart on Slide */}
      <circle cx="18" cy="21" r="6" stroke="#FFFFFF" strokeWidth="3" strokeOpacity="0.3" fill="none" />
      <path
        d="M18 15A6 6 0 0 1 24 21L18 21Z"
        fill="#FFFFFF"
      />
      {/* Slide Layout Header & Bullets */}
      <rect x="27" y="16" width="10" height="2.2" rx="1.1" fill="#FFFFFF" fillOpacity="0.95" />
      <rect x="27" y="21" width="8" height="1.8" rx="0.9" fill="#FFFFFF" fillOpacity="0.75" />
      <rect x="27" y="25" width="6" height="1.8" rx="0.9" fill="#FFFFFF" fillOpacity="0.75" />
    </g>
  </svg>
);
export const SlideLogo = SlideIcon;
export const PowerPointIcon = SlideIcon;
export const PresentationIcon = SlideIcon;

// ============================================================================
// 5. NEW ORIGINAL PDF DOCUMENT ICON & LOGO
// Design: Sleek crimson & ruby vector document with security badge and bold
// PDF emblem glyph.
// ============================================================================
export const PdfIcon = ({ className = "w-8 h-8" }: { className?: string }) => (
  <svg viewBox="0 0 48 48" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="pdfGradMain" x1="10" y1="4" x2="38" y2="44" gradientUnits="userSpaceOnUse">
        <stop stopColor="#F43F5E" />
        <stop offset="1" stopColor="#BE123C" />
      </linearGradient>
      <filter id="pdfShadow" x="4" y="2" width="40" height="44" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
        <feDropShadow dx="0" dy="2.5" stdDeviation="2" floodColor="#881337" floodOpacity="0.25" />
      </filter>
    </defs>
    <g filter="url(#pdfShadow)">
      {/* Document Sheet */}
      <path
        d="M11 7C11 5.34315 12.3431 4 14 4H29L39 14V41C39 42.6569 37.6569 44 36 44H14C12.3431 44 11 42.6569 11 41V7Z"
        fill="url(#pdfGradMain)"
      />
      {/* Folded Corner */}
      <path d="M29 4V11C29 12.6569 30.3431 14 32 14H39L29 4Z" fill="#FDA4AF" />
      {/* Center PDF Badge */}
      <rect x="13.5" y="21" width="23" height="13" rx="3.5" fill="#881337" />
      <text
        x="25"
        y="30.5"
        textAnchor="middle"
        fill="#FFFFFF"
        fontSize="8.5"
        fontWeight="900"
        fontFamily="system-ui, -apple-system, sans-serif"
        letterSpacing="0.8"
      >
        PDF
      </text>
    </g>
  </svg>
);
export const PdfLogo = PdfIcon;

// ============================================================================
// 6. NEW ORIGINAL OFFICE SUITE LOGO
// Design: Unified 4-quadrant diamond combining Blue (Docs), Green (Sheet),
// Orange (Slide), and Crimson (PDF) in harmony.
// ============================================================================
export const OfficeSuiteIcon = ({ className = "w-8 h-8" }: { className?: string }) => (
  <svg viewBox="0 0 48 48" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
    <defs>
      <filter id="officeShadow" x="4" y="4" width="40" height="40" filterUnits="userSpaceOnUse">
        <feDropShadow dx="0" dy="2" stdDeviation="2.5" floodColor="#0F172A" floodOpacity="0.2" />
      </filter>
    </defs>
    <g filter="url(#officeShadow)">
      {/* Top Left: Documents (Blue) */}
      <rect x="8" y="8" width="14" height="14" rx="4" fill="#2563EB" />
      <rect x="11" y="13" width="8" height="1.8" rx="0.9" fill="#FFFFFF" fillOpacity="0.9" />
      <rect x="11" y="16.5" width="5" height="1.8" rx="0.9" fill="#FFFFFF" fillOpacity="0.75" />

      {/* Top Right: Sheets (Green) */}
      <rect x="26" y="8" width="14" height="14" rx="4" fill="#059669" />
      <rect x="29" y="11" width="4" height="3.5" rx="1" fill="#FFFFFF" fillOpacity="0.9" />
      <rect x="34" y="11" width="3" height="3.5" rx="1" fill="#FFFFFF" fillOpacity="0.4" />
      <rect x="29" y="15.5" width="4" height="3.5" rx="1" fill="#FFFFFF" fillOpacity="0.4" />
      <rect x="34" y="15.5" width="3" height="3.5" rx="1" fill="#A7F3D0" />

      {/* Bottom Left: Slides (Orange) */}
      <rect x="8" y="26" width="14" height="14" rx="4" fill="#EA580C" />
      <circle cx="15" cy="33" r="3.5" fill="#FFFFFF" fillOpacity="0.3" />
      <path d="M15 29.5A3.5 3.5 0 0 1 18.5 33L15 33Z" fill="#FFFFFF" />

      {/* Bottom Right: PDF (Crimson) */}
      <rect x="26" y="26" width="14" height="14" rx="4" fill="#E11D48" />
      <text
        x="33"
        y="35.5"
        textAnchor="middle"
        fill="#FFFFFF"
        fontSize="5.5"
        fontWeight="900"
        fontFamily="system-ui, -apple-system, sans-serif"
      >
        PDF
      </text>
    </g>
  </svg>
);
export const OfficeIcon = OfficeSuiteIcon;
export const OfficeLogo = OfficeSuiteIcon;

// ============================================================================
// 7. Cereva Robot Icon
// ============================================================================
export const CerevaRobotIcon = ({ className = "w-8 h-8" }: { className?: string }) => (
  <svg viewBox="0 0 48 48" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="cerevaBg" x1="6" y1="6" x2="42" y2="42" gradientUnits="userSpaceOnUse">
        <stop stopColor="#6366F1" />
        <stop offset="1" stopColor="#4338CA" />
      </linearGradient>
    </defs>
    <rect x="6" y="6" width="36" height="36" rx="10" fill="url(#cerevaBg)" filter="drop-shadow(0 4px 8px rgba(79, 70, 229, 0.3))" />
    <circle cx="24" cy="11" r="2.5" fill="#A5B4FC" />
    <line x1="24" y1="13.5" x2="24" y2="16.5" stroke="#A5B4FC" strokeWidth="2" strokeLinecap="round" />
    <rect x="12" y="16.5" width="24" height="19" rx="6" fill="#1E1B4B" />
    <circle cx="18" cy="24" r="2.5" fill="#38BDF8" />
    <circle cx="30" cy="24" r="2.5" fill="#38BDF8" />
    <path d="M20 29.5C21 31 27 31 28 29.5" stroke="#38BDF8" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

// ============================================================================
// 8. Official PNG Icons (Accessible directly as 512x512 images from /icons/)
// ============================================================================
export const DocumentPngIcon = ({ className = "w-8 h-8", alt = "Document" }: { className?: string; alt?: string }) => (
  <img src="/icons/document.png" alt={alt} className={`${className} object-contain`} />
);

export const SheetPngIcon = ({ className = "w-8 h-8", alt = "Sheet" }: { className?: string; alt?: string }) => (
  <img src="/icons/sheet.png" alt={alt} className={`${className} object-contain`} />
);

export const SlidePngIcon = ({ className = "w-8 h-8", alt = "Slide" }: { className?: string; alt?: string }) => (
  <img src="/icons/slide.png" alt={alt} className={`${className} object-contain`} />
);

export const PdfPngIcon = ({ className = "w-8 h-8", alt = "PDF" }: { className?: string; alt?: string }) => (
  <img src="/icons/pdf.png" alt={alt} className={`${className} object-contain`} />
);

export const OfficePngIcon = ({ className = "w-8 h-8", alt = "Office Suite" }: { className?: string; alt?: string }) => (
  <img src="/icons/office.png" alt={alt} className={`${className} object-contain`} />
);

