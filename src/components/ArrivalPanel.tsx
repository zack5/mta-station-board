interface ArrivalPanelProps {
    line: string;        // e.g., "G"
    terminus: string;    // e.g., "Court Sq"
    borough: string;     // e.g., "Queens"
    arrivalTime: string; // e.g., "5"
  }
  
  export default function ArrivalPanel({ 
    line, 
    terminus, 
    borough, 
    arrivalTime 
  }: ArrivalPanelProps) {
    return (
      <div className="arrival-panel-outer">
        <img 
          src={`/src/assets/${line.toLowerCase()}.svg`} 
          className="arrival-panel-train-logo" 
          alt={`${line} train`}
        />
        <div className="arrival-panel-destination">
          <h2>{terminus}</h2>
          <p>{borough}</p>
        </div>
        <div className="arrival-panel-arrival-time">
          <h1>{arrivalTime}</h1>
          <p>MIN</p>
        </div>
      </div>
    );
  }
  