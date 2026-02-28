import type { StopInfoData, TrainInfo } from '../types/types';

/**
 * Removes the 'N' or 'S' directional suffix from an MTA stop ID.
 * Example: "G29N" -> "G29", "127S" -> "127", "725" -> "725"
 */
const getBaseStopId = (stopId: string): string => {
  return stopId.replace(/[NS]$/i, "");
};

/**
 * Generates a list of Component-ready TrainInfo from raw MTA feed data
 */
export function processMtaTrains(
  mtaData: any[],
  targetStopIds: string[],
  stops: StopInfoData
) {
  const trains: Record<string, TrainInfo[]> = {};

  targetStopIds.forEach(id => {
    trains[`${id}N`] = [];
    trains[`${id}S`] = [];
  });

  const clientNow = Math.floor(Date.now() / 1000);

  mtaData.forEach(feed => {
    const now = feed.header?.timestamp || clientNow

    feed.entity?.forEach((entity: any) => {
      const tripUpdate = entity.tripUpdate;
      if (!tripUpdate) return;

      const line = tripUpdate.trip.routeId;
      const tripId = tripUpdate.trip.tripId;
      const stopUpdates = tripUpdate.stopTimeUpdate;

      // Find if this trip stops at any of our target stations
      stopUpdates?.forEach((update: any, index: number) => {
        const stopId = update.stopId;
        const baseStopId = getBaseStopId(stopId);

        if (targetStopIds.includes(baseStopId)) {
          const arrivalTime = update.arrival?.time || update.departure?.time;
          if (!arrivalTime || arrivalTime < now) return;

          const minutesArrival = Math.round((arrivalTime - now) / 60);

          // Find the next update in the array, if it exists
          const nextUpdate = stopUpdates[index + 1];
          const nextStopId = nextUpdate ? getBaseStopId(nextUpdate.stopId) : null;
          if (!nextStopId) return;
          const nextStop = nextStopId ? (stops[nextStopId] || { name: "Unknown", borough: "Unknown" }) : null;

          // The destination is the LAST stopTimeUpdate in the array
          const lastUpdate = stopUpdates[stopUpdates.length - 1];
          const destStopId = getBaseStopId(lastUpdate.stopId);
          const destination = stops[destStopId] || { name: "Unknown", borough: "Unknown" };


          trains[stopId].push({
            tripId,
            line,
            nextStop,
            destination,
            arrivalTime: minutesArrival
          });
        }
      });
    });
  });

  // Sort each list by arrival time
  Object.keys(trains).forEach(key => {
    if (trains[key].length === 0) {
      delete trains[key];
    } else {
      trains[key].sort((a, b) => a.arrivalTime - b.arrivalTime);
    }
  });

  return trains;
}