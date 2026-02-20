import './app.css'

import { useEffect, useState } from "react";
import { decodeGtfs } from "./services/gtfs";

import StationBoard from "./pages/StationBoard";

function App() {
  const [trainCount, setTrainCount] = useState<number | null>(null);

  useEffect(() => {
    async function loadFeed() {
      const res = await fetch("https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-g");
      const buffer = await res.arrayBuffer();

      const feed = await decodeGtfs(buffer);

      const now = Number(feed.header.timestamp);
      const arrivals = feed.entity
        .filter(entity => entity.tripUpdate)
        .flatMap(entity => {
          const trip = entity.tripUpdate!;

          // G29: Metropolitain Ave-Lorimer St
          const stop = trip.stopTimeUpdate?.find(s => s.stopId?.startsWith('G29'));
          
          if (!stop || !stop.arrival?.time) return [];

          return [{
            direction: stop.stopId?.endsWith('N') ? 'Northbound' : 'Southbound',
            arrivalTime: Number(stop.arrival.time),
            minutesAway: Math.round((Number(stop.arrival.time) - now) / 60),
            isLive: (trip.trip as any)['.nyctTripDescriptor']?.isAssigned || false
          }];
        })
        .filter(a => a.minutesAway >= 0) // Hide trains that already passed
        .sort((a, b) => a.arrivalTime - b.arrivalTime);
      console.log(arrivals);
    }

    loadFeed();
  }, []);

  return (
    <StationBoard/>
  );
}

export default App;
