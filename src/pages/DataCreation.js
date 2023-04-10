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

function DeckGLOverlay(props) {
  const overlay = useControl(() => new MapboxOverlay(props));
  overlay.setProps(props);
  return null;
}

function DataCreation() {
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
  const [stops, setStops] = useState([]);
  const [clickedPoint, setClickedPoint] = useState([]);
  const [time, setTime] = useState(0);
  const [date, setDate] = useState();

  const handleSingleClick = (e) => {
    setClickedPoint([e.lngLat.lng, e.lngLat.lat]);
    if (!sourceSelected) {
      setSourceSelected(true);
      setSource([e.lngLat.lng, e.lngLat.lat]);
    }
  };

  const handleDoubleClick = (e) => {
    if (!destinationSelected) {
      setDestinationSelected(true);
      setDestination([e.lngLat.lng, e.lngLat.lat]);
    }
  };

  const handleTimeChange = (e) => {
    setTime(e.target.value);
  };

  const handleAddStop = () => {
    let s = stops;
    s.push({ long: clickedPoint[0], lat: clickedPoint[1], time: time });
    setStops(s);
    console.log("stops=", s);
  };

  const handleResetSource = () => {
    setSourceSelected(false);
    setSource([]);
    setPathData({});
    setPathLayers([]);
    setStops([]);
  };

  const handleResetDestination = () => {
    setDestinationSelected(false);
    setDestination([]);
    setPathData({});
    setPathLayers([]);
    setStops([]);
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
        stops: stops,
        date: date,
      });
      // console.log('doc saved ', docRef.id)
      alert("Saved to DB! Doc Ref ID: ", docRef.id);
    } catch (e) {
      alert(
        "Something went wrong! Could not save to database. Check console for error."
      );
      console.error("Error in saving to firebase: ", e);
    }
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

  const layer = new PathLayer({
    id: "path-layer",
    data: [
      {
        path: [
          // [-122.4553747547111, 37.764155520556],
          // [-122.45258646416525, 37.76454507582],
          // [-122.45229782240536,37.76644180742],
          [-84.518262, 39.133845],
          [-84.51911, 39.133559],
          [-84.520228, 39.133649],
          [-84.520036, 39.135327],
          [-84.520779, 39.135547],
          [-84.524316, 39.139366],
          [-84.525886, 39.140131],
          [-84.528636, 39.139672],
          [-84.531766, 39.140071],
          [-84.534722, 39.13817],
          [-84.535613, 39.138262],
          [-84.535593, 39.138844],
          [-84.535085, 39.138969],
          [-84.534666, 39.138687],
          [-84.533018, 39.134723],
          [-84.532707, 39.13265],
          [-84.533047, 39.130707],
          [-84.535246, 39.125716],
          [-84.535575, 39.119826],
          [-84.531637, 39.113409],
          [-84.531731, 39.10864],
          [-84.531276, 39.106902],
          [-84.530066, 39.105377],
          [-84.527969, 39.104207],
          [-84.525251, 39.102547],
          [-84.524039, 39.102287],
          [-84.512007, 39.103933],
          [-84.511692, 39.102682],
          [-84.511987, 39.102638],
        ],
        name: "Richmond - Millbrae",
        color: [225, 100, 0],
      },
      {
        path: [
          [-84.524039, 39.102287],
          [-84.512007, 39.103933],
          [-84.511692, 39.102682],
          [-84.511987, 39.102658],
        ],
        name: "Richmond - Millbrae",
        color: [100, 100, 20],
      },
    ],
    pickable: true,
    widthScale: 1,
    widthMinPixels: 1,
    getPath: (d) => d.path,
    // getColor: (d) => colorToRGBArray(d.color),
    getWidth: (d) => 5,
  });

  return (
    <div className="dataContainer">
      <div className="mapContainer">
        {console.log("source = ", source, "\ndest = ", destination)}
        <Map
          {...viewState}
          mapStyle="mapbox://styles/mapbox/streets-v11"
          mapboxAccessToken={process.env.REACT_APP_MAPBOX_TOKEN}
          onMove={(e) => setViewState(e.viewState)}
          onClick={handleSingleClick}
          onContextMenu={handleDoubleClick}
        >
          {sourceSelected && (
            <Marker
              longitude={source[0]}
              latitude={source[1]}
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
          {stops &&
            stops.map((s) => (
              <Popup
                longitude={s.long}
                latitude={s.lat}
                closeOnClick={false}
                style={{ zIndex: 5 }}
              >
                time spent = {s.time} min
              </Popup>
            ))}
        </Map>
      </div>
      <div className="sidebar">
        <Coords
          clickedPoint={clickedPoint}
          showTime
          title="Point Clicked"
          time={time}
          onTimeChange={handleTimeChange}
          handleAddStop={handleAddStop}
        />
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
              <label htmlFor="date"><h6>Date</h6></label>
              <input
                style={{ margin: "1px", height: "20px" }}
                type="date"
                id="date"
                value={date}
                onChange={handleDate}
              />
              <br />
              <button onClick={handleSaveToDB}>
                Save
              </button>
            </>
          )}
      </div>
    </div>
  );
}

export default DataCreation;
