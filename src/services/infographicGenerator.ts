/**
 * Professional NABH Infographic Generator
 * Creates high-quality, modern, bilingual healthcare infographics
 * 
 * Features:
 * - Multiple modern templates (poster, card, banner, signage)
 * - Bilingual support (English/Hindi)
 * - Professional healthcare color schemes
 * - Modern design with gradients, shadows, icons
 * - Print-ready output (A4/A3 compatible)
 * - SVG output for scalability
 */

// Removed static import of HOSPITAL_INFO to support multi-hospital architecture
// import { HOSPITAL_INFO } from '../config/hospitalConfig';

// ============================================
// Types & Interfaces
// ============================================

export type InfographicTemplate = 
  | 'modern-poster' 
  | 'gradient-card' 
  | 'minimal-signage' 
  | 'corporate-banner'
  | 'healthcare-steps'
  | 'compliance-checklist';

export type ColorScheme = 
  | 'healthcare-blue' 
  | 'safety-green' 
  | 'alert-red' 
  | 'calm-teal'
  | 'professional-navy'
  | 'vibrant-gradient';

export interface InfographicConfig {
  title: string;
  titleHindi?: string;
  subtitle?: string;
  subtitleHindi?: string;
  code?: string;
  isCore?: boolean;
  description: string;
  descriptionHindi?: string;
  keyPoints?: string[];
  keyPointsHindi?: string[];
  hospitalName?: string;
  hospitalAddress?: string;
  template?: InfographicTemplate;
  colorScheme?: ColorScheme;
  showIcons?: boolean;
  showQRPlaceholder?: boolean;
  width?: number;
  height?: number;
}

interface ColorPalette {
  primary: string;
  primaryLight: string;
  primaryDark: string;
  secondary: string;
  accent: string;
  background: string;
  backgroundAlt: string;
  text: string;
  textLight: string;
  textOnPrimary: string;
  gradient: string;
  shadowColor: string;
}

// ============================================
// Color Palettes
// ============================================

const colorPalettes: Record<ColorScheme, ColorPalette> = {
  'healthcare-blue': {
    primary: '#1565C0',
    primaryLight: '#42A5F5',
    primaryDark: '#0D47A1',
    secondary: '#E3F2FD',
    accent: '#FF5722',
    background: '#FFFFFF',
    backgroundAlt: '#F8FAFC',
    text: '#1E293B',
    textLight: '#64748B',
    textOnPrimary: '#FFFFFF',
    gradient: 'url(#healthcareGradient)',
    shadowColor: 'rgba(21, 101, 192, 0.3)',
  },
  'safety-green': {
    primary: '#2E7D32',
    primaryLight: '#66BB6A',
    primaryDark: '#1B5E20',
    secondary: '#E8F5E9',
    accent: '#FF9800',
    background: '#FFFFFF',
    backgroundAlt: '#F1F8E9',
    text: '#1E293B',
    textLight: '#64748B',
    textOnPrimary: '#FFFFFF',
    gradient: 'url(#safetyGradient)',
    shadowColor: 'rgba(46, 125, 50, 0.3)',
  },
  'alert-red': {
    primary: '#C62828',
    primaryLight: '#EF5350',
    primaryDark: '#B71C1C',
    secondary: '#FFEBEE',
    accent: '#FFC107',
    background: '#FFFFFF',
    backgroundAlt: '#FFF8E1',
    text: '#1E293B',
    textLight: '#64748B',
    textOnPrimary: '#FFFFFF',
    gradient: 'url(#alertGradient)',
    shadowColor: 'rgba(198, 40, 40, 0.3)',
  },
  'calm-teal': {
    primary: '#00796B',
    primaryLight: '#4DB6AC',
    primaryDark: '#004D40',
    secondary: '#E0F2F1',
    accent: '#7C4DFF',
    background: '#FFFFFF',
    backgroundAlt: '#E0F7FA',
    text: '#1E293B',
    textLight: '#64748B',
    textOnPrimary: '#FFFFFF',
    gradient: 'url(#tealGradient)',
    shadowColor: 'rgba(0, 121, 107, 0.3)',
  },
  'professional-navy': {
    primary: '#1A237E',
    primaryLight: '#3F51B5',
    primaryDark: '#0D1259',
    secondary: '#E8EAF6',
    accent: '#00BCD4',
    background: '#FFFFFF',
    backgroundAlt: '#F5F5F5',
    text: '#1E293B',
    textLight: '#64748B',
    textOnPrimary: '#FFFFFF',
    gradient: 'url(#navyGradient)',
    shadowColor: 'rgba(26, 35, 126, 0.3)',
  },
  'vibrant-gradient': {
    primary: '#6366F1',
    primaryLight: '#818CF8',
    primaryDark: '#4F46E5',
    secondary: '#EEF2FF',
    accent: '#F59E0B',
    background: '#FFFFFF',
    backgroundAlt: '#F8FAFC',
    text: '#1E293B',
    textLight: '#64748B',
    textOnPrimary: '#FFFFFF',
    gradient: 'url(#vibrantGradient)',
    shadowColor: 'rgba(99, 102, 241, 0.3)',
  },
};

