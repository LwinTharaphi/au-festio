"use client";
import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Container, Row, Col, Alert, Card, Button, Modal, Form } from "react-bootstrap";
import Sidebar from "../../../components/Sidebar";
import "../../../components/Sidebar.css";

export default function BoothPage() {
  const { id } = useParams(); // Get eventId from URL parameters
  const [eventName, setEventName] = useState(""); // State to hold the event name
  const [booths, setBooths] = useState([]); // State to hold booth data
  const [error, setError] = useState(null); // State to handle any error
  const [showModal, setShowModal] = useState(false); // Modal state
  const [newBooth, setNewBooth] = useState({
    boothId: "",
    boothNumber: "",
    boothName: "",
    vendorName: "",
  }); // State for new booth data

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

  // Handle adding a new booth
  const handleAddBooth = async () => {
    try {
      const response = await fetch(`/api/events/${id}/booths`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newBooth),
      });
      if (!response.ok) {
        throw new Error("Failed to add booth.");
      }
      const addedBooth = await response.json();
      setBooths((prevBooths) => [...prevBooths, addedBooth]);
      setShowModal(false);
      setNewBooth({
        boothId: "",
        boothNumber: "",
        boothName: "",
        vendorName: "",
      });
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

  // Handle input change in the modal form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewBooth((prevBooth) => ({ ...prevBooth, [name]: value }));
  };

  return (
    <Container fluid>
      <Row>
        <Col xs={3} md={2} className="sidebar">
          <Sidebar /> {/* Sidebar component */}
        </Col>
        <Col xs={9} md={10} className="main-content">
          <Container className="my-5">
            {error && <Alert variant="danger">{error}</Alert>} {/* Show error if any */}
            {!error && eventName && <h4>Booths for Event: {eventName}</h4>}
            {!error && !eventName && <p>Loading event name...</p>} {/* Show loading state */}

            {/* Booth Cards */}
            <Row>
              {booths.map((booth) => (
                <Col md={4} key={booth.boothId}>
                  <Card className="mb-3">
                    <Card.Body>
                      <Card.Title>{booth.boothNumber}</Card.Title>
                      <Card.Text>Status: {booth.status}</Card.Text>
                      <Card.Text>Vendor: {booth.vendorName}</Card.Text>
                      <Button
                        variant="danger"
                        onClick={() => handleDeleteBooth(booth.boothId)}
                      >
                        Delete
                      </Button>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
              {/* Add New Booth Card */}
              <Col md={4}>
                <Card className="mb-3" onClick={() => setShowModal(true)} style={{ cursor: "pointer" }}>
                  <Card.Body>
                    <Card.Title>Add New Booth</Card.Title>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Container>
        </Col>
      </Row>

      {/* Add Booth Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add New Booth</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group>
              <Form.Label>Booth ID</Form.Label>
              <Form.Control
                type="text"
                name="boothId"
                placeholder="Enter booth ID"
                value={newBooth.boothId}
                onChange={handleInputChange}
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Booth Number</Form.Label>
              <Form.Control
                type="text"
                name="boothNumber"
                placeholder="Enter booth number"
                value={newBooth.boothNumber}
                onChange={handleInputChange}
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Booth Name</Form.Label>
              <Form.Control
                type="text"
                name="boothName"
                placeholder="Enter booth name"
                value={newBooth.boothName}
                onChange={handleInputChange}
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Vendor Name</Form.Label>
              <Form.Control
                type="text"
                name="vendorName"
                placeholder="Enter vendor name"
                value={newBooth.vendorName}
                onChange={handleInputChange}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={handleAddBooth}>
            Add Booth
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}
