import React, { useState } from "react";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Modal from "react-bootstrap/Modal";
import Row from "react-bootstrap/Row";
import { Link } from "react-router-dom";
import { ReactComponent as Spinner } from "../components/spinner.svg";
import { db } from "../firebase";
import {
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  updateDoc,
} from "firebase/firestore";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [modalShow, setModalShow] = useState(false);
  const [requests, setRequests] = useState([]);
  const [processing, setProcessing] = useState({});

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

  const handleShowRequests = async () => {
    try {
      setLoading(true);
      await getDocs(
        query(collection(db, "placementRequests"), orderBy("date"))
      ).then((snapshot) => {
        const r = snapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }));
        setRequests(r);
        let p = {};
        r.forEach((d) => {
          p[d.id] = d.processing;
        });
        setProcessing(p);
        console.log(r, p);
      });
      // snapshot.forEach((doc) => console.log(doc));
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
      setModalShow(true);
    }
  };

  const handleProcessClick = async (id, long, lat, dis, evrange, num) => {
    // set processing to true for doc with id
    const docRef = await doc(db, "placementRequests", id);
    updateDoc(docRef, {
      processing: true,
    })
      .then((d) => console.log("updated ", d))
      .catch((er) => console.log(er));
    let p = processing;
    p[id] = true;
    setProcessing(p);
    setModalShow(false);
    fetch(
      `http://localhost:6001/getPlacement?lat=${lat}&lon=${long}&dis=${dis}&evrange=${evrange}&num=${num}`
    )
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
      })
      .catch((err) => {
        console.log(err.message);
      })
      .finally(() => {
      });
    // console.log(processing);
  };

  return (
    <div className="homeContainer">
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
      <Modal
        show={modalShow}
        onHide={() => setModalShow(false)}
        aria-labelledby="contained-modal-title-vcenter"
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-vcenter">
            Placement Requests
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="show-grid">
          <Container>
            <Row>
              <Col>
                <b>Date</b>
              </Col>
              <Col>
                <b>Coords</b>
              </Col>
              <Col>
                <b>Distance</b>
              </Col>
              <Col>
                <b>EV Range</b>
              </Col>
              <Col>
                <b>Number</b>
              </Col>
              <Col>
                <b>Status</b>
              </Col>
            </Row>
            {requests.map((r) => (
              <Row
                className="request-row"
                style={{ border: "1px solid grey", margin: "3px" }}
                key={r.id}
              >
                <Col>{new Date(r.date).toLocaleDateString("en-GB")}</Col>
                <Col>
                  {r.lat} {r.long}
                </Col>
                <Col>{r.dis}</Col>
                <Col>{r.evrange}</Col>
                <Col>{r.num}</Col>
                <Col>
                  {r.invalid && "Invalid"}
                  {r.completed && (
                    <Button variant="secondary">
                    <Link
                      to="/placed"
                      state={{ lat: '25.5357', long: '84.8512' }}
                      style={{ color: "#FFF", zIndex: "40"  }}
                    >
                      Show
                    </Link>
                  </Button>
                  )}
                  {!r.invalid && !r.completed && !processing[r.id] && (
                    <Button
                      variant="secondary"
                      size="sm"
                      style={{ margin: "1px" }}
                      onClick={() =>
                        handleProcessClick(
                          r.id,
                          r.long,
                          r.lat,
                          r.dis,
                          r.evrange,
                          r.num
                        )
                      }
                    >
                      Process
                    </Button>
                  )}
                  {!r.invalid && !r.completed && processing[r.id] && (
                    <Spinner style={{ margin: "auto" }} />
                  )}
                </Col>
              </Row>
            ))}
          </Container>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={() => setModalShow(false)}>Close</Button>
        </Modal.Footer>
      </Modal>
      <Card border="secondary" className="homeCard">
        {/* <Card.Img variant="top" src="holder.js/100px180" /> */}
        <Card.Body>
          <Card.Title>Create Data</Card.Title>
          <Card.Text>
            Add paths visited as a set of origin-destination points along with
            time spent at the destination.
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
            <Link
              to="/create"
              state={{ lat: lat, long: long }}
              style={{ color: "#FFF" }}
            >
              Go To Map
            </Link>
          </Button>
        </Card.Body>
      </Card>
      <Card border="secondary" className="homeCard">
        {/* <Card.Img variant="top" src="holder.js/100px180" /> */}
        <Card.Body>
          <Card.Title>See Placements</Card.Title>
          <Card.Text>
            Check the completed charging stations placement requests.
            <br />
          </Card.Text>
          <Button variant="secondary" onClick={handleShowRequests}>
            List of requests
          </Button>
        </Card.Body>
      </Card>
      <Card border="secondary" className="homeCard">
        {/* <Card.Img variant="top" src="holder.js/100px180" /> */}
        <Card.Body>
          <Card.Title>Visualize Data</Card.Title>
          <Card.Text>
            Identify hotspots of EV traffic in the given area and submit a
            placement request.
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
            <Link
              to="/visualize"
              state={{ lat: lat1, long: long1 }}
              style={{ color: "#FFF" }}
            >
              Place EVCs
            </Link>
          </Button>
        </Card.Body>
      </Card>
    </div>
  );
}