// ============================================
// SVG Definitions (Gradients, Filters, Patterns)
// ============================================

const getSvgDefs = (colors: ColorPalette): string => `
  <defs>
    <!-- Healthcare Blue Gradient -->
    <linearGradient id="healthcareGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#1565C0;stop-opacity:1" />
      <stop offset="50%" style="stop-color:#1976D2;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#42A5F5;stop-opacity:1" />
    </linearGradient>
    
    <!-- Safety Green Gradient -->
    <linearGradient id="safetyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#1B5E20;stop-opacity:1" />
      <stop offset="50%" style="stop-color:#2E7D32;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#43A047;stop-opacity:1" />
    </linearGradient>
    
    <!-- Alert Red Gradient -->
    <linearGradient id="alertGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#B71C1C;stop-opacity:1" />
      <stop offset="50%" style="stop-color:#C62828;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#E53935;stop-opacity:1" />
    </linearGradient>
    
    <!-- Teal Gradient -->
    <linearGradient id="tealGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#004D40;stop-opacity:1" />
      <stop offset="50%" style="stop-color:#00796B;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#26A69A;stop-opacity:1" />
    </linearGradient>
    
    <!-- Navy Gradient -->
    <linearGradient id="navyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0D1259;stop-opacity:1" />
      <stop offset="50%" style="stop-color:#1A237E;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#303F9F;stop-opacity:1" />
    </linearGradient>
    
    <!-- Vibrant Gradient -->
    <linearGradient id="vibrantGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#4F46E5;stop-opacity:1" />
      <stop offset="50%" style="stop-color:#6366F1;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#818CF8;stop-opacity:1" />
    </linearGradient>
    
    <!-- Card Background Gradient -->
    <linearGradient id="cardBgGradient" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:#FFFFFF;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#F8FAFC;stop-opacity:1" />
    </linearGradient>
    
    <!-- Subtle Pattern -->
    <pattern id="subtlePattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
      <circle cx="20" cy="20" r="1" fill="${colors.primary}" opacity="0.05"/>
    </pattern>
    
    <!-- Drop Shadow Filter -->
    <filter id="dropShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="4" stdDeviation="8" flood-color="${colors.shadowColor}" flood-opacity="0.4"/>
    </filter>
    
    <!-- Soft Shadow Filter -->
    <filter id="softShadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="#000000" flood-opacity="0.1"/>
    </filter>
    
    <!-- Glow Effect -->
    <filter id="glow">
      <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
    
    <!-- Icon Clip Path -->
    <clipPath id="circleClip">
      <circle cx="25" cy="25" r="25"/>
    </clipPath>
  </defs>
`;

// ============================================
// Healthcare Icons (SVG Paths)
// ============================================

const healthcareIcons = {
  medicalCross: `<path d="M18 3H6v6H0v6h6v6h12v-6h6v-6h-6V3z" fill="currentColor"/>`,
  
  heartPulse: `<path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="currentColor"/>
  <path d="M4 12h4l2-4 3 8 2-4h4" stroke="currentColor" stroke-width="2" fill="none"/>`,
  
  shield: `<path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 6c1.4 0 2.8 1.1 2.8 2.5V11c.6.3 1.2 1 1.2 1.8V15c0 1-1 2-2 2h-4c-1 0-2-1-2-2v-2.2c0-.8.5-1.5 1.2-1.8V9.5C9.2 8.1 10.6 7 12 7z" fill="currentColor"/>`,
  
  checkCircle: `<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="currentColor"/>`,
  
  clipboard: `<path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" fill="currentColor"/>`,
  
  handWash: `<path d="M12 2C9.24 2 7 4.24 7 7v2H5v2h2v9h10v-9h2V9h-2V7c0-2.76-2.24-5-5-5zm3 7H9V7c0-1.66 1.34-3 3-3s3 1.34 3 3v2z" fill="currentColor"/>
  <circle cx="9" cy="14" r="1" fill="currentColor"/>
  <circle cx="12" cy="14" r="1" fill="currentColor"/>
  <circle cx="15" cy="14" r="1" fill="currentColor"/>`,
  
  fire: `<path d="M13.5 0.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5.67zM11.71 19c-1.78 0-3.22-1.4-3.22-3.14 0-1.62 1.05-2.76 2.81-3.12 1.77-.36 3.6-1.21 4.62-2.58.39 1.29.59 2.65.59 4.04 0 2.65-2.15 4.8-4.8 4.8z" fill="currentColor"/>`,
  
  biohazard: `<path d="M12 2a10 10 0 100 20 10 10 0 000-20zm0 3a2 2 0 110 4 2 2 0 010-4zm-4 8a2 2 0 114 0 2 2 0 01-4 0zm8 0a2 2 0 11-4 0 2 2 0 014 0z" fill="currentColor"/>`,
  
  stethoscope: `<path d="M19 8c-1.66 0-3 1.34-3 3v1c0 2.21-1.79 4-4 4s-4-1.79-4-4V8.83c1.17-.41 2-1.52 2-2.83 0-1.66-1.34-3-3-3S4 4.34 4 6c0 1.31.83 2.42 2 2.83V12c0 3.31 2.69 6 6 6s6-2.69 6-6v-1c0-.55.45-1 1-1s1 .45 1 1v4c0 .55-.45 1-1 1h-1v2h1c1.66 0 3-1.34 3-3v-4c0-1.66-1.34-3-3-3z" fill="currentColor"/>`,
  
  hospital: `<path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-4 8h-2v2h-2v-2H9V9h2V7h2v2h2v2z" fill="currentColor"/>`,
};

