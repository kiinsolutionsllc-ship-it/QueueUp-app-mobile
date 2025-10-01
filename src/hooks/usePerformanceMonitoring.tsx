import { useCallback, useRef, useEffect } from 'react';
import { PerformanceMetrics } from '../types/JobTypes';

interface UsePerformanceMonitoringProps {
  componentName: string;
  onMetricsUpdate?: (metrics: PerformanceMetrics) => void;
  enableMonitoring?: boolean;
}

export const usePerformanceMonitoring = ({
  componentName,
  onMetricsUpdate,
  enableMonitoring = true,
}: UsePerformanceMonitoringProps) => {
  const renderStartTime = useRef<number>(0);
  const renderCount = useRef<number>(0);
  const memoryUsage = useRef<number>(0);
  const networkRequests = useRef<number>(0);

  // Start render timing
  const startRender = useCallback(() => {
    if (!enableMonitoring) return;
    renderStartTime.current = performance.now();
  }, [enableMonitoring]);

  // End render timing
  const endRender = useCallback(() => {
    if (!enableMonitoring) return;
    
    const renderTime = performance.now() - renderStartTime.current;
    renderCount.current += 1;
    
    // Update memory usage (simplified) - Note: performance.memory is not standard
    if ((performance as any).memory) {
      memoryUsage.current = (performance as any).memory.usedJSHeapSize / 1024 / 1024; // MB
    }
    
    const metrics: PerformanceMetrics = {
      componentRenderTime: renderTime,
      bundleSize: 0, // Would be calculated from bundle analysis
      memoryUsage: memoryUsage.current,
      networkRequests: networkRequests.current,
    };
    
    onMetricsUpdate?.(metrics);
    
    // Log performance warnings
    if (renderTime > 16) { // 60fps threshold
      console.warn(`${componentName}: Render time ${(renderTime || 0).toFixed(2)}ms exceeds 16ms threshold`);
    }
    
    if (memoryUsage.current > 100) { // 100MB threshold
      console.warn(`${componentName}: Memory usage ${(memoryUsage.current || 0).toFixed(2)}MB exceeds 100MB threshold`);
    }
  }, [enableMonitoring, componentName, onMetricsUpdate]);

  // Track network request
  const trackNetworkRequest = useCallback(() => {
    if (!enableMonitoring) return;
    networkRequests.current += 1;
  }, [enableMonitoring]);

  // Get current metrics
  const getCurrentMetrics = useCallback((): PerformanceMetrics => {
    return {
      componentRenderTime: 0,
      bundleSize: 0,
      memoryUsage: memoryUsage.current,
      networkRequests: networkRequests.current,
    };
  }, []);

  // Reset metrics
  const resetMetrics = useCallback(() => {
    renderCount.current = 0;
    memoryUsage.current = 0;
    networkRequests.current = 0;
  }, []);

  // Monitor component lifecycle
  useEffect(() => {
    if (!enableMonitoring) return;
    
    startRender();
    
    return () => {
      endRender();
    };
  }, [enableMonitoring, startRender, endRender]);

  return {
    startRender,
    endRender,
    trackNetworkRequest,
    getCurrentMetrics,
    resetMetrics,
    renderCount: renderCount.current,
  };
};

export default usePerformanceMonitoring;
