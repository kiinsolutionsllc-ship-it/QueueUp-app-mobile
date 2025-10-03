/**
 * Color Accessibility Utilities
 * Provides tools for ensuring WCAG AA compliance and proper color contrast
 */

// WCAG AA and AAA contrast ratio standards
export const CONTRAST_STANDARDS = {
  AA: 4.5,
  AAA: 7.0,
  LARGE_TEXT_AA: 3.0,
  LARGE_TEXT_AAA: 4.5,
};

/**
 * Convert hex color to RGB values
 * @param {string} hex - Hex color string (e.g., "#FF0000" or "FF0000")
 * @returns {Object} RGB object with r, g, b values
 */
export const hexToRgb = (hex) => {
  const cleanHex = hex.replace('#', '');
  const r = parseInt(cleanHex.substr(0, 2), 16);
  const g = parseInt(cleanHex.substr(2, 2), 16);
  const b = parseInt(cleanHex.substr(4, 2), 16);
  return { r, g, b };
};

/**
 * Calculate relative luminance of a color
 * @param {Object} rgb - RGB object with r, g, b values (0-255)
 * @returns {number} Relative luminance (0-1)
 */
export const getRelativeLuminance = (rgb) => {
  const { r, g, b } = rgb;
  
  // Convert to sRGB
  const rsRGB = r / 255;
  const gsRGB = g / 255;
  const bsRGB = b / 255;
  
  // Apply gamma correction
  const rLinear = rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4);
  const gLinear = gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4);
  const bLinear = bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4);
  
  return 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear;
};

/**
 * Calculate contrast ratio between two colors
 * @param {string} color1 - First color (hex)
 * @param {string} color2 - Second color (hex)
 * @returns {number} Contrast ratio
 */
export const getContrastRatio = (color1, color2) => {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);
  
  const lum1 = getRelativeLuminance(rgb1);
  const lum2 = getRelativeLuminance(rgb2);
  
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  
  return (brightest + 0.05) / (darkest + 0.05);
};

/**
 * Check if contrast ratio meets WCAG standards
 * @param {string} foreground - Foreground color (hex)
 * @param {string} background - Background color (hex)
 * @param {boolean} isLargeText - Whether text is large (18pt+ or 14pt+ bold)
 * @param {string} level - WCAG level ('AA' or 'AAA')
 * @returns {Object} Result with isCompliant, ratio, and required ratio
 */
export const checkContrastCompliance = (foreground, background, isLargeText = false, level = 'AA') => {
  const ratio = getContrastRatio(foreground, background);
  const requiredRatio = isLargeText 
    ? (level === 'AAA' ? CONTRAST_STANDARDS.LARGE_TEXT_AAA : CONTRAST_STANDARDS.LARGE_TEXT_AA)
    : (level === 'AAA' ? CONTRAST_STANDARDS.AAA : CONTRAST_STANDARDS.AA);
  
  return {
    isCompliant: ratio >= requiredRatio,
    ratio: Math.round(ratio * 100) / 100,
    requiredRatio,
    level,
    isLargeText,
  };
};

/**
 * Get accessible text color for a given background
 * @param {string} backgroundColor - Background color (hex)
 * @param {string} lightText - Light text color (hex)
 * @param {string} darkText - Dark text color (hex)
 * @param {boolean} isLargeText - Whether text is large
 * @param {string} level - WCAG level
 * @returns {string} Most accessible text color
 */
export const getAccessibleTextColor = (backgroundColor, lightText, darkText, isLargeText = false, level = 'AA') => {
  const lightContrast = checkContrastCompliance(lightText, backgroundColor, isLargeText, level);
  const darkContrast = checkContrastCompliance(darkText, backgroundColor, isLargeText, level);
  
  // Prefer the color with better contrast
  if (lightContrast.isCompliant && darkContrast.isCompliant) {
    return lightContrast.ratio > darkContrast.ratio ? lightText : darkText;
  }
  
  return lightContrast.isCompliant ? lightText : darkText;
};