// ============================================
// Text Wrapping Utility
// ============================================

const wrapText = (text: string, maxWidth: number, fontSize: number): string[] => {
  const avgCharWidth = fontSize * 0.55;
  const maxChars = Math.floor(maxWidth / avgCharWidth);
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  words.forEach(word => {
    if ((currentLine + ' ' + word).length <= maxChars) {
      currentLine = currentLine ? currentLine + ' ' + word : word;
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  });
  if (currentLine) lines.push(currentLine);
  return lines;
};

// ============================================
// Template: Modern Poster
// ============================================

const generateModernPoster = (config: InfographicConfig, colors: ColorPalette): string => {
  const width = config.width || 800;
  const height = config.height || 1100;
  const hospitalName = config.hospitalName || "Hospital Name";
  const hospitalAddress = config.hospitalAddress || "";
  
  const keyPoints = config.keyPoints || [];
  const keyPointsHindi = config.keyPointsHindi || [];
  
  // Wrap description text
  const descLines = wrapText(config.description, width - 120, 16);
  const hindiDescLines = config.descriptionHindi ? wrapText(config.descriptionHindi, width - 120, 15) : [];

  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      ${getSvgDefs(colors)}
      
      <!-- Background -->
      <rect width="100%" height="100%" fill="${colors.background}"/>
      <rect width="100%" height="100%" fill="url(#subtlePattern)"/>
      
      <!-- Header Section with Gradient -->
      <rect x="0" y="0" width="${width}" height="180" fill="${colors.gradient}" rx="0"/>
      
      <!-- Decorative Elements -->
      <circle cx="${width - 60}" cy="90" r="120" fill="${colors.textOnPrimary}" opacity="0.05"/>
      <circle cx="${width - 30}" cy="60" r="80" fill="${colors.textOnPrimary}" opacity="0.05"/>
      
      <!-- Hospital Logo Area -->
      <rect x="40" y="30" width="80" height="80" rx="16" fill="${colors.textOnPrimary}" filter="url(#softShadow)"/>
      <g transform="translate(56, 46)">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="${colors.primary}">
          ${healthcareIcons.hospital}
        </svg>
      </g>
      
      <!-- Hospital Name -->
      <text x="140" y="60" font-family="'Segoe UI', Arial, sans-serif" font-size="28" font-weight="700" fill="${colors.textOnPrimary}">
        ${hospitalName}
      </text>
      <text x="140" y="88" font-family="'Segoe UI', Arial, sans-serif" font-size="14" fill="${colors.textOnPrimary}" opacity="0.9">
        ${hospitalAddress}
      </text>
      
      <!-- NABH Badge -->
      <g transform="translate(${width - 160}, 30)">
        <rect width="120" height="40" rx="20" fill="${colors.textOnPrimary}"/>
        <text x="60" y="26" font-family="'Segoe UI', Arial, sans-serif" font-size="14" font-weight="700" fill="${colors.primary}" text-anchor="middle">
          NABH Certified
        </text>
      </g>
      
      <!-- Code Badge -->
      ${config.code ? `
        <g transform="translate(40, 130)">
          <rect width="auto" height="36" rx="18" fill="${colors.textOnPrimary}" filter="url(#softShadow)" style="width: fit-content; padding: 0 20px;"/>
          <rect x="0" y="0" width="${config.code.length * 14 + 40}" height="36" rx="18" fill="${colors.textOnPrimary}"/>
          <text x="${(config.code.length * 14 + 40) / 2}" y="24" font-family="'Segoe UI', Arial, sans-serif" font-size="16" font-weight="700" fill="${colors.primary}" text-anchor="middle">
            ${config.code}
          </text>
        </g>
        ${config.isCore ? `
          <g transform="translate(${config.code.length * 14 + 100}, 130)">
            <rect width="100" height="36" rx="18" fill="${colorPalettes['alert-red'].primary}"/>
            <text x="50" y="24" font-family="'Segoe UI', Arial, sans-serif" font-size="12" font-weight="700" fill="${colors.textOnPrimary}" text-anchor="middle">
              ⭐ CORE
            </text>
          </g>
        ` : ''}
      ` : ''}
      
      <!-- Main Title Section -->
      <g transform="translate(40, 220)">
        <text font-family="'Segoe UI', Arial, sans-serif" font-size="26" font-weight="700" fill="${colors.text}">
          ${wrapText(config.title, width - 80, 26).map((line, i) => 
            `<tspan x="0" dy="${i === 0 ? 0 : 32}">${line}</tspan>`
          ).join('')}
        </text>
        ${config.titleHindi ? `
          <text y="${wrapText(config.title, width - 80, 26).length * 32 + 20}" font-family="'Noto Sans Devanagari', Arial, sans-serif" font-size="20" fill="${colors.primary}" opacity="0.9">
            ${config.titleHindi}
          </text>
        ` : ''}
      </g>
      
      <!-- Description Card -->
      <g transform="translate(40, ${320 + wrapText(config.title, width - 80, 26).length * 32})">
        <rect width="${width - 80}" height="${descLines.length * 24 + (hindiDescLines.length > 0 ? hindiDescLines.length * 22 + 30 : 0) + 40}" rx="16" fill="${colors.secondary}" filter="url(#softShadow)"/>
        <rect x="0" y="0" width="6" height="${descLines.length * 24 + (hindiDescLines.length > 0 ? hindiDescLines.length * 22 + 30 : 0) + 40}" rx="3" fill="${colors.primary}"/>
        
        <text x="24" y="30" font-family="'Segoe UI', Arial, sans-serif" font-size="16" fill="${colors.text}" line-height="1.6">
          ${descLines.map((line, i) => 
            `<tspan x="24" dy="${i === 0 ? 0 : 24}">${line}</tspan>`
          ).join('')}
        </text>
        
        ${hindiDescLines.length > 0 ? `
          <line x1="24" y1="${descLines.length * 24 + 45}" x2="${width - 120}" y2="${descLines.length * 24 + 45}" stroke="${colors.primary}" stroke-width="1" opacity="0.3"/>
          <text x="24" y="${descLines.length * 24 + 70}" font-family="'Noto Sans Devanagari', Arial, sans-serif" font-size="15" fill="${colors.textLight}">
            ${hindiDescLines.map((line, i) => 
              `<tspan x="24" dy="${i === 0 ? 0 : 22}">${line}</tspan>`
            ).join('')}
          </text>
        ` : ''}
      </g>
      
      <!-- Key Points Section -->
      ${keyPoints.length > 0 ? `
        <g transform="translate(40, ${450 + wrapText(config.title, width - 80, 26).length * 32 + descLines.length * 24 + (hindiDescLines.length > 0 ? hindiDescLines.length * 22 + 50 : 0)})">
          <text font-family="'Segoe UI', Arial, sans-serif" font-size="20" font-weight="700" fill="${colors.text}">
            Key Compliance Points
          </text>
          <text x="${width - 100}" font-family="'Noto Sans Devanagari', Arial, sans-serif" font-size="16" fill="${colors.primary}" text-anchor="end">
            मुख्य अनुपालन बिंदु
          </text>
          
          ${keyPoints.map((point, i) => `
            <g transform="translate(0, ${50 + i * 70})">
              <rect width="${width - 80}" height="60" rx="12" fill="${colors.background}" filter="url(#softShadow)"/>
              <circle cx="30" cy="30" r="20" fill="${colors.primary}"/>
              <text x="30" y="36" font-family="'Segoe UI', Arial, sans-serif" font-size="14" font-weight="700" fill="${colors.textOnPrimary}" text-anchor="middle">
                ${i + 1}
              </text>
              <text x="65" y="28" font-family="'Segoe UI', Arial, sans-serif" font-size="14" font-weight="600" fill="${colors.text}">
                ${point.length > 60 ? point.substring(0, 60) + '...' : point}
              </text>
              ${keyPointsHindi[i] ? `
                <text x="65" y="48" font-family="'Noto Sans Devanagari', Arial, sans-serif" font-size="12" fill="${colors.textLight}">
                  ${keyPointsHindi[i].length > 50 ? keyPointsHindi[i].substring(0, 50) + '...' : keyPointsHindi[i]}
                </text>
              ` : ''}
            </g>
          `).join('')}
        </g>
      ` : ''}
      
      <!-- Footer -->
      <g transform="translate(0, ${height - 80})">
        <rect width="${width}" height="80" fill="${colors.gradient}"/>
        <text x="40" y="35" font-family="'Segoe UI', Arial, sans-serif" font-size="14" font-weight="600" fill="${colors.textOnPrimary}">
          NABH Accreditation Compliance | NABH मान्यता अनुपालन
        </text>
        <text x="40" y="55" font-family="'Segoe UI', Arial, sans-serif" font-size="12" fill="${colors.textOnPrimary}" opacity="0.8">
          Quality Healthcare for All | सभी के लिए गुणवत्तापूर्ण स्वास्थ्य सेवा
        </text>
        <g transform="translate(${width - 100}, 20)">
          <svg width="60" height="40" viewBox="0 0 24 24" fill="${colors.textOnPrimary}">
            ${healthcareIcons.checkCircle}
          </svg>
        </g>
      </g>
    </svg>
  `;
};

// ============================================
// Template: Gradient Card
// ============================================

const generateGradientCard = (config: InfographicConfig, colors: ColorPalette): string => {
  const width = config.width || 800;
  const height = config.height || 600;
  const hospitalName = config.hospitalName || "Hospital Name";
  
  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      ${getSvgDefs(colors)}
      
      <!-- Background -->
      <rect width="100%" height="100%" fill="${colors.gradient}"/>
      
      <!-- Decorative Circles -->
      <circle cx="${width - 100}" cy="100" r="200" fill="${colors.textOnPrimary}" opacity="0.05"/>
      <circle cx="100" cy="${height - 100}" r="150" fill="${colors.textOnPrimary}" opacity="0.05"/>
      
      <!-- Main Card -->
      <rect x="40" y="40" width="${width - 80}" height="${height - 80}" rx="24" fill="${colors.background}" filter="url(#dropShadow)"/>
      
      <!-- Card Content -->
      <g transform="translate(70, 70)">
        <!-- Hospital Header -->
        <g>
          <rect width="60" height="60" rx="12" fill="${colors.primary}"/>
          <g transform="translate(12, 12)">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="${colors.textOnPrimary}">
              ${healthcareIcons.medicalCross}
            </svg>
          </g>
          <text x="80" y="25" font-family="'Segoe UI', Arial, sans-serif" font-size="22" font-weight="700" fill="${colors.text}">
            ${hospitalName}
          </text>
          <text x="80" y="48" font-family="'Segoe UI', Arial, sans-serif" font-size="12" fill="${colors.textLight}">
            NABH Accredited Healthcare Facility
          </text>
        </g>
        
        <!-- Code Badge -->
        ${config.code ? `
          <g transform="translate(${width - 220}, 0)">
            <rect width="80" height="32" rx="16" fill="${config.isCore ? colorPalettes['alert-red'].primary : colors.primary}"/>
            <text x="40" y="22" font-family="'Segoe UI', Arial, sans-serif" font-size="14" font-weight="700" fill="${colors.textOnPrimary}" text-anchor="middle">
              ${config.code}
            </text>
          </g>
        ` : ''}
        
        <!-- Divider -->
        <line x1="0" y1="90" x2="${width - 140}" y2="90" stroke="${colors.primary}" stroke-width="3" opacity="0.3"/>
        
        <!-- Title -->
        <text y="140" font-family="'Segoe UI', Arial, sans-serif" font-size="28" font-weight="700" fill="${colors.text}">
          ${wrapText(config.title, width - 180, 28).map((line, i) => 
            `<tspan x="0" dy="${i === 0 ? 0 : 36}">${line}</tspan>`
          ).join('')}
        </text>
        
        ${config.titleHindi ? `
          <text y="${140 + wrapText(config.title, width - 180, 28).length * 36 + 15}" font-family="'Noto Sans Devanagari', Arial, sans-serif" font-size="20" fill="${colors.primary}">
            ${config.titleHindi}
          </text>
        ` : ''}
        
        <!-- Description -->
        <g transform="translate(0, ${180 + wrapText(config.title, width - 180, 28).length * 36})">
          <text font-family="'Segoe UI', Arial, sans-serif" font-size="16" fill="${colors.textLight}" line-height="1.8">
            ${wrapText(config.description, width - 180, 16).slice(0, 6).map((line, i) => 
              `<tspan x="0" dy="${i === 0 ? 0 : 26}">${line}</tspan>`
            ).join('')}
          </text>
          
          ${config.descriptionHindi ? `
            <text y="${wrapText(config.description, width - 180, 16).slice(0, 6).length * 26 + 30}" font-family="'Noto Sans Devanagari', Arial, sans-serif" font-size="14" fill="${colors.textLight}" opacity="0.8">
              ${wrapText(config.descriptionHindi, width - 180, 14).slice(0, 4).map((line, i) => 
                `<tspan x="0" dy="${i === 0 ? 0 : 22}">${line}</tspan>`
              ).join('')}
            </text>
          ` : ''}
        </g>
        
        <!-- Bottom Icons -->
        <g transform="translate(0, ${height - 200})">
          ${[healthcareIcons.shield, healthcareIcons.checkCircle, healthcareIcons.heartPulse].map((icon, i) => `
            <g transform="translate(${i * 80}, 0)">
              <circle cx="25" cy="25" r="25" fill="${colors.secondary}"/>
              <g transform="translate(7, 7)">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="${colors.primary}">
                  ${icon}
                </svg>
              </g>
            </g>
          `).join('')}
        </g>
      </g>
      
      <!-- Footer Accent -->
      <rect x="40" y="${height - 50}" width="${width - 80}" height="10" rx="5" fill="${colors.primary}" opacity="0.3"/>
    </svg>
  `;
};

// ============================================
// Template: Minimal Signage
// ============================================

const generateMinimalSignage = (config: InfographicConfig, colors: ColorPalette): string => {
  const width = config.width || 600;
  const height = config.height || 400;
  const hospitalName = config.hospitalName || "Hospital Name";
  
  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      ${getSvgDefs(colors)}
      
      <!-- Background -->
      <rect width="100%" height="100%" fill="${colors.background}"/>
      
      <!-- Top Accent Bar -->
      <rect width="100%" height="8" fill="${colors.gradient}"/>
      
      <!-- Main Content Area -->
      <g transform="translate(${width / 2}, ${height / 2 - 20})" text-anchor="middle">
        <!-- Icon -->
        <g transform="translate(-30, -80)">
          <circle cx="30" cy="30" r="35" fill="${colors.secondary}"/>
          <g transform="translate(6, 6)">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="${colors.primary}">
              ${healthcareIcons.checkCircle}
            </svg>
          </g>
        </g>
        
        <!-- Title (English) -->
        <text y="10" font-family="'Segoe UI', Arial, sans-serif" font-size="32" font-weight="700" fill="${colors.text}">
          ${config.title.length > 30 ? config.title.substring(0, 30) + '...' : config.title}
        </text>
        
        <!-- Title (Hindi) -->
        ${config.titleHindi ? `
          <text y="50" font-family="'Noto Sans Devanagari', Arial, sans-serif" font-size="24" fill="${colors.primary}">
            ${config.titleHindi.length > 30 ? config.titleHindi.substring(0, 30) + '...' : config.titleHindi}
          </text>
        ` : ''}
        
        <!-- Subtitle -->
        ${config.subtitle ? `
          <text y="90" font-family="'Segoe UI', Arial, sans-serif" font-size="16" fill="${colors.textLight}">
            ${config.subtitle}
          </text>
        ` : ''}
      </g>
      
      <!-- Bottom Section -->
      <g transform="translate(0, ${height - 60})">
        <rect width="100%" height="60" fill="${colors.secondary}"/>
        <text x="30" y="38" font-family="'Segoe UI', Arial, sans-serif" font-size="14" font-weight="600" fill="${colors.text}">
          ${hospitalName}
        </text>
        ${config.code ? `
          <g transform="translate(${width - 100}, 15)">
            <rect width="70" height="30" rx="15" fill="${colors.primary}"/>
            <text x="35" y="22" font-family="'Segoe UI', Arial, sans-serif" font-size="12" font-weight="700" fill="${colors.textOnPrimary}" text-anchor="middle">
              ${config.code}
            </text>
          </g>
        ` : ''}
      </g>
    </svg>
  `;
};

// ============================================
// Template: Healthcare Steps
// ============================================

const generateHealthcareSteps = (config: InfographicConfig, colors: ColorPalette): string => {
  const width = config.width || 800;
  const height = config.height || 1000;
  const hospitalName = config.hospitalName || "Hospital Name";
  const keyPoints = config.keyPoints || [];
  const keyPointsHindi = config.keyPointsHindi || [];
  
  const stepIcons = [
    healthcareIcons.clipboard,
    healthcareIcons.handWash,
    healthcareIcons.shield,
    healthcareIcons.checkCircle,
    healthcareIcons.heartPulse,
  ];
  
  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      ${getSvgDefs(colors)}
      
      <!-- Background -->
      <rect width="100%" height="100%" fill="${colors.backgroundAlt}"/>
      
      <!-- Header -->
      <rect width="100%" height="140" fill="${colors.gradient}"/>
      <text x="40" y="50" font-family="'Segoe UI', Arial, sans-serif" font-size="24" font-weight="700" fill="${colors.textOnPrimary}">
        ${hospitalName}
      </text>
      <text x="40" y="85" font-family="'Segoe UI', Arial, sans-serif" font-size="28" font-weight="700" fill="${colors.textOnPrimary}">
        ${config.title.length > 40 ? config.title.substring(0, 40) + '...' : config.title}
      </text>
      ${config.titleHindi ? `
        <text x="40" y="115" font-family="'Noto Sans Devanagari', Arial, sans-serif" font-size="18" fill="${colors.textOnPrimary}" opacity="0.9">
          ${config.titleHindi}
        </text>
      ` : ''}
      
      ${config.code ? `
        <g transform="translate(${width - 120}, 30)">
          <rect width="80" height="36" rx="18" fill="${colors.textOnPrimary}"/>
          <text x="40" y="24" font-family="'Segoe UI', Arial, sans-serif" font-size="14" font-weight="700" fill="${colors.primary}" text-anchor="middle">
            ${config.code}
          </text>
        </g>
      ` : ''}
      
      <!-- Steps -->
      ${keyPoints.slice(0, 5).map((point, i) => `
        <g transform="translate(40, ${180 + i * 150})">
          <!-- Connector Line -->
          ${i < keyPoints.length - 1 ? `
            <line x1="35" y1="80" x2="35" y2="150" stroke="${colors.primary}" stroke-width="3" stroke-dasharray="8,4" opacity="0.3"/>
          ` : ''}
          
          <!-- Step Card -->
          <rect width="${width - 80}" height="130" rx="16" fill="${colors.background}" filter="url(#softShadow)"/>
          
          <!-- Step Number Circle -->
          <circle cx="35" cy="35" r="30" fill="${colors.gradient}"/>
          <text x="35" y="43" font-family="'Segoe UI', Arial, sans-serif" font-size="24" font-weight="700" fill="${colors.textOnPrimary}" text-anchor="middle">
            ${i + 1}
          </text>
          
          <!-- Step Icon -->
          <g transform="translate(${width - 160}, 15)">
            <circle cx="30" cy="30" r="28" fill="${colors.secondary}"/>
            <g transform="translate(8, 8)">
              <svg width="44" height="44" viewBox="0 0 24 24" fill="${colors.primary}">
                ${stepIcons[i] || stepIcons[0]}
              </svg>
            </g>
          </g>
          
          <!-- Step Content -->
          <text x="85" y="40" font-family="'Segoe UI', Arial, sans-serif" font-size="18" font-weight="600" fill="${colors.text}">
            ${point.length > 55 ? point.substring(0, 55) + '...' : point}
          </text>
          
          ${keyPointsHindi[i] ? `
            <text x="85" y="70" font-family="'Noto Sans Devanagari', Arial, sans-serif" font-size="14" fill="${colors.textLight}">
              ${keyPointsHindi[i].length > 50 ? keyPointsHindi[i].substring(0, 50) + '...' : keyPointsHindi[i]}
            </text>
          ` : ''}
          
          <!-- Progress Indicator -->
          <rect x="85" y="95" width="${(width - 200)}" height="8" rx="4" fill="${colors.secondary}"/>
          <rect x="85" y="95" width="${((i + 1) / keyPoints.length) * (width - 200)}" height="8" rx="4" fill="${colors.primary}"/>
        </g>
      `).join('')}
      
      <!-- Footer -->
      <g transform="translate(0, ${height - 60})">
        <rect width="100%" height="60" fill="${colors.gradient}"/>
        <text x="${width / 2}" y="25" font-family="'Segoe UI', Arial, sans-serif" font-size="14" font-weight="600" fill="${colors.textOnPrimary}" text-anchor="middle">
          Quality Healthcare Compliance | गुणवत्तापूर्ण स्वास्थ्य सेवा अनुपालन
        </text>
        <text x="${width / 2}" y="45" font-family="'Segoe UI', Arial, sans-serif" font-size="12" fill="${colors.textOnPrimary}" opacity="0.8" text-anchor="middle">
          NABH Accredited | NABH मान्यता प्राप्त
        </text>
      </g>
    </svg>
  `;
};

// ============================================
// Template: Compliance Checklist
// ============================================

const generateComplianceChecklist = (config: InfographicConfig, colors: ColorPalette): string => {
  const width = config.width || 800;
  const height = config.height || 900;
  const hospitalName = config.hospitalName || "Hospital Name";
  const keyPoints = config.keyPoints || [];
  const keyPointsHindi = config.keyPointsHindi || [];
  
  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      ${getSvgDefs(colors)}
      
      <!-- Background -->
      <rect width="100%" height="100%" fill="${colors.background}"/>
      <rect width="100%" height="100%" fill="url(#subtlePattern)"/>
      
      <!-- Left Accent Bar -->
      <rect width="12" height="100%" fill="${colors.gradient}"/>
      
      <!-- Header -->
      <g transform="translate(50, 40)">
        <rect width="${width - 100}" height="120" rx="16" fill="${colors.gradient}" filter="url(#softShadow)"/>
        
        <g transform="translate(20, 20)">
          <rect width="80" height="80" rx="12" fill="${colors.textOnPrimary}"/>
          <g transform="translate(16, 16)">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="${colors.primary}">
              ${healthcareIcons.clipboard}
            </svg>
          </g>
        </g>
        
        <text x="120" y="50" font-family="'Segoe UI', Arial, sans-serif" font-size="24" font-weight="700" fill="${colors.textOnPrimary}">
          ${config.title.length > 35 ? config.title.substring(0, 35) + '...' : config.title}
        </text>
        ${config.titleHindi ? `
          <text x="120" y="78" font-family="'Noto Sans Devanagari', Arial, sans-serif" font-size="16" fill="${colors.textOnPrimary}" opacity="0.9">
            ${config.titleHindi}
          </text>
        ` : ''}
        
        <text x="${width - 150}" y="40" font-family="'Segoe UI', Arial, sans-serif" font-size="14" font-weight="600" fill="${colors.textOnPrimary}">
          ${hospitalName}
        </text>
        ${config.code ? `
          <rect x="${width - 180}" y="55" width="70" height="28" rx="14" fill="${colors.textOnPrimary}"/>
          <text x="${width - 145}" y="75" font-family="'Segoe UI', Arial, sans-serif" font-size="12" font-weight="700" fill="${colors.primary}" text-anchor="middle">
            ${config.code}
          </text>
        ` : ''}
      </g>
      
      <!-- Checklist Items -->
      ${keyPoints.slice(0, 8).map((point, i) => `
        <g transform="translate(50, ${190 + i * 80})">
          <rect width="${width - 100}" height="70" rx="12" fill="${i % 2 === 0 ? colors.background : colors.backgroundAlt}" filter="url(#softShadow)"/>
          
          <!-- Checkbox -->
          <rect x="20" y="20" width="30" height="30" rx="8" fill="${colors.secondary}" stroke="${colors.primary}" stroke-width="2"/>
          <g transform="translate(25, 25)">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="${colors.primary}">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
            </svg>
          </g>
          
          <!-- Item Text -->
          <text x="70" y="35" font-family="'Segoe UI', Arial, sans-serif" font-size="15" font-weight="600" fill="${colors.text}">
            ${point.length > 60 ? point.substring(0, 60) + '...' : point}
          </text>
          ${keyPointsHindi[i] ? `
            <text x="70" y="55" font-family="'Noto Sans Devanagari', Arial, sans-serif" font-size="12" fill="${colors.textLight}">
              ${keyPointsHindi[i].length > 55 ? keyPointsHindi[i].substring(0, 55) + '...' : keyPointsHindi[i]}
            </text>
          ` : ''}
          
          <!-- Item Number -->
          <text x="${width - 140}" y="45" font-family="'Segoe UI', Arial, sans-serif" font-size="24" font-weight="700" fill="${colors.primary}" opacity="0.2">
            ${String(i + 1).padStart(2, '0')}
          </text>
        </g>
      `).join('')}
      
      <!-- Footer -->
      <g transform="translate(50, ${height - 70})">
        <rect width="${width - 100}" height="50" rx="12" fill="${colors.secondary}"/>
        <g transform="translate(20, 13)">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="${colors.primary}">
            ${healthcareIcons.shield}
          </svg>
        </g>
        <text x="55" y="32" font-family="'Segoe UI', Arial, sans-serif" font-size="14" font-weight="600" fill="${colors.text}">
          NABH Compliance Checklist | NABH अनुपालन चेकलिस्ट
        </text>
      </g>
    </svg>
  `;
};

// ============================================
// Main Generator Function
// ============================================

export const generateInfographic = (config: InfographicConfig): string => {
  const template = config.template || 'modern-poster';
  const colorScheme = config.colorScheme || 'healthcare-blue';
  const colors = colorPalettes[colorScheme];
  
  let svgContent: string;
  
  switch (template) {
    case 'gradient-card':
      svgContent = generateGradientCard(config, colors);
      break;
    case 'minimal-signage':
      svgContent = generateMinimalSignage(config, colors);
      break;
    case 'healthcare-steps':
      svgContent = generateHealthcareSteps(config, colors);
      break;
    case 'compliance-checklist':
      svgContent = generateComplianceChecklist(config, colors);
      break;
    case 'modern-poster':
    default:
      svgContent = generateModernPoster(config, colors);
      break;
  }
  
  return svgContent;
};

// ============================================
// Convert SVG to Data URL
// ============================================

export const svgToDataUrl = (svg: string): string => {
  const base64 = btoa(unescape(encodeURIComponent(svg)));
  return `data:image/svg+xml;base64,${base64}`;
};

// ============================================
// Convert SVG to PNG Data URL
// ============================================

export const svgToPngDataUrl = async (svg: string, scale: number = 2): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const svgBlob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }
      
      ctx.scale(scale, scale);
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);
      
      resolve(canvas.toDataURL('image/png'));
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load SVG image'));
    };
    
    img.src = url;
  });
};

// ============================================
// Extract Key Points from Description
// ============================================

export const extractKeyPoints = (description: string): string[] => {
  // Split by common separators and filter empty
  const sentences = description
    .split(/[.;]\s+/)
    .map(s => s.trim())
    .filter(s => s.length > 20 && s.length < 150);
  
  // Take up to 5 key points
  return sentences.slice(0, 5);
};

// ============================================
// Available Templates & Color Schemes (for UI)
// ============================================

export const availableTemplates: { value: InfographicTemplate; label: string; description: string }[] = [
  { value: 'modern-poster', label: 'Modern Poster', description: 'Professional A4 poster with full details' },
  { value: 'gradient-card', label: 'Gradient Card', description: 'Compact card with gradient header' },
  { value: 'minimal-signage', label: 'Minimal Signage', description: 'Clean signage for wall display' },
  { value: 'healthcare-steps', label: 'Healthcare Steps', description: 'Step-by-step procedure layout' },
  { value: 'compliance-checklist', label: 'Compliance Checklist', description: 'Checklist format for audits' },
];

export const availableColorSchemes: { value: ColorScheme; label: string; preview: string }[] = [
  { value: 'healthcare-blue', label: 'Healthcare Blue', preview: '#1565C0' },
  { value: 'safety-green', label: 'Safety Green', preview: '#2E7D32' },
  { value: 'alert-red', label: 'Alert Red', preview: '#C62828' },
  { value: 'calm-teal', label: 'Calm Teal', preview: '#00796B' },
  { value: 'professional-navy', label: 'Professional Navy', preview: '#1A237E' },
  { value: 'vibrant-gradient', label: 'Vibrant Gradient', preview: '#6366F1' },
];
