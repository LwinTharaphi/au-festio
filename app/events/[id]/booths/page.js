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
  Spinner,
} from "react-bootstrap";
import { useParams, useRouter } from "next/navigation";
import Sidebar from "../../../components/Sidebar";
import "../../../components/Sidebar.css";
import { useSession } from "next-auth/react";

export default function BoothPage() {
  const { data: session, status } = useSession();
  const { id } = useParams(); // Get eventId from URL parameters
  const router = useRouter();
  const [eventName, setEventName] = useState(""); // State to hold the event name
  const [eventsList, setEventsList] = useState([]);
  const [booths, setBooths] = useState([]); // State to hold booth data
  const [error, setError] = useState(null); // State to handle any error
  const [loading, setLoading] = useState(false);
  const [selectedBooth, setSelectedBooth] = useState(null); // State for the selected booth
  const [showModal, setShowModal] = useState(false); // Modal state for adding/updating booth
  const [editMode, setEditMode] = useState(false); // State to toggle between add and edit modes
  const [currentBooth, setCurrentBooth] = useState(null); // State for the booth being edited
  const [formBooth, setFormBooth] = useState({
    boothNumber: "",
    boothName: "",
    vendorName: "",
    image: null, // New field for image file
  }); // State for new/edit booth data
  const [searchQuery, setSearchQuery] = useState(""); // State for search query

  // Fetch event name and booths based on eventId
  useEffect(() => {
    if (status === "loading") return; // Don't redirect while loading
    if (status === "unauthenticated" || session?.user?.role !== "organizer") {
      router.push("/");
    }
    if (status === "authenticated" && session?.user?.role === "organizer") {
      const fetchEventAndBooths = async () => {
        try {
          setLoading(true);
          const eventResponse = await fetch(`/api/events/${id}`);
          if (!eventResponse.ok) throw new Error("Failed to fetch event data.");
          const event = await eventResponse.json();
          setEventName(event.eventName);

          const boothsResponse = await fetch(`/api/events/${id}/booths`);
          if (!boothsResponse.ok) throw new Error("Failed to fetch booth data.");
          const boothsData = await boothsResponse.json();
          setBooths(boothsData);
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };

      const fetchEventsList = async () => {
        try {
          const response = await fetch("/api/events");
          if (!response.ok) throw new Error("Failed to fetch events list.");
          const data = await response.json();
          setEventsList(data);
        } catch (err) {
          setError(err.message);
        }
      };

      fetchEventsList();
      fetchEventAndBooths();
    }
  }, [id, router, session, status]);
  const handleSaveBooth = async () => {
    try {
      const url = editMode
        ? `/api/events/${id}/booths/${currentBooth.boothId}`
        : `/api/events/${id}/booths`;
      const method = editMode ? "PUT" : "POST";

      const formData = new FormData();
      formData.append("boothNumber", formBooth.boothNumber);
      formData.append("boothName", formBooth.boothName);
      formData.append("vendorName", formBooth.vendorName);
      if (formBooth.image) {
        formData.append("image", formBooth.image); // Attach the image
      }

      const response = await fetch(url, { method, body: formData });

      if (!response.ok) throw new Error(editMode ? "Failed to update booth." : "Failed to add booth.");

      const booth = await response.json();

      if (editMode) {
        setBooths((prevBooths) =>
          prevBooths.map((b) => (b.boothId === booth.boothId ? booth : b))
        );
      } else {
        setBooths((prevBooths) => [...prevBooths, booth]);
      }

      setShowModal(false);
      setFormBooth({ boothNumber: "", boothName: "", vendorName: "", image: null });
      setEditMode(false);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteBooth = async (boothId) => {
    try {
      await fetch(`/api/events/${id}/booths/${boothId}`, { method: "DELETE" });
      setBooths((prevBooths) => prevBooths.filter((booth) => booth.boothId !== boothId));
    } catch (err) {
      setError("Failed to delete booth.");
    }
  };

  const handleEditBooth = (booth) => {
    setEditMode(true);
    setCurrentBooth(booth);
    setFormBooth({
      boothNumber: booth.boothNumber,
      boothName: booth.boothName,
      vendorName: booth.vendorName,
      image: null, // Reset image field
    });
    setShowModal(true);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const filteredBooths = booths.filter((booth) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      (booth.boothName && booth.boothName.toLowerCase().includes(query)) ||
      (booth.vendorName && booth.vendorName.toLowerCase().includes(query))
    );
  });

  const handleBoothClick = (booth) => {
    setSelectedBooth(booth);
  };
  if (status === "loading") {
    return (
      <div className="loading-container">
        <Spinner animation="border" role="status" />
        <p>Loading...</p>
      </div>
    );
  }

  if (status === "authenticated" && session.user.role === "organizer") {
    return (
      <Container fluid>
        <Row>
          <Col xs={3} md={2} className="sidebar">
            <Sidebar event={{ _id: id }} />
          </Col>
          <Col xs={9} md={10} className="main-content">
            <Container>
              {error && <Alert variant="danger">{error}</Alert>}
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h4>{eventName}: Booths</h4>
                <Dropdown>
                  <Dropdown.Toggle variant="secondary">Select Event</Dropdown.Toggle>
                  <Dropdown.Menu>
                    {eventsList.map((event) => (
                      <Dropdown.Item key={event._id} onClick={() => router.push(`/events/${event._id}/booths`)}>
                        {event.eventName}
                      </Dropdown.Item>
                    ))}
                  </Dropdown.Menu>
                </Dropdown>
              </div>
              <Form.Control
                type="text"
                placeholder="Search Booths by Name or Vendor"
                value={searchQuery}
                onChange={handleSearchChange}
                className="mb-3"
              />
              <Row>
                {filteredBooths.map((booth) => (
                  <Col md={6} key={booth.boothId}>
                    <Card onClick={() => handleBoothClick(booth)} style={{ cursor: "pointer" }}>
                      <Card.Img variant="top" src={booth.image || "/placeholder.jpg"} alt={booth.boothName} />
                      <Card.Body>
                        <Card.Title>Booth {booth.boothNumber}</Card.Title>
                        <Card.Text>Vendor: {booth.vendorName}</Card.Text>
                        <Button variant="primary" onClick={(e) => {
                          e.stopPropagation();
                          handleEditBooth(booth);
                        }}>Edit</Button>{" "}
                        <Button variant="danger" onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteBooth(booth.boothId);
                        }}>Delete</Button>
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
                        image: null,
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
            </Container>
          </Col>
        </Row>
        {/* Booth Details */}
        {selectedBooth && (
          <Modal show={Boolean(selectedBooth)} onHide={() => setSelectedBooth(null)}>
            <Modal.Header closeButton>
              <Modal.Title>Booth Details</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <p><strong>Booth Number:</strong> {selectedBooth.boothNumber}</p>
              <p><strong>Booth Name:</strong> {selectedBooth.boothName}</p>
              <p><strong>Vendor Name:</strong> {selectedBooth.vendorName}</p>
              <p><strong>Registered On:</strong> {new Date(selectedBooth.registerationTime).toLocaleString()}</p>
              {selectedBooth.image && <img src={selectedBooth.image} alt={selectedBooth.boothName} style={{ width: "100%" }} />}
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setSelectedBooth(null)}>
                Close
              </Button>
            </Modal.Footer>
          </Modal>
        )}

        {/* Modal for Adding/Editing Booth */}
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
                  onChange={(e) => setFormBooth({ ...formBooth, boothNumber: e.target.value })}
                />
              </Form.Group>
              <Form.Group>
                <Form.Label>Booth Name</Form.Label>
                <Form.Control
                  type="text"
                  name="boothName"
                  placeholder="Enter booth name"
                  value={formBooth.boothName}
                  onChange={(e) => setFormBooth({ ...formBooth, boothName: e.target.value })}
                />
              </Form.Group>
              <Form.Group>
                <Form.Label>Vendor Name</Form.Label>
                <Form.Control
                  type="text"
                  name="vendorName"
                  placeholder="Enter vendor name"
                  value={formBooth.vendorName}
                  onChange={(e) => setFormBooth({ ...formBooth, vendorName: e.target.value })}
                />
              </Form.Group>
              <Form.Group>
                <Form.Label>Upload Image</Form.Label>
                <Form.Control
                  type="file"
                  name="image"
                  accept="image/*"
                  onChange={(e) => setFormBooth({ ...formBooth, image: e.target.files[0] })}
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

  return null;
}
