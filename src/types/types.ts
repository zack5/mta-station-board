// Format of complexes.json
export interface StationInfo {
  stopName: string;
  displayName: string;
  stopIds: string[];
  feeds: string[];
}
export type StationInfoData = Record<string, StationInfo>;

// Format of stations.json
export interface StopInfo {
  name: string;
  borough: string;
}
export type StopInfoData = Record<string, StopInfo>;

// Format of parsed MTA data
export interface TrainInfo {
  id: string;
  line: string;
  destinationName: string;
  destinationBorough: string;
  arrivalTime: number;
}