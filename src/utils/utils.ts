import { AlertCategory } from '../types/types';
import type { AlertInfo, StationInfo, TrainInfo } from '../types/types';

export function isCrosstown(line: string): boolean {
  return ["7", "7x", "l"].includes(line.toLowerCase());
}

export function isShuttle(line: string): boolean {
  return ["s", "fs", "h", "gs"].includes(line.toLowerCase());
}

export function getTrainLineImage(trainLine: string) {
  let filename = trainLine.toLowerCase();

  const specialCases: Record<string, string> = {
    'gs': 's',   // Grand Central Shuttle
    'fs': 's',   // Franklin Ave Shuttle
    'h':  's',   // Rockaway Shuttle
    'si': 'sir', // Staten Island Railway
    'ss': 'sir', // Staten Island Railway
  };

  if (specialCases[filename]) {
    filename = specialCases[filename];
  }

  return `/lines/${filename}.svg`
}

export function getAlertImage(alert: AlertInfo): string {
  switch (alert.category) {
    case AlertCategory.SUSPENDED:
      return '/alerts/severe.svg';

    case AlertCategory.PART_SUSPENDED:
    case AlertCategory.DELAYS:
    case AlertCategory.REROUTE:
    case AlertCategory.REDUCED_SERVICE:
      return '/alerts/warning.svg';

    case AlertCategory.ACCESSIBILITY:
    case AlertCategory.PLANNED_WORK:
      return '/alerts/maintenance.svg';

    case AlertCategory.NOTICE:
      return '/alerts/info.svg';

    default:
      return '/alerts/warning.svg';
  }
}

export function getAlertTitle(alert: AlertInfo): string {
  switch (alert.category) {
    case AlertCategory.SUSPENDED:
      return 'Suspended';
    case AlertCategory.PART_SUSPENDED:
      return 'Part Suspended';
    case AlertCategory.DELAYS:
      return 'Delays';
    case AlertCategory.REROUTE:
      return 'Reroute';
    case AlertCategory.REDUCED_SERVICE:
      return 'Reduced Service';
    case AlertCategory.ACCESSIBILITY:
      return 'Accessibility';
    case AlertCategory.PLANNED_WORK:
      return 'Planned Work';
    case AlertCategory.NOTICE:
      return 'Notice';

    default:
      return 'Alert';
  }
}

export function getTrainDisplayDetails(stopId: string, station: StationInfo, train: TrainInfo) {
  const destination = train.destination;

  // Special case: use destinations for shuttles
  const isShuttleLine = isShuttle(train.line);
  if (isShuttleLine) {
    const title = destination.name;
    const subtitle = destination.borough;
    return { title, subtitle };
  }

  const isCrosstownTrain = isCrosstown(train.line);
  const isNorthbound = stopId.endsWith("N");
  const isSouthbound = stopId.endsWith("S");

  const showUptownDowntown = (!isCrosstownTrain
    && station.borough === "Manhattan" 
    && train.nextStop && train.nextStop.borough === "Manhattan"
    && (isNorthbound || isSouthbound));
  const destinationInOtherBorough = station.borough != destination.borough;

  const titleShowsDirection = showUptownDowntown || destinationInOtherBorough;

  const title = titleShowsDirection
    ? [showUptownDowntown ? (isNorthbound ? "Uptown" : "Downtown") : null, destinationInOtherBorough ? destination.borough : null]
        .filter(Boolean)
        .join(" & ")
    : destination.name;
  
  const subtitle = titleShowsDirection 
    ? destination.name 
    : destination.borough;

  return { title, subtitle };
}

export function getPlatformHeader(stopId: string, station: StationInfo, trains: TrainInfo[]) {
  if (trains.length === 0) return "No Trains";

  const firstTrain = trains[0];
  const isShuttleLine = isShuttle(firstTrain.line);

  // Special case: use destinations for shuttles
  if (isShuttleLine) {
    const uniqueDests = Array.from(new Set(trains.map(t => t.destination.name))).sort();
    return uniqueDests.join(" & ");
  }

  const isNorthbound = stopId.endsWith("N");
  const isSouthbound = stopId.endsWith("S");

  // 1. Manhattan Uptown/Downtown Logic
  const isManhattanVertical = !trains.every(t => isCrosstown(t.line))
    && station.borough === "Manhattan"
    && trains.some(t => t.nextStop?.borough === "Manhattan")
    && (isNorthbound || isSouthbound);

  // 2. Identify Unique Destination Boroughs
  const destBoroughs = Array.from(new Set(
    trains.map(t => t.destination.borough)
  ));

  const components: string[] = [];

  // 3. Title Construction
  if (isManhattanVertical) {
    if (isNorthbound || isSouthbound)
    components.push(isNorthbound ? "Uptown" : "Downtown");
    
    // In Manhattan, if going to another borough, add it (e.g. "Uptown & The Bronx")
    const otherBoroughs = destBoroughs.filter(b => b !== "Manhattan");
    components.push(...otherBoroughs);
  } else {
    // Show all destination boroughs for Crosstown or Outer Borough lines
    components.push(...destBoroughs.sort());
  }

  let title = components.join(" & ");

  // Fallback for edge cases
  if (!title) {
    title = isNorthbound ? "Northbound" : isSouthbound ? "Southbound" : "Upcoming";
  }

  return title;
}

export const ROUTE_REGEX = /(?:\[([A-Z0-9])\])|(?<=^|[\s/])(?:([A-Z])|([0-9])(?!\s*min))(?=$|[\s/])\/?/g;

export const isRoutePart = (part: string): boolean => {
  return /^[A-Z0-9]$/.test(part);
};

export const parseRouteText = (text: string) => {
  return text.split(ROUTE_REGEX).filter(Boolean);
};