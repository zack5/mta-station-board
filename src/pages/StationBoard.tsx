import { useMemo } from "react";
import { useLocation, useParams } from "react-router-dom";

import Clock from "../components/Clock";
import ArrivalPanelList from "../components/ArrivalPanelList";
import ArrivalPanelStack from "../components/ArrivalPanelStack";
import { StationSelector } from "../components/StationSelector";

import { useAlertsFeed } from "../hooks/useAlertsFeed";
import { useMtaFeed } from "../hooks/useMtaFeed";

import stationsData from '../generated/stations.json';
import stopsData from '../generated/stops.json';

// import { processMtaAlerts } from '../services/mtaAlertsProcessor';
import { processMtaTrains } from '../services/mtaTrainsProcessor';

import type { StationInfoData, StopInfoData } from '../types/types';

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
  const stopIDs = station?.stopIds || [];

  const { mtaData, waitingForData } = useMtaFeed(station?.feeds || []);
  const { rawAlerts } = useAlertsFeed();

  const trains = useMemo(() => {
    if (mtaData.length === 0) return {};
    return processMtaTrains(mtaData, stopIDs, stops);
  }, [mtaData, stopIDs, stops]);

  // const alerts = useMemo(() => {
  //   if (mtaData.length === 0) return {};
  //   return processMtaAlerts(trains, rawAlerts);
  // }, [trains, rawAlerts]);

  const sortedStopKeys = Object.keys(trains).sort();

  const showLoading = activeStationId && activeStationId in stations && waitingForData && sortedStopKeys.length === 0;
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
            No available trains.
          </p>}
        </div>
      </main>
    </div>
  );
}