/**
 * Generate color variants with proper contrast
 * @param {string} baseColor - Base color (hex)
 * @param {string} backgroundColor - Background color (hex)
 * @param {number} steps - Number of variants to generate
 * @returns {Array} Array of color variants
 */
export const generateAccessibleColorVariants = (baseColor, backgroundColor, steps = 5) => {
  const baseRgb = hexToRgb(baseColor);
  const bgRgb = hexToRgb(backgroundColor);
  const variants = [];
  
  for (let i = 0; i < steps; i++) {
    const factor = i / (steps - 1);
    const variant = {
      r: Math.round(baseRgb.r + (bgRgb.r - baseRgb.r) * factor),
      g: Math.round(baseRgb.g + (bgRgb.g - baseRgb.g) * factor),
      b: Math.round(baseRgb.b + (bgRgb.b - baseRgb.b) * factor),
    };
    
    const hex = `#${variant.r.toString(16).padStart(2, '0')}${variant.g.toString(16).padStart(2, '0')}${variant.b.toString(16).padStart(2, '0')}`;
    const contrast = getContrastRatio(hex, backgroundColor);
    
    variants.push({
      color: hex,
      contrast,
      isAccessible: contrast >= CONTRAST_STANDARDS.AA,
    });
  }
  
  return variants;
};

/**
 * Validate color palette for accessibility
 * @param {Object} palette - Color palette object
 * @param {string} background - Background color
 * @returns {Object} Validation results
 */
export const validateColorPalette = (palette, background) => {
  const results = {
    isCompliant: true,
    issues: [],
    recommendations: [],
  };
  
  // Check text colors
  const textColors = ['text', 'textSecondary', 'textLight'];
  textColors.forEach(colorKey => {
    if (palette[colorKey]) {
      const contrast = checkContrastCompliance(palette[colorKey], background);
      if (!contrast.isCompliant) {
        results.isCompliant = false;
        results.issues.push(`${colorKey} has insufficient contrast (${contrast.ratio}:1)`);
      }
    }
  });
  
  // Check semantic colors
  const semanticColors = ['success', 'warning', 'error', 'info'];
  semanticColors.forEach(colorKey => {
    if (palette[colorKey]) {
      const contrast = checkContrastCompliance(palette[colorKey], background);
      if (!contrast.isCompliant) {
        results.issues.push(`${colorKey} may need adjustment for better contrast`);
        results.recommendations.push(`Consider using ${colorKey}Light or ${colorKey}Dark variants`);
      }
    }
  });
  
  return results;
};

/**
 * Get color recommendations for better accessibility
 * @param {string} currentColor - Current color (hex)
 * @param {string} backgroundColor - Background color (hex)
 * @param {boolean} isLargeText - Whether text is large
 * @returns {Object} Color recommendations
 */
export const getColorRecommendations = (currentColor, backgroundColor, isLargeText = false) => {
  const currentContrast = checkContrastCompliance(currentColor, backgroundColor, isLargeText);
  
  if (currentContrast.isCompliant) {
    return {
      status: 'good',
      message: `Color meets WCAG ${currentContrast.level} standards (${currentContrast.ratio}:1)`,
      suggestions: [],
    };
  }
  
  const suggestions = [];
  const variants = generateAccessibleColorVariants(currentColor, backgroundColor, 10);
  const accessibleVariants = variants.filter(v => v.isAccessible);
  
  if (accessibleVariants.length > 0) {
    suggestions.push(`Try: ${accessibleVariants[0].color} (${(accessibleVariants[0].contrast || 0).toFixed(2)}:1 contrast)`);
  }
  
  return {
    status: 'needs_improvement',
    message: `Color needs improvement for WCAG ${currentContrast.level} compliance`,
    currentContrast: currentContrast.ratio,
    requiredContrast: currentContrast.requiredRatio,
    suggestions,
  };
};

export default {
  CONTRAST_STANDARDS,
  hexToRgb,
  getRelativeLuminance,
  getContrastRatio,
  checkContrastCompliance,
  getAccessibleTextColor,
  generateAccessibleColorVariants,
  validateColorPalette,
  getColorRecommendations,
};
