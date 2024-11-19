"use client";
import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Alert,
  Card,
  Button,
  Modal,
  Form,
  Dropdown,
} from "react-bootstrap";
import { useParams, useRouter } from "next/navigation";
import Sidebar from "../../../components/Sidebar";
import "../../../components/Sidebar.css";

export default function BoothPage() {
  const { id } = useParams(); // Get eventId from URL parameters
  const router = useRouter();
  const [eventName, setEventName] = useState(""); // State to hold the event name
  const [eventsList, setEventsList] = useState([]);
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
    status: "Available", // Default status
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

  useEffect(() => {
    const fetchEventsList = async () => {
      try {
        const response = await fetch("/api/events");
        if (!response.ok) {
          throw new Error("Failed to fetch events list.");
        }
        const data = await response.json();
        setEventsList(data);
        console.log("Fetched events:", data); // Log the fetched events
      } catch (err) {
        setError(err.message);
      }
    };
  
    fetchEventsList();
  }, []);

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
      setFormBooth({ boothNumber: "", boothName: "", vendorName: "", status: "Available" });
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

      if (selectedBooth?.boothId === boothId) {
        setSelectedBooth((prev) => ({ ...prev, status: updatedBooth.status }));
      }
    } catch (err) {
      setError(err.message);
    }
  };

  // Handle selecting a booth to show details
  const handleBoothClick = (booth) => {
    setSelectedBooth(booth);
  };

  // Handle selecting a booth for editing
  const handleEditBooth = (booth) => {
    setEditMode(true);
    setCurrentBooth(booth);
    setFormBooth({
      boothNumber: booth.boothNumber,
      boothName: booth.boothName,
      vendorName: booth.vendorName,
      status: booth.status,
    });
    setShowModal(true);
  };

  // Handle input change in the modal form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormBooth((prevBooth) => ({ ...prevBooth, [name]: value }));
  };

  const handleEventChange = (id) => {
    router.push(`/events/${id}/booths`);
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
            <Dropdown className="mb-4" style={{ textAlign: "right" }}>
              <Dropdown.Toggle variant="secondary" id="dropdown-basic">
                Select Event
              </Dropdown.Toggle>
              <Dropdown.Menu>
                {eventsList.length > 0 ? (
                  eventsList.map((event) => (
                    <Dropdown.Item key={event._id} onClick={() => handleEventChange(event._id)}>
                      {event.eventName}
                    </Dropdown.Item>
                  ))
                ) : (
                  <Dropdown.Item disabled>No events found</Dropdown.Item>
                )}
              </Dropdown.Menu>
            </Dropdown>
            <Row>
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
                              Change Status
                            </Dropdown.Toggle>
                            <Dropdown.Menu>
                              <Dropdown.Item onClick={() => handleUpdateStatus(booth.boothId, "Occupied")}>
                                Occupied
                              </Dropdown.Item>
                              <Dropdown.Item onClick={() => handleUpdateStatus(booth.boothId, "Available")}>
                                Available
                              </Dropdown.Item>
                              <Dropdown.Item onClick={() => handleUpdateStatus(booth.boothId, "Not Checked")}>
                                Not Checked
                              </Dropdown.Item>
                            </Dropdown.Menu>
                          </Dropdown>
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditBooth(booth);
                            }}
                          >
                            Edit
                          </Button>{" "}
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteBooth(booth.boothId);
                            }}
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
                      onClick={() => {
                        setEditMode(false);
                        setFormBooth({
                          boothNumber: "",
                          boothName: "",
                          vendorName: "",
                          status: "Available",
                        });
                        setShowModal(true);
                      }}
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

      {/* Add/Update Booth Modal */}
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
                placeholder="Enter booth number"
                value={formBooth.boothNumber}
                onChange={handleInputChange}
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Booth Name</Form.Label>
              <Form.Control
                type="text"
                name="boothName"
                placeholder="Enter booth name"
                value={formBooth.boothName}
                onChange={handleInputChange}
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Vendor Name</Form.Label>
              <Form.Control
                type="text"
                name="vendorName"
                placeholder="Enter vendor name"
                value={formBooth.vendorName}
                onChange={handleInputChange}
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Status</Form.Label>
              <Form.Control
                as="select"
                name="status"
                value={formBooth.status}
                onChange={handleInputChange}
              >
                <option value="Available">Available</option>
                <option value="Occupied">Occupied</option>
                <option value="Not Checked">Not Checked</option>
              </Form.Control>
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
