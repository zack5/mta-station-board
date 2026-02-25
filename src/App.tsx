import { BrowserRouter, Routes, Route } from "react-router-dom"

import { StationBoardProvider } from "./context/StationBoardContext";

import StationBoard from "./pages/StationBoard";

import './App.css'

function App() {
  return (
    <StationBoardProvider>
      <BrowserRouter>
        <Routes>
        <Route path="/station/:stationId" element={<StationBoard/>} />
        <Route path="*" element={<StationBoard />} />
        </Routes>
      </BrowserRouter>
    </StationBoardProvider>
  );
}

export default App;
