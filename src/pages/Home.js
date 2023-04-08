import React, { useState } from "react";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import { Link } from "react-router-dom";

export default function Home() {
  const [lat, setLat] = useState();
  const [long, setLong] = useState();
  const handleLatChange = (e) => {
    setLat(e.target.value);
  };
  const handleLongChange = (e) => {
    setLong(e.target.value);
  };
  const [lat1, setLat1] = useState();
  const [long1, setLong1] = useState();
  const handleLatChange1 = (e) => {
    setLat1(e.target.value);
  };
  const handleLongChange1 = (e) => {
    setLong1(e.target.value);
  };
  return (
    <div className="homeContainer">
      <Card border="secondary" className="homeCard">
        {/* <Card.Img variant="top" src="holder.js/100px180" /> */}
        <Card.Body>
          <Card.Title>Create Data</Card.Title>
          <Card.Text>
            Add paths visited as a set of origin-destination points along with
            time spent at various spots.
            <br />
            <input
              style={{ marginTop: "2rem" }}
              // type="number"
              value={lat}
              onChange={handleLatChange}
              placeholder="Enter latitude"
            />
            <input
              style={{ marginTop: "1rem" }}
              // type="number"
              value={long}
              onChange={handleLongChange}
              placeholder="Enter longitude"
            />
          </Card.Text>
          <Button variant="secondary" disabled={!lat || !long}>
            <Link to="/create" state={{ lat:lat, long:long }} style={{color: '#FFF'}}>
              Go To Map
            </Link>
          </Button>
        </Card.Body>
      </Card>
      <Card border="secondary" className="homeCard">
        {/* <Card.Img variant="top" src="holder.js/100px180" /> */}
        <Card.Body>
          <Card.Title>Visualize Data</Card.Title>
          <Card.Text>
            Identify hotspots of EV traffic and place charging stations.
            <br />
            <input
              style={{ marginTop: "2rem" }}
              // type="number"
              value={lat1}
              onChange={handleLatChange1}
              placeholder="Enter latitude"
            />
            <input
              style={{ marginTop: "1rem" }}
              // type="number"
              value={long1}
              onChange={handleLongChange1}
              placeholder="Enter longitude"
            />
          </Card.Text>
          <Button variant="secondary" disabled={!lat1 || !long1}>
            <Link to="/visualize" state={{ lat:lat1, long:long1 }} style={{color: '#FFF'}} >
              Place EVCs
            </Link>
          </Button>
        </Card.Body>
      </Card>
    </div>
  );
}
