"use client";
import React, { useState, useEffect } from "react";
import { Container, Row, Col, Alert, Card, Button, Modal, Form } from "react-bootstrap";
import { useParams } from "next/navigation";
import Sidebar from "../../../components/Sidebar";
import "../../../components/Sidebar.css";

export default function BoothPage() {
  const { id } = useParams(); // Get eventId from URL parameters
  const [eventName, setEventName] = useState(""); // State to hold the event name
  const [booths, setBooths] = useState([]); // State to hold booth data
  const [error, setError] = useState(null); // State to handle any error
  const [selectedBooth, setSelectedBooth] = useState(null); // State for the selected booth
  const [showModal, setShowModal] = useState(false); // Modal state for adding/updating booth
  const [editMode, setEditMode] = useState(false); // State to toggle between add and edit modes
  const [currentBooth, setCurrentBooth] = useState(null); // State for the booth being edited
  const [formBooth, setFormBooth] = useState({
    boothNumber: "",
    boothName: "",
    vendorName: "",
  }); // State for new/edit booth data

  // Fetch event name and booths based on eventId
  useEffect(() => {
    const fetchEventAndBooths = async () => {
      try {
        const eventResponse = await fetch(`/api/events/${id}`);
        if (!eventResponse.ok) {
          throw new Error("Failed to fetch event data.");
        }
        const event = await eventResponse.json();
        setEventName(event.eventName);

        const boothsResponse = await fetch(`/api/events/${id}/booths`);
        if (!boothsResponse.ok) {
          throw new Error("Failed to fetch booth data.");
        }
        const boothsData = await boothsResponse.json();
        setBooths(boothsData);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchEventAndBooths();
  }, [id]);

  // Handle adding or updating a booth
  const handleSaveBooth = async () => {
    try {
      const url = editMode
        ? `/api/events/${id}/booths/${currentBooth.boothId}`
        : `/api/events/${id}/booths`;
      const method = editMode ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formBooth),
      });

      if (!response.ok) {
        throw new Error(editMode ? "Failed to update booth." : "Failed to add booth.");
      }

      const booth = await response.json();

      if (editMode) {
        setBooths((prevBooths) =>
          prevBooths.map((b) => (b.boothId === booth.boothId ? booth : b))
        );
      } else {
        setBooths((prevBooths) => [...prevBooths, booth]);
      }

      setShowModal(false);
      setFormBooth({ boothNumber: "", boothName: "", vendorName: "" });
      setEditMode(false);
    } catch (err) {
      setError(err.message);
    }
  };

  // Handle deleting a booth
  const handleDeleteBooth = async (boothId) => {
    try {
      await fetch(`/api/events/${id}/booths/${boothId}`, { method: "DELETE" });
      setBooths((prevBooths) => prevBooths.filter((booth) => booth.boothId !== boothId));
    } catch (err) {
      setError("Failed to delete booth.");
    }
  };

  // Handle selecting a booth for editing
  const handleEditBooth = (booth) => {
    setEditMode(true);
    setCurrentBooth(booth);
    setFormBooth({ boothNumber: booth.boothNumber, boothName: booth.boothName, vendorName: booth.vendorName });
    setShowModal(true);
  };

  // Handle input change in the modal form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormBooth((prevBooth) => ({ ...prevBooth, [name]: value }));
  };

  return (
    <Container fluid>
      <Row>
        <Col xs={3} md={2} className="sidebar">
          <Sidebar event={{ _id: id }} />
        </Col>

        <Col xs={9} md={10} className="main-content">
          <Container className="my-5">
            {error && <Alert variant="danger">{error}</Alert>}
            {!error && eventName && <h4>{eventName}: Booths</h4>}
            <Row>
              {booths.map((booth) => (
                <Col md={6} key={booth.boothId}>
                  <Card className="mb-3">
                    <Card.Body>
                      <Card.Title>Booth {booth.boothNumber}</Card.Title>
                      <Card.Text>Status: {booth.status}</Card.Text>
                      <Card.Text>Vendor: {booth.vendorName}</Card.Text>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleEditBooth(booth)}
                      >
                        Update
                      </Button>{" "}
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDeleteBooth(booth.boothId)}
                      >
                        Delete
                      </Button>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
              <Col md={6}>
                <Card
                  className="mb-3"
                  onClick={() => setShowModal(true)}
                  style={{
                    cursor: "pointer",
                    textAlign: "center",
                    height: "100%",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Card.Body>
                    <Card.Title>Add New Booth</Card.Title>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Container>
        </Col>
      </Row>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{editMode ? "Update Booth" : "Add New Booth"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group>
              <Form.Label>Booth Number</Form.Label>
              <Form.Control
                type="text"
                name="boothNumber"
                value={formBooth.boothNumber}
                onChange={handleInputChange}
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Booth Name</Form.Label>
              <Form.Control
                type="text"
                name="boothName"
                value={formBooth.boothName}
                onChange={handleInputChange}
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Vendor Name</Form.Label>
              <Form.Control
                type="text"
                name="vendorName"
                value={formBooth.vendorName}
                onChange={handleInputChange}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={handleSaveBooth}>
            {editMode ? "Update Booth" : "Add Booth"}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}
