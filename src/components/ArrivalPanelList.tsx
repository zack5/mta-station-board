import { useEffect, useRef, useState } from 'react'
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
  //const { clientWidth, contentWidth, isMobile } = useStationBoardContext();

  const transition = {}

  return (
    <div>
      <div>
        <h2>{trains[0]?.destination.borough}</h2>
      </div>
      <motion.div
        className="arrival-panel-list-container"
        drag="x"
        dragConstraints={{ left: -1 * 100, right: 0 }}
      >
        <AnimatePresence>
          {trains.map((train) => (
            <motion.div
              key={`${train.tripId}`}
              layout
              style={{
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
        </AnimatePresence>
      </motion.div>
    </div>
  );
}