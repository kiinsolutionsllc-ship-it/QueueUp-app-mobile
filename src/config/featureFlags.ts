// Feature Flags Configuration
// Use this to enable/disable features without database dependencies

export const FEATURE_FLAGS = {
  // Set to false to disable support tickets and avoid database errors
  SUPPORT_TICKETS_ENABLED: false,
  
  // Other feature flags
  JOBS_ENABLED: true,
  MESSAGING_ENABLED: true,
  PAYMENTS_ENABLED: true,
  NOTIFICATIONS_ENABLED: true,
  ANALYTICS_ENABLED: true,
} as const;

export type FeatureFlag = keyof typeof FEATURE_FLAGS;

export function isFeatureEnabled(flag: FeatureFlag): boolean {
  return FEATURE_FLAGS[flag];
}
