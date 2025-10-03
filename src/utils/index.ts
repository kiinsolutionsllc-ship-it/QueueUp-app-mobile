/**
 * Unified Utils Index (TypeScript)
 * Centralized exports for all utility functions
 * Single source of truth for all utility exports
 */

// Status utilities (with aliases to avoid conflicts)
export {
  getStatusColor as getStatusColorFromUtils,
  getStatusBadgeStyle as getStatusBadgeStyleFromUtils,
  getStatusIcon,
  getStatusText,
  getStatusPriority,
  getStatusActions,
  formatStatus,
  isValidStatus,
  getStatusTransition,
  getStatusHistory,
  getStatusMetrics
} from './StatusUtils';

// Job formatting utilities (Unified TypeScript version)
export {
  getStatusColor,
  getStatusBadgeStyle,
  formatVehicle,
  formatJobTitle,
  formatJobType,
  capitalizeText
} from './UnifiedJobFormattingUtils';

// Performance utilities
export {
  useDeepCallback,
  useDeepMemo,
  useDebouncedCallback,
  useThrottledCallback,
  useExpensiveCalculation,
  useMemoizedSelector,
  useMemoizationStats,
  deepEqual as deepEqualMemo
} from './memoization';

// Re-export JavaScript utilities with type assertions
export * from './PerformanceOptimizer';
export * from './UXEnhancer';
export * from './FeatureOptimizer';
export * from './ColorAccessibility';
