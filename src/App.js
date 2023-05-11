import { BrowserRouter, Routes, Route } from "react-router-dom";
import DataCreation from "./pages/DataCreation";
import DataCreationOsmnx from "./pages/DataCreationOsmnx";
import Home from "./pages/Home";
import Nothing from "./pages/Nothing";
import Visualize from "./pages/Visualize";
import Placed from "./pages/Placed";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/create" element={<DataCreationOsmnx />} />
        <Route path="/visualize" element={<Visualize />} />
        <Route path="/placed" element={<Placed />} />
        <Route path="*" element={<Nothing />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App;
