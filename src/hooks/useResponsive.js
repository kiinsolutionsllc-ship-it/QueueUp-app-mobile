import { useState, useEffect } from 'react';
import { Dimensions, PixelRatio } from 'react-native';

// Screen size breakpoints
const BREAKPOINTS = {
  xs: 0,
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1200,
  xxl: 1400,
};

// Device type detection
const getDeviceType = (width) => {
  if (width < BREAKPOINTS.sm) return 'phone';
  if (width < BREAKPOINTS.md) return 'phone-landscape';
  if (width < BREAKPOINTS.lg) return 'tablet';
  if (width < BREAKPOINTS.xl) return 'tablet-landscape';
  return 'desktop';
};

// Orientation detection
const getOrientation = (width, height) => {
  return width > height ? 'landscape' : 'portrait';
};

// Responsive scaling
const scale = (size) => {
  const { width } = Dimensions.get('window');
  const scale = width / 375; // Base width (iPhone X)
  return Math.ceil(PixelRatio.roundToNearestPixel(size * scale));
};

// Responsive font scaling
const scaleFont = (size) => {
  const { width, height } = Dimensions.get('window');
  const scale = Math.min(width, height) / 375;
  return Math.ceil(PixelRatio.roundToNearestPixel(size * scale));
};

// Responsive spacing
const scaleSpacing = (size) => {
  const { width } = Dimensions.get('window');
  const scale = width / 375;
  return Math.ceil(PixelRatio.roundToNearestPixel(size * scale));
};

export const useResponsive = () => {
  const [dimensions, setDimensions] = useState(() => {
    const { width, height } = Dimensions.get('window');
    return { width, height };
  });

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions({ width: window.width, height: window.height });
    });

    return () => subscription?.remove();
  }, []);

  const { width, height } = dimensions;
  const deviceType = getDeviceType(width);
  const orientation = getOrientation(width, height);
  const isTablet = deviceType.includes('tablet');
  const isPhone = deviceType === 'phone';
  const isLandscape = orientation === 'landscape';

  // Responsive values
  const responsive = {
    // Screen dimensions
    screenWidth: width,
    screenHeight: height,
    deviceType,
    orientation,
    isTablet,
    isPhone,
    isLandscape,
    
    // Breakpoint checks
    isXs: width < BREAKPOINTS.sm,
    isSm: width >= BREAKPOINTS.sm && width < BREAKPOINTS.md,
    isMd: width >= BREAKPOINTS.md && width < BREAKPOINTS.lg,
    isLg: width >= BREAKPOINTS.lg && width < BREAKPOINTS.xl,
    isXl: width >= BREAKPOINTS.xl,
    
    // Scaling functions
    scale,
    scaleFont,
    scaleSpacing,
    
    // Responsive values
    getResponsiveValue: (values) => {
      if (typeof values === 'number') return scale(values);
      
      const { xs, sm, md, lg, xl } = values;
      
      if (width < BREAKPOINTS.sm) return scale(xs || sm || md || lg || xl || 0);
      if (width < BREAKPOINTS.md) return scale(sm || md || lg || xl || 0);
      if (width < BREAKPOINTS.lg) return scale(md || lg || xl || 0);
      if (width < BREAKPOINTS.xl) return scale(lg || xl || 0);
      return scale(xl || 0);
    },
    
    // Typography scaling
    getFontSize: (baseSize) => {
      const scaled = scaleFont(baseSize);
      return Math.max(scaled, 12); // Minimum font size
    },
    
    // Spacing scaling
    getSpacing: (baseSpacing) => {
      return scaleSpacing(baseSpacing);
    },
    
    // Grid columns based on screen size
    getGridColumns: () => {
      if (width < BREAKPOINTS.sm) return 1;
      if (width < BREAKPOINTS.md) return 2;
      if (width < BREAKPOINTS.lg) return 3;
      return 4;
    },
    
    // Card width based on screen size
    getCardWidth: () => {
      if (width < BREAKPOINTS.sm) return width - 32; // Full width minus padding
      if (width < BREAKPOINTS.md) return (width - 48) / 2; // Half width
      if (width < BREAKPOINTS.lg) return (width - 64) / 3; // Third width
      return (width - 80) / 4; // Quarter width
    },
    
    // Safe area adjustments
    getSafePadding: () => {
      const basePadding = 16;
      if (isTablet) return scaleSpacing(basePadding * 1.5);
      if (isLandscape) return scaleSpacing(basePadding * 0.75);
      return scaleSpacing(basePadding);
    },
    
    // Header height based on device
    getHeaderHeight: () => {
      const baseHeight = 60;
      if (isTablet) return scale(baseHeight * 1.2);
      if (isLandscape) return scale(baseHeight * 0.9);
      return scale(baseHeight);
    },
    
    // Tab bar height based on device
    getTabBarHeight: () => {
      const baseHeight = 70;
      if (isTablet) return scale(baseHeight * 1.1);
      if (isLandscape) return scale(baseHeight * 0.8);
      return scale(baseHeight);
    },
  };

  return responsive;
};

// Responsive style helper
export const createResponsiveStyle = (styleFunction) => {
  return (responsive) => {
    return styleFunction(responsive);
  };
};

// Common responsive breakpoints
export { BREAKPOINTS };
