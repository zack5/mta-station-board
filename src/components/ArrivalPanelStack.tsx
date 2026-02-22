import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion';

import ArrivalPanel from './ArrivalPanel';

import type { TrainInfo } from '../types/types';

interface ArrivalPanelStackProps {
  trains: TrainInfo[]
}

export default function ArrivalPanelStack({
  trains
}: ArrivalPanelStackProps) {
  const [clientWidth, setClientWidth] = useState<number>(0);
  const [surfaceWidth, setSurfaceWidth] = useState<number>(0);

  let transition = {};
  /* --- DEBUG ANIMATION SECTION START --- */
  /* Uncomment this block out to enable auto-rotation */
  // transition = {duration: 1}
  // const [debugTime, setDebugTime] = useState(0);
  // useEffect(() => {
  //   let frameId: number;
  //   const update = (t: number) => {
  //     setDebugTime(t / 1000); // convert to seconds
  //     frameId = requestAnimationFrame(update);
  //   };
  //   frameId = requestAnimationFrame(update);
  //   return () => cancelAnimationFrame(frameId);
  // }, []);

  // const shift = Math.floor(debugTime / 2) % (trains.length || 1);
  // const rotatedTrains = [...trains.slice(shift), ...trains.slice(0, shift)];
  // trains = rotatedTrains;
  /* --- DEBUG ANIMATION SECTION END --- */

  const isDesktop = clientWidth > 800; // Keep in sync with css media query
  const PANEL_HEIGHT = isDesktop ? 126 : 60;
  const PANEL_PADDING = isDesktop ? 18 : 8;
  const PEEK_WIDTH = isDesktop ? 180 : 75;
  const FADE_WIDTH = isDesktop ? 50 : 30;
  const GAP_BEFORE_FADE = isDesktop ? 0 : 0;
  const MAX_STACK_DEPTH = isDesktop ? 3 : 3;

  useEffect(() => {
    const root = document.documentElement;
    const header = document.querySelector('header');
    
    const handleResize = () => {
      if (root) {
        setClientWidth(root.offsetWidth);
      }
      if (header) {
        setSurfaceWidth(header.offsetWidth);
      }
    };

    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const arrivalPanelWidth = surfaceWidth - (MAX_STACK_DEPTH - 1) * PEEK_WIDTH
  const displayedTrains = trains.slice(0, MAX_STACK_DEPTH);

  if (clientWidth <= 0)
  {
    return <></>
  }

  return (
    <div className="arrival-panel-stack" style={{ 
      position: 'relative', // Locks coordinate system in for child elements
      width: `${surfaceWidth}px`, 
      height: `${PANEL_HEIGHT}px`,
    }}>
      <AnimatePresence>
        {displayedTrains.map((train, index) => (
          <motion.div
            key={`${train.id}`}
            layout
            style={{ 
              position: 'absolute',
              width: `${arrivalPanelWidth}px`,
            }}
            initial={{
              left: `${(index + 1) * PEEK_WIDTH}px`,
              zIndex: 0,
              opacity: 0,
            }}
            animate={{
              left: `${(index + 0) * PEEK_WIDTH}px`,
              zIndex: (displayedTrains.length - index),
              opacity: 1,
            }}
            exit={{
              left: `${(index - 1) * PEEK_WIDTH}px`,
              opacity: 0,
              zIndex: index <= 0 ? MAX_STACK_DEPTH + 1 : 0,
            }}
            transition={transition}
          >
            <div className="arrival-panel-backing"
              style={{ 
                position: 'absolute',
                top: `-${GAP_BEFORE_FADE}px`,
                width: `${arrivalPanelWidth}px`,
                paddingBlock: `${GAP_BEFORE_FADE}px`,
                paddingRight: `${GAP_BEFORE_FADE}px`,
                height: `${PANEL_HEIGHT}px`,
              }}
            />
            <div className="arrival-panel-backing-fade"
              style={{ 
                position: 'absolute',
                top: `-${GAP_BEFORE_FADE}px`,
                left: `${arrivalPanelWidth + GAP_BEFORE_FADE}px`,
                width: `${FADE_WIDTH}px`,
                height: `${PANEL_HEIGHT + GAP_BEFORE_FADE * 2}px`,
              }}
            />
            <div className={index < 1 ? "arrival-panel-darken-below" : "arrival-panel-extra-darken-below"}
              style={{ 
                position: 'absolute',
                top: `-${GAP_BEFORE_FADE}px`,
                width: `${surfaceWidth}px`,
                height: `${PANEL_HEIGHT + GAP_BEFORE_FADE * 2}px`,
              }}
            />
            <ArrivalPanel
              style={{
                width: `${arrivalPanelWidth - 2 * PANEL_PADDING}px`,
                height: `${PANEL_HEIGHT - 2 * PANEL_PADDING}px`,
                padding: `${PANEL_PADDING}px`
              }}
              train={train}
              isCompact={index > 0}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
