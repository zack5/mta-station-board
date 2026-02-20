import { transit_realtime } from "../generated/mta-gtfs";

export async function decodeGtfs(buffer: ArrayBuffer) {
  const feed = transit_realtime.FeedMessage.decode(new Uint8Array(buffer));
  return feed;
}
