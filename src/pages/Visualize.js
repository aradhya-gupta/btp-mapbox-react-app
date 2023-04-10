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

function DeckGLOverlay(props) {
  const overlay = useControl(() => new MapboxOverlay(props));
  overlay.setProps(props);
  return null;
}

function Visualize() {
  const { state } = useLocation();
  const { lat, long } = state;
  // console.log("lat", lat, "long", long);
  const [viewState, setViewState] = useState({
    longitude: long,
    latitude: lat,
    zoom: 14,
  });
  const [heatmapLayers, setHeatmapLayers] = useState([]);
  const [osmnxnodes, setOsmnxnodes] = useState([]);

  const pfloat = (coords) => {
    return [parseFloat(coords[0]), parseFloat(coords[1])];
  };
  const getHeatmapData = () => {
    console.log("get path clicked");
    fetch(`http://localhost:6001/getHeatmapData`)
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        const layer = new HeatmapLayer({
          id: "heatmap-layer",
          data: data,
          getPosition: (d) => pfloat(d.coordinates),
          getWeight: (d) => d.weight,
          aggregation: "SUM",
          radiusPixels: 20,
          //   intensity: 10,
        });
        setHeatmapLayers([layer]);
      })
      .catch((err) => {
        console.log(err.message);
      });
  };
  const getOsmnxGraphNodes = () => {
    fetch(`http://localhost:6001/getOsmnxGraphNodes?lat=${lat}&lon=${long}`)
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        setOsmnxnodes(data);
      })
      .catch((err) => {
        console.log(err.message);
      });
  };
  useEffect(() => {
    getHeatmapData();
  }, []);
  return (
    <div className="dataContainer">
      <div className="mapContainer">
        <Map
          {...viewState}
          mapStyle="mapbox://styles/mapbox/streets-v11"
          mapboxAccessToken={process.env.REACT_APP_MAPBOX_TOKEN}
          onMove={(e) => setViewState(e.viewState)}
        >
          <DeckGLOverlay layers={heatmapLayers} />
          <GeolocateControl />
          <NavigationControl />
          {osmnxnodes &&
            osmnxnodes.map((n) => <Marker longitude={n[0]} latitude={n[1]} />)}
        </Map>
      </div>
      <div className="sidebar">
        <button onClick={getOsmnxGraphNodes}>Show OSMNX nodes</button>
        <button onClick={() => setOsmnxnodes([])}>Reset OSMNX nodes</button>
      </div>
    </div>
  );
}

export default Visualize;
