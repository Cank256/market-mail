// Mobile responsiveness utilities for Market Mail

export interface DeviceType {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  screenWidth: number;
  screenHeight: number;
}

export interface BreakpointConfig {
  mobile: number;
  tablet: number;
  desktop: number;
}

// Tailwind CSS breakpoints
export const BREAKPOINTS: BreakpointConfig = {
  mobile: 640,   // sm
  tablet: 768,   // md
  desktop: 1024, // lg
};

/**
 * Detect device type based on screen width
 */
export function detectDeviceType(): DeviceType {
  const width = window.innerWidth;
  const height = window.innerHeight;

  return {
    isMobile: width < BREAKPOINTS.mobile,
    isTablet: width >= BREAKPOINTS.mobile && width < BREAKPOINTS.desktop,
    isDesktop: width >= BREAKPOINTS.desktop,
    screenWidth: width,
    screenHeight: height,
  };
}

/**
 * Check if device is in landscape or portrait mode
 */
export function getOrientation(): 'landscape' | 'portrait' {
  return window.innerWidth > window.innerHeight ? 'landscape' : 'portrait';
}

/**
 * Check if touch device
 */
export function isTouchDevice(): boolean {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

/**
 * Get responsive classes based on device type
 */
export function getResponsiveClasses(device: DeviceType): {
  container: string;
  grid: string;
  spacing: string;
  text: string;
  button: string;
} {
  const base = {
    container: 'max-w-7xl mx-auto px-4',
    grid: 'grid',
    spacing: 'space-y-4',
    text: 'text-base',
    button: 'px-4 py-2 rounded-md font-medium transition-colors',
  };

  if (device.isMobile) {
    return {
      container: 'max-w-full mx-auto px-3',
      grid: 'grid grid-cols-1 gap-3',
      spacing: 'space-y-3',
      text: 'text-sm',
      button: 'w-full px-3 py-2 rounded-md font-medium transition-colors text-sm',
    };
  }

  if (device.isTablet) {
    return {
      container: 'max-w-5xl mx-auto px-4',
      grid: 'grid grid-cols-1 md:grid-cols-2 gap-4',
      spacing: 'space-y-4',
      text: 'text-base',
      button: 'px-4 py-2 rounded-md font-medium transition-colors',
    };
  }

  return base;
}

/**
 * Optimize image loading for mobile devices
 */
export function getOptimizedImageProps(device: DeviceType): {
  loading: 'lazy' | 'eager';
  sizes: string;
} {
  if (device.isMobile) {
    return {
      loading: 'lazy',
      sizes: '(max-width: 640px) 100vw, 50vw',
    };
  }

  return {
    loading: 'eager',
    sizes: '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  };
}

/**
 * Get mobile-optimized pagination settings
 */
export function getMobilePaginationConfig(device: DeviceType): {
  itemsPerPage: number;
  showPageNumbers: boolean;
  maxPageButtons: number;
} {
  if (device.isMobile) {
    return {
      itemsPerPage: 10,
      showPageNumbers: false,
      maxPageButtons: 3,
    };
  }

  if (device.isTablet) {
    return {
      itemsPerPage: 15,
      showPageNumbers: true,
      maxPageButtons: 5,
    };
  }

  return {
    itemsPerPage: 20,
    showPageNumbers: true,
    maxPageButtons: 7,
  };
}

/**
 * Optimize table display for mobile
 */
export function getMobileTableConfig(device: DeviceType): {
  stackOnMobile: boolean;
  hiddenColumns: string[];
  compactMode: boolean;
} {
  if (device.isMobile) {
    return {
      stackOnMobile: true,
      hiddenColumns: ['id', 'updated', 'details'],
      compactMode: true,
    };
  }

  return {
    stackOnMobile: false,
    hiddenColumns: [],
    compactMode: false,
  };
}

/**
 * Get responsive chart configuration
 */
export function getMobileChartConfig(device: DeviceType): {
  height: number;
  fontSize: number;
  margin: { top: number; right: number; bottom: number; left: number };
  showLegend: boolean;
} {
  if (device.isMobile) {
    return {
      height: 200,
      fontSize: 10,
      margin: { top: 10, right: 10, bottom: 30, left: 30 },
      showLegend: false,
    };
  }

  if (device.isTablet) {
    return {
      height: 300,
      fontSize: 12,
      margin: { top: 20, right: 20, bottom: 50, left: 50 },
      showLegend: true,
    };
  }

  return {
    height: 400,
    fontSize: 14,
    margin: { top: 20, right: 30, bottom: 60, left: 60 },
    showLegend: true,
  };
}

/**
 * Mobile-specific performance optimizations
 */
export function getMobilePerformanceConfig(device: DeviceType): {
  enableLazyLoading: boolean;
  reduceAnimations: boolean;
  optimizeImages: boolean;
  enableVirtualScrolling: boolean;
} {
  const isLowPowerDevice = device.isMobile && navigator.hardwareConcurrency <= 4;

  return {
    enableLazyLoading: device.isMobile,
    reduceAnimations: isLowPowerDevice,
    optimizeImages: device.isMobile,
    enableVirtualScrolling: device.isMobile,
  };
}

/**
 * Mobile-optimized form configuration
 */
export function getMobileFormConfig(device: DeviceType): {
  inputSize: 'sm' | 'md' | 'lg';
  showLabelsInline: boolean;
  stackFields: boolean;
  touchOptimized: boolean;
} {
  if (device.isMobile) {
    return {
      inputSize: 'lg',
      showLabelsInline: false,
      stackFields: true,
      touchOptimized: true,
    };
  }

  return {
    inputSize: 'md',
    showLabelsInline: true,
    stackFields: false,
    touchOptimized: isTouchDevice(),
  };
}

/**
 * Debounced resize handler for performance
 */
export function createResizeHandler(callback: (device: DeviceType) => void, delay = 150) {
  let timeoutId: NodeJS.Timeout;

  return () => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      callback(detectDeviceType());
    }, delay);
  };
}

