import { useState, useEffect } from "react";

import Clock from "../components/Clock";
import ArrivalPanelStack from "../components/ArrivalPanelStack";

import stationsData from '../generated/stations.json';
import stopsData from '../generated/stops.json';

import { decodeGtfs } from "../services/gtfs";

import type { StationInfoData, StopInfoData, TrainInfo } from '../types/types';

// Define your snapshots
const SNAPSHOTS = [
  {
    G: { "G1": 1, "G2": 2, "G3": 3 },
    L: { "L0": 0, "L1": 2, "L2": 6 }
  },
  {
    G: { "G2": 2, "G3": 3, "G4": 4 },
    L: { "L0": 0, "L1": 2, "L2": 6 }
  },
  {
    G: { "G3": 3, "G4": 4, "G5": 5 },
    L: { "L0": 0, "L1": 2, "L2": 6 }
  },
  {
    G: { "G4": 4, "G5": 5, "G6": 6 },
    L: { "L0": 0, "L1": 2, "L2": 6 }
  }
];

const FULL_BOROUGH_NAMES: Record<string, string> = {
  "Bk": "Brooklyn",
  "Bx": "Bronx",
  "M": "Manhattan",
  "Q": "Queens",
  "SI": "Staten Island"
}

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
function processMtaData(
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
    const now = feed.header.timestamp; // TODO: fallback to clientNow

    feed.entity?.forEach((entity: any) => {
      const tripUpdate = entity.tripUpdate;
      if (!tripUpdate) return;

      const line = tripUpdate.trip.routeId;
      const tripId = tripUpdate.trip.tripId;

      // Find if this trip stops at any of our target stations
      tripUpdate.stopTimeUpdate?.forEach((update: any) => {
        const stopId = update.stopId;
        const baseStopId = getBaseStopId(stopId);

        if (targetStopIds.includes(baseStopId)) {
          const arrivalTime = update.arrival?.time || update.departure?.time;
          if (!arrivalTime || arrivalTime < now) return;

          // Minutes until arrival (rounded)
          const minutesArrival = Math.round((arrivalTime - now) / 60);

          // The destination is the LAST stopTimeUpdate in the array
          const lastUpdate = tripUpdate.stopTimeUpdate[tripUpdate.stopTimeUpdate.length - 1];
          const destStopId = getBaseStopId(lastUpdate.stopId);
          const destination = stops[destStopId] || { name: "Unknown", borough: "Unknown" };

          trains[stopId].push({
            id: tripId,
            line,
            destinationName: destination.name,
            destinationBorough: FULL_BOROUGH_NAMES[destination.borough] ?? destination.borough,
            arrivalTime: minutesArrival
          });
        }
      });
    });
  });

  // Sort each list by arrival time
  Object.keys(trains).forEach(key => {
    trains[key].sort((a, b) => a.arrivalTime - b.arrivalTime);
  });

  return trains;
}

interface StationBoardProps {
  complexId: string;
}

export default function StationBoard({ complexId }: StationBoardProps) {
  const stations = stationsData as StationInfoData;
  const stops = stopsData as StopInfoData;
  const station = stations[complexId];
  const stationName = station?.name;
  const feedSuffixes = station?.feeds || [];
  const stopIDs = station?.stopIds || [];

  const [mtaData, setMtaData] = useState<any[]>([]);

  useEffect(() => {
    const controller = new AbortController();
  
    async function loadAllFeeds() {
      try {
        const fetchPromises = feedSuffixes.map(async (id) => {
          const res = await fetch(
            `https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs${id}`,
            { signal: controller.signal }
          );
          const buffer = await res.arrayBuffer();
          return await decodeGtfs(buffer);
        });
  
        const data = await Promise.all(fetchPromises);
        setMtaData(data);
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.error("Fetch error:", err);
        }
      }
    }
  
    loadAllFeeds();
  
    const intervalId = setInterval(loadAllFeeds, 30000);
  
    return () => {
      clearInterval(intervalId);
      controller.abort();
    };
  }, [feedSuffixes]);

  const trains = processMtaData(mtaData, stopIDs, stops);

  const sortedStopKeys = Object.keys(trains).sort();

  return (
    <div className="station-board"> 
      <header className="station-board-header">
        <h1>{stationName}</h1>
        <Clock />
      </header>
      <main>
        <div className="arrivals-panel-list">
          {sortedStopKeys.map((stopKey) => (
            <ArrivalPanelStack 
              key={stopKey} 
              trains={trains[stopKey]} 
            />
          ))}
        </div>
      </main>
    </div>
  );
}
