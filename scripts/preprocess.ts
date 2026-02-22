import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { parse } from "csv-parse/sync";

// ESM-safe __dirname replacement
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

type StationRow = {
  "Complex ID": string;
  "Display Name": string;
  "Station IDs": string;
  "Daytime Routes": string;
  "Borough": string;
};

type StopRow = {
  stop_id: string;
  stop_name: string;
  location_type: string;
  parent_station: string;
};

const ROOT = path.resolve(__dirname, "..");

const stationsPath = path.join(
  ROOT,
  "data/raw/MTA_Subway_Stations_and_Complexes.csv"
);

const stopsPath = path.join(ROOT, "data/raw/stops.txt");

const stationsOutputPath = path.join(ROOT, "src/generated/stations.json");
const stopsOutputPath = path.join(ROOT, "src/generated/stops.json");

/* ---------------- Route → Feed Mapping ---------------- */

const routeFeedMap: Record<string, string> = {
  A: "-ace",
  C: "-ace",
  E: "-ace",

  B: "-bdfm",
  D: "-bdfm",
  F: "-bdfm",
  M: "-bdfm",

  G: "-g",

  J: "-jz",
  Z: "-jz",

  N: "-nqrw",
  Q: "-nqrw",
  R: "-nqrw",
  W: "-nqrw",

  L: "-l",

  SIR: "-si",

  "1": "",
  "2": "",
  "3": "",
  "4": "",
  "5": "",
  "6": "",
  "7": "",
  S: "",
};

/* ---------------- Helpers ---------------- */

function parseCSV(filePath: string) {
  const content = fs.readFileSync(filePath, "utf-8");
  return parse(content, {
    columns: true,
    skip_empty_lines: true,
  });
}

function routesToFeeds(routeString: string): string[] {
  if (!routeString) return [];

  const routes = routeString.split(/\s+/);

  const feeds = new Set<string>();

  for (const route of routes) {
    const feed = routeFeedMap[route];
    if (feed !== undefined) {
      feeds.add(feed);
    }
  }

  return Array.from(feeds);
}

/* ---------------- Main ---------------- */

function main() {
  console.log("Preprocess script starting...");
  const stationRows = parseCSV(stationsPath) as StationRow[];
  const stopRows = parseCSV(stopsPath) as StopRow[];

  const stations: Record<
    string,
    { stopName: string; displayName: string; stopIds: string[]; feeds: string[] }
  > = {};

  const stops: Record<
    string,
    { name: string; borough: string }
  > = {};

  // Build stop lookup (only actual stations, not entrances)
  const stopLookup: Record<string, StopRow> = {};
  for (const stop of stopRows) {
    if (stop.location_type === "1" || stop.location_type === "") {
      stopLookup[stop.stop_id] = stop;
    }
  }

  for (const row of stationRows) {
    const stationId = row["Complex ID"];
    const stationStopName = row["Stop Name"];
    const stationDisplayName = row["Display Name"];
    const stopIdsRaw = row["GTFS Stop IDs"];
    const borough = row["Borough"];
    const routes = row["Daytime Routes"];

    if (!stationId || !stopIdsRaw) continue;

    const stopIds = stopIdsRaw
      .split(";")
      .map((s) => s.trim())
      .filter(Boolean);

    stations[stationId] = {
      stopName: stationStopName,
      displayName: stationDisplayName,
      stopIds,
      feeds: routesToFeeds(routes),
    };

    for (const stopId of stopIds) {
      const stop = stopLookup[stopId];

      stops[stopId] = {
        name: stop?.stop_name ?? stationStopName,
        borough,
      };
    }
  }

  fs.writeFileSync(
    stationsOutputPath,
    JSON.stringify(stations, null, 2)
  );

  fs.writeFileSync(
    stopsOutputPath,
    JSON.stringify(stops, null, 2)
  );

  console.log("Preprocessing complete.");
}

main();