/**
 * Mobile-specific error handling
 */
export function getMobileErrorConfig(device: DeviceType): {
  showStackTrace: boolean;
  compactErrorDisplay: boolean;
  enableErrorReporting: boolean;
} {
  return {
    showStackTrace: !device.isMobile,
    compactErrorDisplay: device.isMobile,
    enableErrorReporting: true,
  };
}

/**
 * Viewport management utilities
 */
export class ViewportManager {
  private static instance: ViewportManager;
  private observers: ((device: DeviceType) => void)[] = [];
  private currentDevice: DeviceType;
  private resizeHandler: () => void;

  private constructor() {
    this.currentDevice = detectDeviceType();
    this.resizeHandler = createResizeHandler((device) => {
      this.currentDevice = device;
      this.notifyObservers();
    });

    window.addEventListener('resize', this.resizeHandler);
    window.addEventListener('orientationchange', this.resizeHandler);
  }

  static getInstance(): ViewportManager {
    if (!ViewportManager.instance) {
      ViewportManager.instance = new ViewportManager();
    }
    return ViewportManager.instance;
  }

  subscribe(callback: (device: DeviceType) => void): () => void {
    this.observers.push(callback);
    
    // Immediately notify with current device
    callback(this.currentDevice);

    // Return unsubscribe function
    return () => {
      this.observers = this.observers.filter(obs => obs !== callback);
    };
  }

  private notifyObservers(): void {
    this.observers.forEach(callback => callback(this.currentDevice));
  }

  getCurrentDevice(): DeviceType {
    return this.currentDevice;
  }

  destroy(): void {
    window.removeEventListener('resize', this.resizeHandler);
    window.removeEventListener('orientationchange', this.resizeHandler);
    this.observers = [];
  }
}

/**
 * React hook for mobile responsiveness
 */
export function useMobileResponsive() {
  const [device, setDevice] = React.useState<DeviceType>(detectDeviceType());

  React.useEffect(() => {
    const viewportManager = ViewportManager.getInstance();
    const unsubscribe = viewportManager.subscribe(setDevice);

    return unsubscribe;
  }, []);

  return {
    device,
    ...device,
    classes: getResponsiveClasses(device),
    chartConfig: getMobileChartConfig(device),
    formConfig: getMobileFormConfig(device),
    tableConfig: getMobileTableConfig(device),
    performanceConfig: getMobilePerformanceConfig(device),
    errorConfig: getMobileErrorConfig(device),
  };
}

// Export React for the hook
import React from 'react';
