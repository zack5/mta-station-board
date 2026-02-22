import type { CSSProperties } from 'react';
import type { StationInfo, TrainInfo } from '../types/types';

interface ArrivalPanelProps {
  station: StationInfo;
  train: TrainInfo;
  style: CSSProperties;
  isCompact: boolean;
}

export default function ArrivalPanel({ 
  station,
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
  const isCrosstown = ["7", "L"].includes(train.line);
  const showUptownDowntown = station.borough === "Manhattan" && !isCrosstown;
  const destinationInOtherBorough = station.borough != train.destinationBorough;

  const titleShowsDirection = showUptownDowntown || destinationInOtherBorough;

  const title = titleShowsDirection
    ? [showUptownDowntown ? station.borough : null, destinationInOtherBorough ? train.destinationBorough : null]
        .filter(Boolean)
        .join(" & ")
    : train.destinationStopName;
  
  const subtitle = titleShowsDirection 
    ? train.destinationStopName 
    : train.destinationBorough;

  return (
    <div className="arrival-panel-outer" style={style}>
      {<img 
        src={getTrainLineImage(train.line)} 
        className={"arrival-panel-train-logo" + extraClassname}
        alt={`${getTrainLineImage(train.line)}`}
      />}
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
  