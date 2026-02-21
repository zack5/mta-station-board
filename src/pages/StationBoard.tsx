import Clock from "../components/Clock";
import ArrivalPanelStack from "../components/ArrivalPanelStack";

export default function StationBoard() {
  return (
    <div className="station-board"> 
      <header className="station-board-header">
        <h1>Metropolitain Av/Lorimer St</h1>
        <Clock/>
      </header>
      <main>
        <div className="arrivals-panel-list">
          <ArrivalPanelStack
            line="G" 
            terminus="Court Sq" 
            borough="Queens" 
            arrivalTimes={{ "id1": 2, "id2": 8, "id3": 23 }}
          />
          <ArrivalPanelStack 
            line="L" 
            terminus="8th Av" 
            borough="Manhattan" 
            arrivalTimes={{ "id1": 1, "id2": 3 }}
          />
        </div>
      </main>
    </div>
  );
}
