import { useEffect, useRef, useState } from "react";

import { decodeGtfs } from "../services/gtfs";

export function useMtaFeed(feedSuffixes: string[]) {
    const [waitingForData, setWaitingForData] = useState(true);
    const [mtaData, setMtaData] = useState<any[]>([]);
    const requestIdRef = useRef(0);
  
    useEffect(() => {
      if (feedSuffixes.length === 0) return;
  
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
    }, [feedSuffixes]);
  
    return { mtaData, waitingForData };
  }