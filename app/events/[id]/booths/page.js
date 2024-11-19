"use client";
import React, { useState, useEffect } from "react";
import { Container, Row, Col, Alert, Card, Button, Modal, Form, Dropdown } from "react-bootstrap";
import { useParams } from "next/navigation";
import Sidebar from "../../../components/Sidebar";
import "../../../components/Sidebar.css";

export default function BoothPage() {
  const { id } = useParams(); // Get eventId from URL parameters
  const [eventName, setEventName] = useState(""); // State to hold the event name
  const [booths, setBooths] = useState([]); // State to hold booth data
  const [error, setError] = useState(null); // State to handle any error
  const [selectedBooth, setSelectedBooth] = useState(null); // State for the selected booth
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
        setBooths(boothsData); // Set booths only once here
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
        body: JSON.stringify({ ...newBooth, status: "Occupied" }), // Default status
      });
      if (!response.ok) {
        throw new Error("Failed to add booth.");
      }
      const addedBooth = await response.json();
      setBooths((prevBooths) => [...prevBooths, addedBooth]); // Add only the new booth
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
      setBooths((prevBooths) =>
        prevBooths.filter((booth) => booth.boothId !== boothId)
      );
    } catch (err) {
      setError("Failed to delete booth.");
    }
  };

  // Handle updating booth status
  const handleUpdateStatus = async (boothId, newStatus) => {
    try {
      const response = await fetch(`/api/events/${id}/booths/${boothId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!response.ok) {
        throw new Error("Failed to update booth status.");
      }
      const updatedBooth = await response.json();
      setBooths((prevBooths) =>
        prevBooths.map((booth) =>
          booth.boothId === boothId ? { ...booth, status: updatedBooth.status } : booth
        )
      );
    } catch (err) {
      setError(err.message);
    }
  };

  // Handle selecting a booth to show details
  const handleBoothClick = (booth) => {
    setSelectedBooth(booth);
  };

  // Handle input change in the modal form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewBooth((prevBooth) => ({ ...prevBooth, [name]: value }));
  };

  return (
    <Container fluid>
      <Row>
        {/* Sidebar */}
        <Col xs={3} md={2} className="sidebar">
          <Sidebar event={{ _id: id }} />
        </Col>

        {/* Main Content */}
        <Col xs={9} md={10} className="main-content">
          <Container className="my-5">
            {error && <Alert variant="danger">{error}</Alert>} {/* Show error */}
            {!error && eventName && <h4>{eventName}: Booths</h4>}
            {!error && !eventName && <p>Loading event name...</p>}

            <Row>
              {/* Booths Grid */}
              <Col md={8}>
                <Row>
                  {booths.map((booth) => (
                    <Col md={6} key={booth.boothId}>
                      <Card
                        className="mb-3"
                        onClick={() => handleBoothClick(booth)}
                        style={{ cursor: "pointer" }}
                      >
                        <Card.Body>
                          <Card.Title>Booth {booth.boothNumber}</Card.Title>
                          <Card.Text>Status: {booth.status}</Card.Text>
                          <Card.Text>Vendor: {booth.vendorName}</Card.Text>
                          <Dropdown>
                            <Dropdown.Toggle variant="info" size="sm">
                              Update Status
                            </Dropdown.Toggle>
                            <Dropdown.Menu>
                              <Dropdown.Item
                                onClick={() => handleUpdateStatus(booth.boothId, "Occupied")}
                              >
                                Occupied
                              </Dropdown.Item>
                              <Dropdown.Item
                                onClick={() => handleUpdateStatus(booth.boothId, "Available")}
                              >
                                Available
                              </Dropdown.Item>
                              <Dropdown.Item
                                onClick={() => handleUpdateStatus(booth.boothId, "Not Checked")}
                              >
                                Not Checked
                              </Dropdown.Item>
                            </Dropdown.Menu>
                          </Dropdown>
                          <Button
                            variant="danger"
                            size="sm"
                            className="mt-2"
                            onClick={(e) => {
                              e.stopPropagation(); // Prevent selecting booth
                              handleDeleteBooth(booth.boothId);
                            }}
                          >
                            Delete
                          </Button>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))}
                  {/* Add New Booth */}
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
              </Col>

              {/* Booth Details */}
              <Col md={4}>
                {selectedBooth ? (
                  <Card>
                    <Card.Body>
                      <Card.Title>Booth Details</Card.Title>
                      <Card.Text>
                        <strong>Booth Number:</strong> {selectedBooth.boothNumber}
                        <br />
                        <strong>Booth Name:</strong> {selectedBooth.boothName || "N/A"}
                        <br />
                        <strong>Vendor Name:</strong> {selectedBooth.vendorName}
                        <br />
                        <strong>Status:</strong> {selectedBooth.status}
                        <br />
                        <strong>Registered On:</strong>{" "}
                        {new Date(selectedBooth.registerationTime).toLocaleString()}
                      </Card.Text>
                    </Card.Body>
                  </Card>
                ) : (
                  <p>Select a booth to view details.</p>
                )}
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
