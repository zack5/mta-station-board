export function formatArrivalTime(unixTimestamp: number | Long): string {
  const date = new Date(Number(unixTimestamp) * 1000);
  return date.toLocaleTimeString([], { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  });
}
  