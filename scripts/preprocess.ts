import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { parse } from "csv-parse/sync";

// ESM-safe __dirname replacement
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

type ComplexRow = {
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

const complexesPath = path.join(
  ROOT,
  "data/raw/MTA_Subway_Stations_and_Complexes.csv"
);

const stopsPath = path.join(ROOT, "data/raw/stops.txt");

const complexesOutputPath = path.join(ROOT, "src/generated/complexes.json");
const stationsOutputPath = path.join(ROOT, "src/generated/stations.json");

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

  N: "-nrqw",
  Q: "-nrqw",
  R: "-nrqw",
  W: "-nrqw",

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
  const complexRows = parseCSV(complexesPath) as ComplexRow[];
  const stopRows = parseCSV(stopsPath) as StopRow[];

  const complexes: Record<
    string,
    { name: string; stationIds: string[]; feeds: string[] }
  > = {};

  const stations: Record<
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

  for (const row of complexRows) {
    const complexId = row["Complex ID"];
    const complexName = row["Stop Name"];
    const stationIdsRaw = row["GTFS Stop IDs"];
    const borough = row["Borough"];
    const routes = row["Daytime Routes"];

    if (!complexId || !stationIdsRaw) continue;

    const stationIds = stationIdsRaw
      .split(";")
      .map((s) => s.trim())
      .filter(Boolean);

    complexes[complexId] = {
      name: complexName,
      stationIds,
      feeds: routesToFeeds(routes),
    };

    for (const stationId of stationIds) {
      const stop = stopLookup[stationId];

      stations[stationId] = {
        name: stop?.stop_name ?? complexName,
        borough,
      };
    }
  }

  fs.writeFileSync(
    complexesOutputPath,
    JSON.stringify(complexes, null, 2)
  );

  fs.writeFileSync(
    stationsOutputPath,
    JSON.stringify(stations, null, 2)
  );

  console.log("Preprocessing complete.");
}

main();