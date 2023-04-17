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
  const [osmnxdis, setOsmnxdis] = useState(0);
  const [startdate, setStartDate] = useState();
  const [enddate, setEndDate] = useState();
  const [distance, setDistance] = useState(0);
  const [evrange, setEvrange] = useState();
  const [num, setNum] = useState();
  const [loading, setLoading] = useState(false);

  const handleStartDate = (e) => {
    setStartDate(e.target.value);
  };
  const handleEndDate = (e) => {
    setEndDate(e.target.value);
  };

  const pfloat = (coords) => {
    return [parseFloat(coords[0]), parseFloat(coords[1])];
  };
  const coordsToString = (coords) => {
    return coords[0].toString() + " " + coords[1].toString();
  }
  const getHeatmapData = () => {
    setLoading(true);
    fetch(
      `http://localhost:6001/getHeatmapData?start=${startdate}&end=${enddate}`
    )
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        const osmnxnodesTemp = osmnxnodes.map(o => coordsToString(o));
        data = data.filter(d => osmnxnodesTemp.includes(coordsToString(d.coordinates)));
        console.log('filtered', data);
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
        setLoading(false);
      })
      .catch((err) => {
        console.log(err.message);
        setLoading(false);
      });
  };
  const getOsmnxGraphNodes = () => {
    setLoading(true);
    fetch(
      `http://localhost:6001/getOsmnxGraphNodes?lat=${lat}&lon=${long}&dis=${osmnxdis}`
    )
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        setOsmnxnodes(data);
      })
      .catch((err) => {
        console.log(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  };
  const getExistingCS = () => {};

  const postPlacementRequest = async () => {
    try {
      setLoading(true);
      const docRef = await addDoc(collection(db, "placementRequests"), {
        lat: parseFloat(lat),
        long: parseFloat(long),
        dis: parseInt(distance),
        evrange: parseInt(evrange),
        num: parseInt(num),
        completed: false,
        invalid: false,
        result: [],
        date: (new Date()).getTime(),
      });
      // console.log('doc saved ', docRef.id)
      alert("Saved to DB! Doc Ref ID: ");
      setLoading(false);
    } catch (e) {
      alert(
        "Something went wrong! Could not save to database. Check console for error."
      );
      console.error("Error in saving to firebase: ", e);
      setLoading(false);
    }
  };
  return (
    <div className="dataContainer">
      {loading && (
        <Spinner
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            zIndex: "20",
          }}
        />
      )}
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
        <label htmlFor="dis">
          <h6>Distance from center coords</h6>
        </label>
        <input
          style={{ margin: "1px", height: "20px" }}
          type="number"
          id="dis"
          value={osmnxdis}
          onChange={(e) => setOsmnxdis(e.target.value)}
        />
        <br />
        <button style={{ margin: "5px" }} onClick={getOsmnxGraphNodes}>
          Show OSMNX nodes
        </button>
        {osmnxnodes.length > 0 && (
          <button style={{ margin: "5px" }} onClick={() => setOsmnxnodes([])}>
            Reset OSMNX nodes
          </button>
        )}
        <label htmlFor="startdate">Start Date</label>
        <input
          style={{ margin: "1px", height: "20px" }}
          type="date"
          id="startdate"
          value={startdate}
          onChange={handleStartDate}
        />
        <br />
        <label htmlFor="enddate">End Date</label>
        <input
          style={{ margin: "1px", height: "20px" }}
          type="date"
          id="enddate"
          value={enddate}
          onChange={handleEndDate}
        />
        <br />
        <button
          style={{ margin: "5px" }}
          onClick={getHeatmapData}
          disabled={!startdate || !enddate}
        >
          Get Heatmap
        </button>
        <br />
        <br />
        {/* <button style={{ margin: "5px" }} onClick={getExistingCS}>
          Show Existing EVCS
        </button>
        <br />
        <br /> */}
        {/* <button style={{ margin: "5px" }} onClick={getOsmnxGraphNodes}>
          Show OSMNX nodes
        </button>
        <button style={{ margin: "5px" }} onClick={() => setOsmnxnodes([])}>
          Reset OSMNX nodes
        </button> */}
        <label htmlFor="distance">Distance</label>
        <input
          style={{ margin: "1px", height: "20px" }}
          type="number"
          id="distance"
          value={distance}
          onChange={(e) => setDistance(e.target.value)}
        />
        <label htmlFor="evrange">EV Range</label>
        <input
          style={{ margin: "1px", height: "20px" }}
          type="number"
          id="evrange"
          value={evrange}
          onChange={(e) => setEvrange(e.target.value)}
        />
        <label htmlFor="numevcs">Number of EVCS</label>
        <input
          style={{ margin: "1px", height: "20px" }}
          type="number"
          id="numevcs"
          value={num}
          onChange={(e) => setNum(e.target.value)}
        />
        <button style={{ margin: "5px" }} onClick={postPlacementRequest} style={{margin: '10px'}}>
          Submit Placement Request
        </button>
      </div>
    </div>
  );
}

export default Visualize;
