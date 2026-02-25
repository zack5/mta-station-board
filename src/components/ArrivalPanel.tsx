import type { CSSProperties } from 'react';
import type { StationInfo, TrainInfo } from '../types/types';

import Warning from './Warning'

import { getTrainLineImage, getTrainDisplayDetails } from '../utils/utils';

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

  return (
    <div className="arrival-panel-outer" style={style}>
      <div className="train-logo-container">
        <img 
          src={getTrainLineImage(train.line)} 
          className={"arrival-panel-train-logo" + extraClassname}
          alt={train.line}
        />
        {false && <div className={isCompact ? "warning-overlay-compact" : "warning-overlay"}>
          <Warning />
        </div>}
      </div>
      {!isCompact && <div className="arrival-panel-destination truncate">
        <h2 className="truncate">{title}</h2>
        <p className="truncate">{subtitle}</p>
      </div>}
      <div className="arrival-panel-arrival-time">
        <h1 className={extraClassname} >{`${train.arrivalTime}`}</h1>
        <p>MIN</p>
      </div>
    </div>
  );
}
  