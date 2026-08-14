import { useState, useEffect, useCallback, useRef } from 'react';

export type SensorPermissionState = 'prompt' | 'granted' | 'denied' | 'unsupported';
export type SensitivityLevel = 'high' | 'medium' | 'low';

interface UsePedometerOptions {
  onStep: (stepCount: number) => void;
}

export function usePedometer({ onStep }: UsePedometerOptions) {
  const [permissionStatus, setPermissionStatus] = useState<SensorPermissionState>(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('pedometer_allowed') === 'true') {
      return 'granted';
    }
    return 'prompt';
  });
  const [isListening, setIsListening] = useState<boolean>(false);
  const [lastMotionMagnitude, setLastMotionMagnitude] = useState<number>(0);
  const [sensorStepsCount, setSensorStepsCount] = useState<number>(0);
  const [sensitivity, setSensitivity] = useState<SensitivityLevel>('medium');
  const [hasDetectedMotion, setHasDetectedMotion] = useState<boolean>(false);

  // References for motion processing & peak detection
  const lastStepTimeRef = useRef<number>(0);
  const isPeakRef = useRef<boolean>(false);
  const smoothedMagRef = useRef<number>(0);

  // High-pass gravity filter components
  const gravityRef = useRef<{ x: number; y: number; z: number }>({ x: 0, y: 0, z: 9.81 });

  // Thresholds based on sensitivity (m/s² linear acceleration magnitude)
  const getThreshold = (sens: SensitivityLevel) => {
    switch (sens) {
      case 'high':
        return 1.1; // Highly sensitive for holding phone gently while walking
      case 'medium':
        return 1.6; // Standard step threshold
      case 'low':
        return 2.2; // Vigorous walking / jogging
      default:
        return 1.6;
    }
  };

  // Motion event handler with High-Pass Filter and Peak Detection
  const handleDeviceMotion = useCallback(
    (event: DeviceMotionEvent) => {
      let rawX: number | null = null;
      let rawY: number | null = null;
      let rawZ: number | null = null;

      // 1. Try linear acceleration first
      if (
        event.acceleration &&
        event.acceleration.x !== null &&
        event.acceleration.x !== undefined
      ) {
        rawX = event.acceleration.x;
        rawY = event.acceleration.y;
        rawZ = event.acceleration.z;
      }

      // 2. Fallback to accelerationIncludingGravity
      const isGravityBase = rawX === null || (rawX === 0 && rawY === 0 && rawZ === 0);
      if (isGravityBase && event.accelerationIncludingGravity) {
        rawX = event.accelerationIncludingGravity.x || 0;
        rawY = event.accelerationIncludingGravity.y || 0;
        rawZ = event.accelerationIncludingGravity.z || 0;
      }

      if (rawX === null || rawY === null || rawZ === null) return;

      let linearMag = 0;

      if (isGravityBase) {
        // Apply low-pass exponential filter to isolate static gravity
        const alpha = 0.82;
        gravityRef.current.x = alpha * gravityRef.current.x + (1 - alpha) * rawX;
        gravityRef.current.y = alpha * gravityRef.current.y + (1 - alpha) * rawY;
        gravityRef.current.z = alpha * gravityRef.current.z + (1 - alpha) * rawZ;

        // Linear user movement without static gravity
        const userX = rawX - gravityRef.current.x;
        const userY = rawY - gravityRef.current.y;
        const userZ = rawZ - gravityRef.current.z;

        linearMag = Math.sqrt(userX * userX + userY * userY + userZ * userZ);
      } else {
        // Pure acceleration already available
        linearMag = Math.sqrt(rawX * rawX + rawY * rawY + rawZ * rawZ);
      }

      // Smooth magnitude using exponential filter
      smoothedMagRef.current = 0.65 * smoothedMagRef.current + 0.35 * linearMag;
      const currentMag = Math.round(smoothedMagRef.current * 10) / 10;
      setLastMotionMagnitude(currentMag);

      if (linearMag > 0.3 && !hasDetectedMotion) {
        setHasDetectedMotion(true);
        setPermissionStatus('granted');
        setIsListening(true);
      }

      // Step Peak Detection
      const now = Date.now();
      const threshold = getThreshold(sensitivity);
      const minStepInterval = 270; // min 270ms between step impacts (~3.7 steps/sec)

      if (smoothedMagRef.current >= threshold) {
        if (!isPeakRef.current && now - lastStepTimeRef.current > minStepInterval) {
          isPeakRef.current = true;
          lastStepTimeRef.current = now;
          setSensorStepsCount(prev => prev + 1);
          onStep(1);
        }
      } else if (smoothedMagRef.current < threshold * 0.65) {
        isPeakRef.current = false;
      }
    },
    [onStep, sensitivity, hasDetectedMotion]
  );

  // Request Permission (or manually enable)
  const requestPermission = useCallback(async () => {
    if (typeof window === 'undefined') {
      setPermissionStatus('unsupported');
      return false;
    }

    // Check if iOS style permission required
    const deviceMotionAny = typeof DeviceMotionEvent !== 'undefined'
      ? (DeviceMotionEvent as unknown as { requestPermission?: () => Promise<'granted' | 'denied'> })
      : null;

    if (deviceMotionAny && typeof deviceMotionAny.requestPermission === 'function') {
      try {
        const response = await deviceMotionAny.requestPermission();
        if (response === 'granted') {
          if (typeof window !== 'undefined') localStorage.setItem('pedometer_allowed', 'true');
          setPermissionStatus('granted');
          setIsListening(true);
          window.addEventListener('devicemotion', handleDeviceMotion, true);
          return true;
        } else {
          setPermissionStatus('denied');
          return false;
        }
      } catch (err) {
        console.warn('iOS motion permission error:', err);
      }
    }

    // Standard Android / Chrome listener attachment
    try {
      window.addEventListener('devicemotion', handleDeviceMotion, true);
      if (typeof window !== 'undefined') localStorage.setItem('pedometer_allowed', 'true');
      setPermissionStatus('granted');
      setIsListening(true);
      return true;
    } catch (err) {
      console.warn('Failed to attach devicemotion listener:', err);
      setPermissionStatus('denied');
      return false;
    }
  }, [handleDeviceMotion]);

  // Auto-attach listeners on mount for immediate pedometer responsiveness
  useEffect(() => {
    if (typeof window === 'undefined' || !('DeviceMotionEvent' in window)) {
      setPermissionStatus('unsupported');
      return;
    }

    window.addEventListener('devicemotion', handleDeviceMotion, true);
    setIsListening(true);

    // Auto-detect permission state if events flow
    const timer = setTimeout(() => {
      if (hasDetectedMotion) {
        setPermissionStatus('granted');
      }
    }, 1500);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('devicemotion', handleDeviceMotion, true);
    };
  }, [handleDeviceMotion, hasDetectedMotion]);

  return {
    permissionStatus,
    isListening,
    lastMotionMagnitude,
    sensorStepsCount,
    sensitivity,
    setSensitivity,
    hasDetectedMotion,
    requestPermission,
  };
}
