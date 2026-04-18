import { useState, useEffect } from "react";
import { decodeGtfs } from "../services/gtfs";

export function useAlertsFeed() {
  const [rawAlerts, setRawAlerts] = useState<any[]>([]);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchAlerts() {

      try {
        const res = await fetch(
          "https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/camsys%2Fsubway-alerts",
          {
            signal: controller.signal,
          }
        );

        if (!res.ok) throw new Error(`Alerts API returned ${res.status}`);

        const contentType = res.headers.get("content-type");
        if (
          contentType?.includes("application/xml") ||
          contentType?.includes("text/html")
        ) {
          const errorText = await res.text();
          throw new Error(`Alerts API error response: ${errorText}`);
        }

        const buffer = await res.arrayBuffer();
        const decoded = await decodeGtfs(buffer);
        
        // GTFS-RT alerts are stored in the entity array
        setRawAlerts(decoded.entity || []);
        setError(null);
      } catch (err: any) {
        if (err.name !== "AbortError") {
          console.error("Alerts Fetch Error:", err);
          setError(err);
        }
      }
    }

    fetchAlerts();

    const intervalId = setInterval(fetchAlerts, 120000);

    return () => {
      controller.abort();
      clearInterval(intervalId);
    };
  }, []);

  return { rawAlerts, error };
}