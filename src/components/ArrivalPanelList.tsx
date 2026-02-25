import { motion, AnimatePresence } from 'framer-motion';

import ArrivalPanel from './ArrivalPanel';

import { useStationBoardContext } from '../context/StationBoardContext';

import type { StationInfo, TrainInfo } from '../types/types';

interface ArrivalPanelListProps {
  stopId: string;
  station: StationInfo;
  trains: TrainInfo[];
}

export default function ArrivalPanelList({
  stopId,
  station,
  trains
}: ArrivalPanelListProps) {
  const { contentWidth, isMobile } = useStationBoardContext();

  const GAP = isMobile ? 3 : 5;
  const WIDTH = contentWidth;
  const HEIGHT = isMobile ? 60 : 90;
  const MAX_ROWS = 3;

  const rows = Math.min(MAX_ROWS, trains.length);
  const cols = Math.floor((trains.length + MAX_ROWS - 1) / MAX_ROWS);
  const containerHeight = (HEIGHT * rows) + (GAP * (rows - 1));
  const gridSize = WIDTH + GAP;

  const uniqueLines = [...new Set(trains.map(t => t.line.toLowerCase()))].sort();

  const transition = {}

  return (
    <div className="arrival-panel-list-wrapper">
      <div className="arrival-panel-list-header">
        {uniqueLines.map((line) => (
          <img
            key={line}
            src={`/lines/${line}.svg`}
            alt={`${line}`}
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        ))}
        <h2 className="truncate">{trains[0]?.destination.borough}</h2>
      </div>
      <motion.div
        className="arrival-panel-list-container"
        drag="x"
        dragConstraints={{
          left: -1 * (cols - 1) * WIDTH - Math.max(cols - 2, 0) * GAP,
          right: 0
        }}
        dragTransition={{
          power: 0.3,
          timeConstant: 100,
          modifyTarget: (target) => Math.round(target / gridSize) * gridSize,
        }}
        style={{
          gap: GAP,
          height: containerHeight
        }}
      >
        <AnimatePresence>
          {trains.map((train) => (
            <motion.div
              key={`${train.tripId}`}
              layout
              style={{
                width: contentWidth
              }}
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: 1,
              }}
              exit={{
                opacity: 0,
              }}
              transition={transition}
            >
              <ArrivalPanel
                key={train.tripId}
                style={{
                }}
                station={station}
                stopId={stopId}
                train={train}
              />
            </motion.div>
          ))}
          {Array.from({ length: Math.max(rows, trains.length % MAX_ROWS) }).map((_, i) => (
            <div
              key={i}
              style={{
                width: WIDTH,
                height: HEIGHT,
                backgroundColor: "var(--color-background)",
              }}
            />
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}