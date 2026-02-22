# MTA Station Board
Replicates the charm of an MTA subway arrival board from the comfort of your own home. Demo at https://mta-station-board.netlify.app/.

## Data Sources
- data/raw/MTA_Subway_Stations_and_Complexes.csv - https://catalog.data.gov/dataset/mta-subway-stations-and-complexes
- data/raw/stops.txt - https://www.mta.info/developers (Regular GTFS)

Run  `npm run preprocess` to regenerate `src/generated/stations.json` and `src/generated/stops.json`.

## Running Locally
`npx netlify dev`
