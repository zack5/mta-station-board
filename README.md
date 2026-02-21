# MTA Station Board
Replicates the charm of an MTA subway arrival board in the comfort of your own home.

## Data Sources
- data/raw/MTA_Subway_Stations_and_Complexes.csv - https://catalog.data.gov/dataset/mta-subway-stations-and-complexes
- data/raw/stops.txt - https://www.mta.info/developers (Regular GTFS)
Run  `npm run preprocess` to regenerate src/generated/complexes.json and src/generated/stations.json

## Running Locally
`npx netlify dev`