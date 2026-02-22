import type { CSSProperties } from 'react';
import type { TrainInfo } from '../types/types';

interface ArrivalPanelProps {
    train: TrainInfo
    style: CSSProperties;
    isCompact: boolean;
  }
  
export default function ArrivalPanel({ 
  train,
  style,
  isCompact
}: ArrivalPanelProps) {

  const getTrainLineImage = (trainLine: string): string => {
    let filename = trainLine.toLowerCase();
  
    const specialCases: Record<string, string> = {
      'gs': 's',   // Grand Central Shuttle
      'fs': 's',   // Franklin Ave Shuttle
      'h':  's',   // Rockaway Shuttle
      'si': 'sir', // Staten Island Railway
    };
  
    if (specialCases[filename]) {
      filename = specialCases[filename];
    }

    return `/lines/${filename}.svg`
  }

  const extraClassname = isCompact ? " arrival-panel-compact" : ""

  return (
    <div className="arrival-panel-outer" style={style}>
      {<img 
        src={getTrainLineImage(train.line)} 
        className={"arrival-panel-train-logo" + extraClassname}
        alt={`${getTrainLineImage(train.line)}`}
      />}
      {!isCompact && <div className="arrival-panel-destination truncate">
        <h2 className="truncate">{train.destinationName}</h2>
        <p className="truncate">{train.destinationBorough}</p>
      </div>}
      <div className="arrival-panel-arrival-time">
        <h1 className={extraClassname} >{`${train.arrivalTime}`}</h1>
        <p>MIN</p>
      </div>
    </div>
  );
}
  