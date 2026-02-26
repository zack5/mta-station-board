import { useState, useEffect, useRef } from "react";
import { useLocation, useParams } from "react-router-dom";

import Clock from "../components/Clock";
import ArrivalPanelList from "../components/ArrivalPanelList";
import ArrivalPanelStack from "../components/ArrivalPanelStack";

import stationsData from '../generated/stations.json';
import stopsData from '../generated/stops.json';

import { decodeGtfs } from "../services/gtfs";

import type { StationInfoData, StopInfoData, TrainInfo } from '../types/types';
import { StationSelector } from "../components/StationSelector";

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
    const now = feed.header?.timestamp || clientNow

    feed.entity?.forEach((entity: any) => {
      const tripUpdate = entity.tripUpdate;
      if (!tripUpdate) return;

      const line = tripUpdate.trip.routeId;
      const tripId = tripUpdate.trip.tripId;
      const stopUpdates = tripUpdate.stopTimeUpdate;

      // Find if this trip stops at any of our target stations
      stopUpdates?.forEach((update: any) => {
        const stopId = update.stopId;
        const baseStopId = getBaseStopId(stopId);

        if (targetStopIds.includes(baseStopId)) {
          const arrivalTime = update.arrival?.time || update.departure?.time;
          if (!arrivalTime || arrivalTime < now) return;

          const minutesArrival = Math.round((arrivalTime - now) / 60);

          const currentIndex = stopUpdates.findIndex((u: { stopId?: string | null }) =>
            u.stopId ? getBaseStopId(u.stopId) === baseStopId : false
          );
          // Find the next update in the array, if it exists
          const nextUpdate = stopUpdates[currentIndex + 1];
          const nextStopId = nextUpdate ? getBaseStopId(nextUpdate.stopId) : null;
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

interface StationBoardProps {
  stationId?: string;
}

export default function StationBoard({ stationId: propStationId }: StationBoardProps) {
  const { stationId: paramStationId } = useParams<{ stationId: string }>();
  const { pathname } = useLocation();
  const isDisplayVersion = pathname.toLowerCase().includes("stationdisplay")
  const activeStationId = propStationId ?? paramStationId ?? '';

  const stations = stationsData as StationInfoData;
  const stops = stopsData as StopInfoData;
  const station = stations[activeStationId];
  const feedSuffixes = station?.feeds || [];
  const stopIDs = station?.stopIds || [];

  const [waitingForData, setWaitingForData] = useState(true);
  const [mtaData, setMtaData] = useState<any[]>([]);
  const requestIdRef = useRef(0);

  useEffect(() => {
    if (!activeStationId || feedSuffixes.length === 0) return;

    const controller = new AbortController();
    let isMounted = true;

    async function loadAllFeeds() {
      const requestId = ++requestIdRef.current;
      setWaitingForData(true);

      try {
        const data = await Promise.all(
          feedSuffixes.map(async (id) => {
            const res = await fetch(
              `https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs${id}`,
              { signal: controller.signal }
            );

            if (!res.ok) {
              throw new Error(`MTA API returned ${res.status}`);
            }

            const contentType = res.headers.get("content-type");
            if (contentType?.includes("application/xml") || contentType?.includes("text/html")) {
              const errorText = await res.text();
              throw new Error(`MTA Error (ID: ${id}): ${errorText}`);
            }

            const buffer = await res.arrayBuffer();
            return decodeGtfs(buffer);
          })
        );

        if (isMounted && requestId === requestIdRef.current) {
          setMtaData(data);
          setWaitingForData(false);
        }

      } catch (err: any) {
        if (err.name === "AbortError") return;

        console.error(err);

        if (isMounted && requestId === requestIdRef.current) {
          setWaitingForData(false);
        }
      }
    }

    loadAllFeeds();
    const intervalId = setInterval(loadAllFeeds, 30000);

    return () => {
      isMounted = false;
      controller.abort();
      clearInterval(intervalId);
    };
  }, [activeStationId, feedSuffixes]);

  const trains = processMtaData(mtaData, stopIDs, stops);

  const sortedStopKeys = Object.keys(trains).sort();

  const showLoading = activeStationId && waitingForData && sortedStopKeys.length === 0;
  const noAvailableTrains = !showLoading && activeStationId && sortedStopKeys.length === 0

  return (
    <div className="station-board">
      <header className="station-board-header">
        <StationSelector stationId={activeStationId} />
        <Clock />
      </header>
      <main>
        <div className={`station-board-arrival-panels-${isDisplayVersion ? "stack" : "list"}`}>
          {sortedStopKeys.map((stopId) => {
            const Panel = isDisplayVersion ? ArrivalPanelStack : ArrivalPanelList;

            return (
              <Panel
                key={stopId}
                stopId={stopId}
                station={station}
                trains={trains[stopId]}
              />
            );
          })}
          {showLoading && <p>
            Loading...
          </p>}
          {noAvailableTrains && <p>
            {`No available trains.${waitingForData}`}
          </p>}
        </div>
      </main>
    </div>
  );
}
