/*** STATIONS ***/

// Format of complexes.json
export interface StationInfo {
  stopName: string;
  displayName: string;
  borough: string;
  stopIds: string[];
  feeds: string[];
}
export type StationInfoData = Record<string, StationInfo>;


/*** STOPS ***/

// Format of stations.json
export interface StopInfo {
  name: string;
  borough: string;
}
export type StopInfoData = Record<string, StopInfo>;


/*** TRAINS ***/

// Format of parsed MTA train data
export interface TrainInfo {
  tripId: string;
  line: string;
  nextStop: StopInfo | null;
  destination: StopInfo;
  timeToArrival: number;
}

/*** ALERTS ***/

export enum AlertCategory {
  SUSPENDED,
  PART_SUSPENDED,
  DELAYS,
  REROUTE,
  REDUCED_SERVICE,
  ACCESSIBILITY,
  PLANNED_WORK,
  NOTICE,
}

export interface AlertActivePeriod {
  start: number;
  end?: number;
  isCurrent: boolean;
}

export interface AlertInfo {
  id: string;
  category: AlertCategory;
  header: string;
  description: string;
  activePeriods: AlertActivePeriod[];
  affectedLines: string[];
}