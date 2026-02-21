import type { CSSProperties } from 'react';
import type { TrainInfo } from '../types/types';

interface ArrivalPanelProps {
    train: TrainInfo
    style: CSSProperties;
  }
  
  export default function ArrivalPanel({ 
    train,
    style
  }: ArrivalPanelProps) {
    return (
      <div className="arrival-panel-outer" style={style}>
        <img 
          src={`/src/assets/${train.line.toLowerCase()}.svg`} 
          className="arrival-panel-train-logo" 
          alt={`${train.line} train`}
        />
        <div className="arrival-panel-destination">
          <h2>{train.destinationName}</h2>
          <p>{train.destinationBorough}</p>
        </div>
        <div className="arrival-panel-arrival-time">
          <h1>{`${train.arrivalTime}`}</h1>
          <p>MIN</p>
        </div>
      </div>
    );
  }
  