import { useState, useEffect } from "react";
import Clock from "../components/Clock";
import ArrivalPanelStack from "../components/ArrivalPanelStack";

// Define your snapshots
const SNAPSHOTS = [
  {
    G: { "G1": 1, "G2": 2, "G3": 3 },
    L: { "L0": 0, "L1": 2, "L2": 6 }
  },
  {
    G: { "G2": 2, "G3": 3, "G4": 4 },
    L: { "L0": 0, "L1": 2, "L2": 6 }
  },
  {
    G: { "G3": 3, "G4": 4, "G5": 5 },
    L: { "L0": 0, "L1": 2, "L2": 6 }
  },
  {
    G: { "G4": 4, "G5": 5, "G6": 6 },
    L: { "L0": 0, "L1": 2, "L2": 6 }
  }
];

export default function StationBoard() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setStep((prev) => (prev + 1) % SNAPSHOTS.length);
    }, 3000); // Cycle every 3 seconds

    return () => clearInterval(timer);
  }, []);

  const currentData = SNAPSHOTS[step];

  return (
    <div className="station-board"> 
      <header className="station-board-header">
        <h1>Metropolitan Av / Lorimer St</h1>
        <Clock />
      </header>
      <main>
        <div className="arrivals-panel-list">
          <ArrivalPanelStack
            line="G" 
            terminus="Court Sq" 
            borough="Queens" 
            arrivalTimes={currentData.G}
          />
          <ArrivalPanelStack 
            line="L" 
            terminus="8th Av" 
            borough="Manhattan" 
            arrivalTimes={currentData.L}
          />
        </div>
      </main>
    </div>
  );
}
