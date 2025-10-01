import React, { useMemo, useCallback, useRef, useEffect } from 'react';

// Memoization utilities for performance optimization

// Deep comparison for objects
export const deepEqual = (a: any, b: any): boolean => {
  if (a === b) return true;
  
  if (a == null || b == null) return false;
  
  if (typeof a !== typeof b) return false;
  
  if (typeof a !== 'object') return false;
  
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  
  if (Array.isArray(a)) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (!deepEqual(a[i], b[i])) return false;
    }
    return true;
  }
  
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  
  if (keysA.length !== keysB.length) return false;
  
  for (const key of keysA) {
    if (!keysB.includes(key)) return false;
    if (!deepEqual(a[key], b[key])) return false;
  }
  
  return true;
};

// Memoized callback with deep comparison
export const useDeepCallback = <T extends (...args: any[]) => any>(
  callback: T,
  deps: React.DependencyList = []
): T => {
  const ref = useRef<{ callback: T; deps: React.DependencyList } | undefined>(undefined);
  
  if (!ref.current || !deepEqual(ref.current.deps, deps)) {
    ref.current = { callback, deps: deps || [] };
  }
  
  return ref.current.callback;
};

// Memoized value with deep comparison
export const useDeepMemo = <T>(
  factory: () => T,
  deps: React.DependencyList = []
): T => {
  const ref = useRef<{ value: T; deps: React.DependencyList } | undefined>(undefined);
  
  if (!ref.current || !deepEqual(ref.current.deps, deps)) {
    ref.current = { value: factory(), deps: deps || [] };
  }
  
  return ref.current.value;
};

// Debounced callback
export const useDebouncedCallback = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number,
  deps: React.DependencyList = []
): T => {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  
  const debouncedCallback = useCallback((...args: Parameters<T>) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      callback(...args);
    }, delay);
  }, [callback, delay, ...deps]); // eslint-disable-line react-hooks/exhaustive-deps
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
  
  return debouncedCallback as T;
};

// Throttled callback
export const useThrottledCallback = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number,
  deps: React.DependencyList = []
): T => {
  const lastCallRef = useRef<number>(0);
  
  const throttledCallback = useCallback((...args: Parameters<T>) => {
    const now = Date.now();
    
    if (now - lastCallRef.current >= delay) {
      lastCallRef.current = now;
      callback(...args);
    }
  }, [callback, delay, ...deps]); // eslint-disable-line react-hooks/exhaustive-deps
  
  return throttledCallback as T;
};

// Memoized expensive calculation
export const useExpensiveCalculation = <T>(
  calculation: () => T,
  deps: React.DependencyList = [],
  options: {
    maxAge?: number; // Maximum age in milliseconds
    equalityCheck?: (a: T, b: T) => boolean;
  } = {}
): T => {
  const { maxAge = 5000, equalityCheck = deepEqual } = options;
  const ref = useRef<{ value: T; timestamp: number; deps: React.DependencyList } | undefined>(undefined);
  
  const now = Date.now();
  
  if (
    !ref.current ||
    !deepEqual(ref.current.deps, deps) ||
    (maxAge > 0 && now - ref.current.timestamp > maxAge) ||
    !equalityCheck(ref.current.value, calculation())
  ) {
    ref.current = {
      value: calculation(),
      timestamp: now,
      deps: deps || [],
    };
  }
  
  return ref.current.value;
};

// Memoized selector for Redux-like state
export const useMemoizedSelector = <TState, TSelected>(
  selector: (state: TState) => TSelected,
  state: TState,
  equalityCheck?: (a: TSelected, b: TSelected) => boolean
): TSelected => {
  const ref = useRef<{ selected: TSelected; state: TState } | undefined>(undefined);
  
  if (
    !ref.current ||
    ref.current.state !== state ||
    (equalityCheck ? !equalityCheck(ref.current.selected, selector(state)) : ref.current.selected !== selector(state))
  ) {
    ref.current = {
      selected: selector(state),
      state,
    };
  }
  
  return ref.current.selected;
};

// Performance monitoring for memoization
export const useMemoizationStats = () => {
  const statsRef = useRef({
    memoHits: 0,
    memoMisses: 0,
    totalCalls: 0,
  });
  
  const recordHit = useCallback(() => {
    statsRef.current.memoHits += 1;
    statsRef.current.totalCalls += 1;
  }, []);
  
  const recordMiss = useCallback(() => {
    statsRef.current.memoMisses += 1;
    statsRef.current.totalCalls += 1;
  }, []);
  
  const getStats = useCallback(() => {
    const { memoHits, memoMisses, totalCalls } = statsRef.current;
    return {
      memoHits,
      memoMisses,
      totalCalls,
      hitRate: totalCalls > 0 ? (memoHits / totalCalls) * 100 : 0,
    };
  }, []);
  
  const resetStats = useCallback(() => {
    statsRef.current = {
      memoHits: 0,
      memoMisses: 0,
      totalCalls: 0,
    };
  }, []);
  
  return {
    recordHit,
    recordMiss,
    getStats,
    resetStats,
  };
};

export default {
  deepEqual,
  useDeepCallback,
  useDeepMemo,
  useDebouncedCallback,
  useThrottledCallback,
  useExpensiveCalculation,
  useMemoizedSelector,
  useMemoizationStats,
};
