import { BrowserRouter, Routes, Route } from "react-router-dom"

import Home from './pages/Home'
import NotFound from './pages/NotFound'
import StationBoard from "./pages/StationBoard";

import './app.css'

function App() {
  return (
    <BrowserRouter>
      <Routes>
      <Route path="/" element={<Home/>} />
      <Route path="/station/:stationId" element={<StationBoard/>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
