import { BrowserRouter, Routes, Route } from "react-router-dom"

import StationBoard from "./pages/StationBoard";

import './app.css'

function App() {
  return (
    <BrowserRouter>
      <Routes>
      <Route path="/station/:stationId" element={<StationBoard/>} />
      <Route path="*" element={<StationBoard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
