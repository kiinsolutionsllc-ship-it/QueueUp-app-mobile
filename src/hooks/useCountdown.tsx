import { useState, useEffect, useRef } from 'react';

interface CountdownResult {
  hours: number;
  minutes: number;
  seconds: number;
  totalMs: number;
  isExpired: boolean;
  isExpiring: boolean;
}

export const useCountdown = (targetTime: string | number | null): CountdownResult => {
  const [timeLeft, setTimeLeft] = useState<CountdownResult>({
    hours: 0,
    minutes: 0,
    seconds: 0,
    totalMs: 0,
    isExpired: false,
    isExpiring: false,
  });
  
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!targetTime) {
      setTimeLeft({
        hours: 0,
        minutes: 0,
        seconds: 0,
        totalMs: 0,
        isExpired: true,
        isExpiring: false,
      });
      return;
    }

    const updateCountdown = () => {
      const now = Date.now();
      const target = typeof targetTime === 'string' ? new Date(targetTime).getTime() : targetTime;
      const difference = target - now;

      if (difference <= 0) {
        setTimeLeft({
          hours: 0,
          minutes: 0,
          seconds: 0,
          totalMs: 0,
          isExpired: true,
          isExpiring: false,
        });
        
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        return;
      }

      const hours = Math.floor(difference / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);
      const twoHoursMs = 2 * 60 * 60 * 1000;

      setTimeLeft({
        hours,
        minutes,
        seconds,
        totalMs: difference,
        isExpired: false,
        isExpiring: difference <= twoHoursMs,
      });
    };

    // Update immediately
    updateCountdown();

    // Set up interval to update every second
    intervalRef.current = setInterval(updateCountdown, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [targetTime]);

  return timeLeft;
};
