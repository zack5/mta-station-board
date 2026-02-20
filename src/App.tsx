import { useEffect, useState } from "react";
import { decodeGtfs } from "./services/gtfs";

function App() {
  const [trainCount, setTrainCount] = useState<number | null>(null);

  useEffect(() => {
    async function loadFeed() {
      const res = await fetch("https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-g");
      const buffer = await res.arrayBuffer();

      const feed = await decodeGtfs(buffer);

      const tripUpdates = feed.entity.filter(
        (e: any) => e.tripUpdate
      );

      setTrainCount(tripUpdates.length);
    }

    loadFeed();
  }, []);

  return (
    <div style={{ padding: "2rem", fontFamily: "system-ui" }}>
      <h1>G Train Tracker</h1>
      <p>
        {trainCount !== null
          ? `Active trips: ${trainCount}`
          : "Loading..."}
      </p>
    </div>
  );
}

export default App;
