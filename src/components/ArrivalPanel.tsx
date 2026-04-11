import { useLayoutEffect, useState, type CSSProperties } from 'react';
import type { StationInfo, TrainInfo } from '../types/types';

import { getTrainLineImage, getTrainDisplayDetails } from '../utils/utils';

function roundToNearest10Seconds(seconds: number): number {
  const clamped = Math.max(0, seconds);
  return Math.round(clamped / 10) * 10;
}

/**
 * Milliseconds until `roundToNearest10Seconds(remaining)` can change, or `null` if
 * it stays the same until the train reaches 0s (no periodic wake-ups needed).
 */
function msUntilRoundedDisplayChanges(
  baselineTta: number,
  baselineMs: number
): number | null {
  const raw0 = Math.max(0, baselineTta - (Date.now() - baselineMs) / 1000);
  const d0 = roundToNearest10Seconds(raw0);

  if (raw0 <= 0) return null;

  const displayAfter = (elapsedSeconds: number) =>
    roundToNearest10Seconds(Math.max(0, raw0 - elapsedSeconds));

  if (displayAfter(raw0) === d0) return null;

  let lo = 0;
  let hi = raw0;
  for (let i = 0; i < 50; i++) {
    const mid = (lo + hi) / 2;
    if (displayAfter(mid) !== d0) hi = mid;
    else lo = mid;
  }

  return Math.min(120_000, Math.max(2, Math.ceil(hi * 1000) + 1));
}

interface ArrivalPanelProps {
  station: StationInfo;
  stopId: string;
  train: TrainInfo;
  style?: CSSProperties;
  isCompact?: boolean;
}

export default function ArrivalPanel({ 
  station,
  stopId,
  train,
  style,
  isCompact
}: ArrivalPanelProps) {
  const extraClassname = isCompact ? " arrival-panel-compact" : ""

  const { title, subtitle } = getTrainDisplayDetails(stopId, station, train);

  const [displaySeconds, setDisplaySeconds] = useState(() =>
    roundToNearest10Seconds(train.timeToArrival)
  );

  useLayoutEffect(() => {
    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    const baselineTta = train.timeToArrival;
    const baselineMs = Date.now();

    const clearTimer = () => {
      if (timeoutId !== null) {
        window.clearTimeout(timeoutId);
        timeoutId = null;
      }
    };

    const tick = () => {
      const rawRemaining = Math.max(0, baselineTta - (Date.now() - baselineMs) / 1000);
      const nextDisplay = roundToNearest10Seconds(rawRemaining);
      setDisplaySeconds((prev) => (prev === nextDisplay ? prev : nextDisplay));
    };

    const scheduleNext = () => {
      if (cancelled || document.hidden) return;

      const delay = msUntilRoundedDisplayChanges(baselineTta, baselineMs);
      if (delay === null) return;

      clearTimer();
      timeoutId = window.setTimeout(() => {
        timeoutId = null;
        if (cancelled || document.hidden) return;
        tick();
        scheduleNext();
      }, delay);
    };

    const onVisibilityChange = () => {
      if (document.hidden) clearTimer();
      else {
        tick();
        scheduleNext();
      }
    };

    tick();
    scheduleNext();
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      cancelled = true;
      clearTimer();
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [train.tripId, train.timeToArrival]);

  const minutesPart = Math.floor(displaySeconds / 60);
  const secondsPart = String(displaySeconds % 60).padStart(2, "0");

  return (
    <div className="arrival-panel-outer" style={style}>
      <div className="train-logo-container">
        <img 
          src={getTrainLineImage(train.line)} 
          className={"arrival-panel-train-logo" + extraClassname}
          alt={train.line}
        />
        {false && <div className={isCompact ? "warning-overlay-compact" : "warning-overlay"}>
          {/* <Warning /> */}
        </div>}
      </div>
      {!isCompact && <div className="arrival-panel-destination truncate">
        <h2 className="truncate">{title}</h2>
        <p className="truncate">{subtitle}</p>
      </div>}
      <div className="arrival-panel-arrival-time">
        <h1 className={extraClassname}>{minutesPart}</h1>
        <p>{secondsPart}s</p>
      </div>
    </div>
  );
}
  