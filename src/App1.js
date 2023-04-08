import Map, { GeolocateControl, NavigationControl } from "react-map-gl";
import { useState } from "react";

function App() {
  const [viewState, setViewState] = useState({
    longitude: -100,
    latitude: 40,
    zoom: 5,
  })
  return (
    <div className="mapContainer">
      <Map
        {...viewState}
        mapStyle="mapbox://styles/mapbox/streets-v11"
        mapboxAccessToken={process.env.REACT_APP_MAPBOX_TOKEN}
        onMove={e => setViewState(e.viewState)}
        onClick={e => console.log(e)}
      >
        <GeolocateControl />
        <NavigationControl />
      </Map>
    </div>
  );
}

export default App;
