import { useState, useEffect, useRef } from 'react';
import { useRoute } from '@/hooks/use-navigate';
import { getBrowserPosition } from '@/utils/geo';
import type { LatLng, NavStep } from '@/types';

const POLL_INTERVAL_MS = 3000;

export function useNavigationPolling(destination: [number, number] | null) {
  const [locationStatus, setLocationStatus] = useState<'requesting' | 'denied' | 'granted'>('requesting');
  const [userPos,  setUserPos]  = useState<LatLng | null>(null);
  const [route,    setRoute]    = useState<LatLng[]>([]);
  const [navSteps, setNavSteps] = useState<NavStep[]>([]);

  const pollRef      = useRef<ReturnType<typeof setInterval> | null>(null);
  const totalDistRef = useRef<number>(0);
  const stepsRef     = useRef<NavStep[]>([]);

  const routeMutation = useRoute();

  function startPollingLoop(dest: [number, number], cancelled: { current: boolean }) {
    pollRef.current = setInterval(async () => {
      if (cancelled.current) return;
      const updated = await getBrowserPosition();
      if (cancelled.current || !updated) return;
      setUserPos(updated);
      try {
        const { pts, steps, totalDist } = await routeMutation.mutateAsync({ start: updated as [number, number], end: dest });
        if (cancelled.current) return;
        totalDistRef.current = totalDist;
        stepsRef.current     = steps;
        setRoute(pts);
        setNavSteps(steps);
      } catch (err) {
        console.error('Route refresh failed:', err);
      }
    }, POLL_INTERVAL_MS);
  }

  useEffect(() => {
    if (!destination) return;
    const cancelled = { current: false };

    (async () => {
      setLocationStatus('requesting');
      const pos = await getBrowserPosition();
      if (cancelled.current) return;

      if (!pos) { setLocationStatus('denied'); return; }
      setLocationStatus('granted');

      try {
        const { pts, steps, totalDist } = await routeMutation.mutateAsync({ start: pos as [number, number], end: destination });
        if (cancelled.current) return;
        totalDistRef.current = totalDist;
        stepsRef.current     = steps;
        setRoute(pts);
        setNavSteps(steps);
        setUserPos(pos);
      } catch {
        if (!cancelled.current) setLocationStatus('denied');
        return;
      }

      startPollingLoop(destination, cancelled);
    })();

    return () => {
      cancelled.current = true;
      if (pollRef.current) clearInterval(pollRef.current);
      window.speechSynthesis?.cancel();
    };
  }, [destination?.[0], destination?.[1]]);

  const handleRetry = async () => {
    if (!destination) return;
    setLocationStatus('requesting');

    const pos = await getBrowserPosition();
    if (!pos) { setLocationStatus('denied'); return; }
    setLocationStatus('granted');

    try {
      const { pts, steps, totalDist } = await routeMutation.mutateAsync({ start: pos as [number, number], end: destination });
      totalDistRef.current = totalDist;
      stepsRef.current     = steps;
      setRoute(pts);
      setNavSteps(steps);
      setUserPos(pos);
    } catch {
      setLocationStatus('denied');
      return;
    }

    if (pollRef.current) clearInterval(pollRef.current);
    const notCancelled = { current: false };
    startPollingLoop(destination, notCancelled);
  };

  const stopPolling = () => {
    if (pollRef.current) clearInterval(pollRef.current);
  };

  return { locationStatus, userPos, route, navSteps, totalDistRef, stepsRef, handleRetry, stopPolling };
}
