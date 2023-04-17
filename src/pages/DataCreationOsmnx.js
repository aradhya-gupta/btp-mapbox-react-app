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
import { PathLayer } from "@deck.gl/layers";

import { MapboxOverlay, MapboxOverlayProps } from "@deck.gl/mapbox/typed";
import { useControl } from "react-map-gl";

import Coords from "../components/Coords";
import { ReactComponent as Spinner } from "../components/spinner.svg";

function DeckGLOverlay(props) {
  const overlay = useControl(() => new MapboxOverlay(props));
  overlay.setProps(props);
  return null;
}

function DataCreationOsmnx() {
  const { state } = useLocation();
  const { lat, long } = state;
  // console.log("lat", lat, "long", long);
  const [viewState, setViewState] = useState({
    longitude: long,
    latitude: lat,
    zoom: 14,
  });
  const [sourceSelected, setSourceSelected] = useState(false);
  const [source, setSource] = useState([]);
  const [destinationSelected, setDestinationSelected] = useState(false);
  const [destination, setDestination] = useState([]);
  const [pathData, setPathData] = useState({});
  const [pathLayers, setPathLayers] = useState([]);
  //   const [stops, setStops] = useState([]);
  //   const [clickedPoint, setClickedPoint] = useState([]);
  const [time, setTime] = useState(0);
  const [date, setDate] = useState();
  const [osmnxnodes, setOsmnxnodes] = useState([]);
  const [osmnxdis, setOsmnxdis] = useState(0);

  const [loading, setLoading] = useState(false);

  const handleMarkerClick = (long, lat) => {
    console.log("marker", long, lat);
    if (!sourceSelected) {
      setSourceSelected(true);
      setSource([long, lat]);
    } else if (!destinationSelected) {
      setDestinationSelected(true);
      setDestination([long, lat]);
    }
  };

  const handleTimeChange = (e) => {
    setTime(e.target.value);
  };

  //   const handleAddStop = () => {
  //     let s = stops;
  //     s.push({ long: clickedPoint[0], lat: clickedPoint[1], time: time });
  //     setStops(s);
  //     console.log("stops=", s);
  //   };

  const handleResetSource = () => {
    setSourceSelected(false);
    setSource([]);
    setPathData({});
    setPathLayers([]);
    // setStops([]);
  };

  const handleResetDestination = () => {
    setDestinationSelected(false);
    setDestination([]);
    setPathData({});
    setPathLayers([]);
    // setStops([]);
  };

  const handleDate = (e) => {
    // console.log(e.target.value);
    setDate(e.target.value);
  };
  const handleSaveToDB = async (e) => {
    e.preventDefault();
    try {
      const docRef = await addDoc(collection(db, "paths"), {
        source: source,
        destination: destination,
        // stops: stops,
        date: date,
        timeAtDestination: parseInt(time),
      });
      // console.log('doc saved ', docRef.id)
      alert("Saved to DB!");
    } catch (e) {
      alert(
        "Something went wrong! Could not save to database. Check console for error."
      );
      console.error("Error in saving to firebase: ", e);
    }
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
        setLoading(false);
      })
      .catch((err) => {
        console.log(err.message);
        setLoading(false);
      });
  };

  const getPath = () => {
    console.log("get path clicked");
    if (!sourceSelected || !destinationSelected) return;
    fetch(
      `http://localhost:6001/getPathV2?srcLong=${source[0]}&srcLat=${source[1]}&destLong=${destination[0]}&destLat=${destination[1]}`
    )
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        setPathData(data);
        const layer = new PathLayer({
          id: "path-layer",
          data: [
            {
              path: data.routes[0].geometry.coordinates,
              // name: "any name",
              color: [12, 200, 3],
            },
          ],
          pickable: true,
          widthScale: 2,
          widthMinPixels: 1,
          getPath: (d) => d.path,
          getColor: (d) => d.color,
          getWidth: (d) => 5,
        });
        setPathLayers([layer]);
      })
      .catch((err) => {
        console.log(err.message);
      });
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
        {console.log("source = ", source, "\ndest = ", destination)}
        <Map
          {...viewState}
          mapStyle="mapbox://styles/mapbox/streets-v11"
          mapboxAccessToken={process.env.REACT_APP_MAPBOX_TOKEN}
          onMove={(e) => setViewState(e.viewState)}
          //   onClick={handleSingleClick}
          //   onContextMenu={handleRightClick}
        >
          {sourceSelected && (
            <Marker
              longitude={source[0]}
              latitude={source[1]}
              color="#3fffCE"
              draggable
              onDragEnd={(e) => setSource([e.lngLat.lng, e.lngLat.lat])}
              style={{ zIndex: 10 }}
            />
          )}
          {destinationSelected && (
            <Marker
              longitude={destination[0]}
              latitude={destination[1]}
              color="#3FffCE"
              style={{ zIndex: 10 }}
              draggable
              onDragEnd={(e) => setDestination([e.lngLat.lng, e.lngLat.lat])}
            />
          )}
          <DeckGLOverlay layers={pathLayers} />
          <GeolocateControl />
          <NavigationControl />
          {osmnxnodes &&
            osmnxnodes.map((n) => (
              <Marker
                longitude={n[0]}
                latitude={n[1]}
                onClick={() => handleMarkerClick(n[0], n[1])}
              />
            ))}
          {sourceSelected && destinationSelected && (
            <div className="" style={{ zindex: 14 }}>
              <button
                onClick={getPath}
                className=""
                style={{
                  position: "absolute",
                  // zIndex: 4,
                  margin: 10,
                  // backgroundColor: "blue",
                }}
              >
                GET PATH
              </button>
            </div>
          )}
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
        {sourceSelected && (
          <>
            <Coords clickedPoint={source} title="Source" />
            <button onClick={handleResetSource}>Reset Source</button>
          </>
        )}
        {destinationSelected && (
          <>
            <Coords clickedPoint={destination} title="Destination" />
            <button onClick={handleResetDestination}>Reset Destination</button>
          </>
        )}
        {sourceSelected &&
          destinationSelected &&
          Object.keys(pathData).length > 0 && (
            <>
              {/* <input type="date" onChange={handleDate} /> */}
              <br />
              <label htmlFor="date">
                <h6>Date</h6>
              </label>
              <input
                style={{ margin: "1px", height: "20px" }}
                type="date"
                id="date"
                value={date}
                onChange={handleDate}
              />
              <br />
              <label htmlFor="time">
                <h6>Time spent at dest(in min)</h6>
              </label>
              <input
                style={{ margin: "1px" }}
                type="number"
                id="time"
                value={time}
                onChange={handleTimeChange}
              />
              <br />
              <button onClick={handleSaveToDB}>Save</button>
            </>
          )}
      </div>
    </div>
  );
}

export default DataCreationOsmnx;
