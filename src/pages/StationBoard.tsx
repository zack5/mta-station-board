import Clock from "../components/Clock";
import ArrivalPanel from "../components/ArrivalPanel";

export default function StationBoard() {
  return (
    <div className="station-board"> 
      <header className="station-board-header">
        <h1>Metropolitain Av/Lorimer St</h1>
        <Clock/>
      </header>
      <main>
        <div className="arrivals-panel-list">
          <ArrivalPanel 
            line="G" 
            terminus="Court Sq" 
            borough="Queens" 
            arrivalTime="5" 
          />
          <ArrivalPanel 
            line="L" 
            terminus="8th Av" 
            borough="Manhattan" 
            arrivalTime="12" 
          />
        </div>
      </main>
    </div>
  );
}
