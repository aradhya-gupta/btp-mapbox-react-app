import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { db } from "../firebase";
import { addDoc, collection } from "firebase/firestore";
import Map, {
  GeolocateControl,
  NavigationControl,
  Marker,
  Popup,
} from "react-map-gl";
// import DeckGL from "@deck.gl/react";
import { HeatmapLayer } from "@deck.gl/aggregation-layers";

import { MapboxOverlay, MapboxOverlayProps } from "@deck.gl/mapbox/typed";
import { useControl } from "react-map-gl";

import Coords from "../components/Coords";
import { ReactComponent as Spinner } from "../components/spinner.svg";

function DeckGLOverlay(props) {
  const overlay = useControl(() => new MapboxOverlay(props));
  overlay.setProps(props);
  return null;
}

function Placed() {
  const { state } = useLocation();
  const { lat, long } = state;
  // console.log("lat", lat, "long", long);
  const [viewState, setViewState] = useState({
    longitude: long,
    latitude: lat,
    zoom: 14,
  });

  return (
    <div className="dataContainer">
      <div className="mapContainer">
        <Map
          {...viewState}
          mapStyle="mapbox://styles/mapbox/streets-v11"
          mapboxAccessToken={process.env.REACT_APP_MAPBOX_TOKEN}
          onMove={(e) => setViewState(e.viewState)}
        >
          {[
            [84.8606017, 25.5335549],
            [84.8665496, 25.5552617],
            [84.8679807, 25.5557785],
            [84.8640487, 25.5532903],
          ].map((m) => (
            <Marker
              longitude={m[0]}
              latitude={m[1]}
              draggable
              style={{ zIndex: 10 }}
            />
          ))}
          <GeolocateControl />
          <NavigationControl />
        </Map>
      </div>
      <div className="sidebar"></div>
    </div>
  );
}

export default Placed;
