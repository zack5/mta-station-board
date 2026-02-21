import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion';

import ArrivalPanel from './ArrivalPanel';

const PANEL_HEIGHT = 146;
const PANEL_PADDING = 22;
const PEEK_WIDTH = 140
const MAX_STACK_DEPTH = 3;
const GAP_BEFORE_FADE = 10;
const FADE_WIDTH = 50;

interface ArrivalPanelStackProps {
  line: string;
  terminus: string;
  borough: string;
  arrivalTimes: Record<string, number>; // Maps ID strings to minute numbers
}

export default function ArrivalPanelStack({
  line,
  terminus,
  borough,
  arrivalTimes
}: ArrivalPanelStackProps) {
  const [width, setWidth] = useState<number>(1220);

  useEffect(() => {
    const rootElement = document.querySelector('header');
    
    const handleResize = () => {
      if (rootElement) {
        // offsetWidth includes padding and borders
        setWidth(rootElement.offsetWidth);
      }
    };

    // Initial set
    handleResize();

    // Listen for window resize to keep width updated
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Convert arrivalTimes to: [[id, mins], [id, mins]]
  const sortedArrivals = Object.entries(arrivalTimes).sort((a, b) => a[1] - b[1]);

  const arrivalPanelWidth = width - (MAX_STACK_DEPTH - 1) * PEEK_WIDTH 

  return (
    <div className="arrival-panel-stack" style={{ 
      position: 'relative', // Locks coordinate system in for child elements
      width: `${width}px`, 
      height: `${PANEL_HEIGHT}px`,
    }}>
      <AnimatePresence>
        {sortedArrivals.map(([id, minutes], index) => (
          <motion.div
            key={id}
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
              zIndex: (sortedArrivals.length - index),
              opacity: 1,
            }}
            exit={{
              left: `${(index - 1) * PEEK_WIDTH}px`,
              opacity: 0,
              zIndex: index <= 0 ? MAX_STACK_DEPTH + 1 : 0,
            }}
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
            <div className="arrival-panel-darken-below"
              style={{ 
                position: 'absolute',
                top: `-${GAP_BEFORE_FADE}px`,
                width: `${width}px`,
                height: `${PANEL_HEIGHT + GAP_BEFORE_FADE * 2}px`,
              }}
            />
            <ArrivalPanel
              style={{
                width: `${arrivalPanelWidth - 2 * PANEL_PADDING}px`,
                padding: `${PANEL_PADDING}px`
              }}
              line={line}
              terminus={terminus}
              borough={borough}
              arrivalTime={minutes}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
