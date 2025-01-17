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
import Image from "next/image";
import Sidebar from "../../../components/Sidebar";
import "../../../components/Sidebar.css";
import { useSession } from 'next-auth/react';
import moment from "moment";

export default function BoothPage() {
  const { data: session, status } = useSession();
  const { id } = useParams();
  const router = useRouter();
  const [eventName, setEventName] = useState("");
  const [eventsList, setEventsList] = useState([]);
  const [booths, setBooths] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedBooth, setSelectedBooth] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentBooth, setCurrentBooth] = useState(null);
  const [formBooth, setFormBooth] = useState({
    boothNumber: "",
    boothName: "",
    vendorName: "",
    image: null,
  });
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch event name and booths based on eventId
  useEffect(() => {
    if (status === "loading") return;
    if (status === 'unauthenticated' || session?.user?.role !== "organizer") {
      router.push('/');
    }
    if (status === 'authenticated' && session?.user && session.user.role === "organizer") {
      const userId = session.user.id;
      if (userId) {
        const fetchEventAndBooths = async () => {
          try {
            setLoading(true);
            const eventResponse = await fetch(`/api/organizers/${userId}/events/${id}`);
            if (!eventResponse.ok) {
              throw new Error("Failed to fetch event data.");
            }
            const event = await eventResponse.json();
            setEventName(event.eventName);

            const boothsResponse = await fetch(`/api/organizers/${session.user.id}/events/${id}/booths`);
            if (!boothsResponse.ok) {
              throw new Error("Failed to fetch booth data.");
            }
            const boothsData = await boothsResponse.json();
            console.log("Booths Data:", boothsData);
            setBooths(boothsData);
          } catch (err) {
            setError(err.message);
          } finally {
            setLoading(false);
          }
        };

        const fetchEventsList = async () => {
          try {
            const response = await fetch(`/api/organizers/${userId}/events`);
            if (!response.ok) {
              throw new Error("Failed to fetch events list.");
            }
            const data = await response.json();
            const today = moment();
            const nonCompletedEvents = data.filter((event) => {
              const registrationDate = moment(event.registerationDate);
              const eventDate = moment(event.eventDate);
      
              // Include events where today is between registration and event date or before registration
              return today.isBetween(registrationDate, eventDate, "day", "[]") || today.isBefore(registrationDate, "day");
            });
            setEventsList(nonCompletedEvents);
          } catch (err) {
            setError(err.message);
          }
        };

        fetchEventsList();
        fetchEventAndBooths();
      }
    }
  }, [id, router, session, status]);

  const handleSaveBooth = async () => {
    if (!formBooth.boothNumber || !formBooth.vendorName) {
      setError("Booth Number and Vendor Name are required.");
      return;
    }
  
    const formData = new FormData();
    formData.append("boothNumber", formBooth.boothNumber);
    formData.append("boothName", formBooth.boothName);
    formData.append("vendorName", formBooth.vendorName);
    if (formBooth.image) formData.append("image", formBooth.image);
  
    try {
      const url = editMode
        ? `/api/organizers/${session.user.id}/events/${id}/booths/${currentBooth.boothId}`
        : `/api/organizers/${session.user.id}/events/${id}/booths`;
      const method = editMode ? "PUT" : "POST";
  
      const response = await fetch(url, {
        method,
        body: formData,
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(editMode ? `Failed to update booth: ${errorText}` : `Failed to add booth: ${errorText}`);
      }
  
      const booth = await response.json();
  
      if (editMode) {
        setBooths((prevBooths) =>
          prevBooths.map((b) => (b.boothId === booth.boothId ? booth : b))
        );
      } else {
        setBooths((prevBooths) => [...prevBooths, booth]);
      }
  
      setSelectedBooth(booth); // Automatically update selected booth details
      setShowModal(false);
      setFormBooth({ boothNumber: "", boothName: "", vendorName: "", image: null });
      setEditMode(false);
    } catch (err) {
      setError(err.message);
    }
  };
  

  const handleFileChange = (e) => {
    setFormBooth({ ...formBooth, image: e.target.files[0] });
  };

  const handleBoothClick = (booth) => {
    setSelectedBooth(booth);
  };

  const handleEditBooth = (booth) => {
    setEditMode(true);
    setCurrentBooth(booth);
    setFormBooth({
      boothNumber: booth.boothNumber,
      boothName: booth.boothName,
      vendorName: booth.vendorName,
      image: null,
    });
    setShowModal(true);
  };

  const handleDeleteBooth = async (boothId) => {
    try {
      await fetch(`/api/events/${id}/booths/${boothId}`, { method: "DELETE" });
      setBooths((prevBooths) => prevBooths.filter((booth) => booth.boothId !== boothId));
    } catch (err) {
      setError("Failed to delete booth.");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormBooth((prevBooth) => ({ ...prevBooth, [name]: value }));
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleEventChange = (eventId) => {
    router.push(`/events/${eventId}/booths`);
  };

  const filteredBooths = booths.filter((booth) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      (booth.boothName && booth.boothName.toLowerCase().includes(query)) ||
      (booth.vendorName && booth.vendorName.toLowerCase().includes(query))
    );
  });

  if (status === 'loading') {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", flexDirection: "column" }}>
        <Spinner animation="border" variant="primary" role="status" style={{ width: "2rem", height: "2rem" }}>
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p style={{ marginTop: "1rem", fontSize: "1.2rem", fontWeight: "500", color: "#007bff" }}>
          Loading...
        </p>
      </div>
    );
  }

  if (status === 'authenticated' && session.user.role === "organizer") {
    return (
      <Container fluid>
        <Row>
          <Col xs={3} md={2} className="sidebar">
            <Sidebar event={{ _id: id }} />
          </Col>

          <Col xs={9} md={10} className="main-content">
            <Container>
              {error && <Alert variant="danger">{error}</Alert>}
              <div className="d-flex justify-content-between align-items-center mb-4 sticky-header">
                <h4>{eventName}: Booths</h4>
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
              </div>
              {loading ? (
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", flexDirection: "column" }}>
                  <Spinner animation="border" variant="primary" role="status" style={{ width: "2rem", height: "2rem" }}>
                    <span className="visually-hidden">Loading...</span>
                  </Spinner>
                  <p style={{ marginTop: "1rem", fontSize: "1.2rem", fontWeight: "500", color: "#007bff" }}>
                    Loading...
                  </p>
                </div>
              ) : (
                <>
                  <Form.Control
                    type="text"
                    placeholder="Search Booths by Name or Vendor"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className="mb-3 sticky-header"
                    style={{ maxWidth: "300px" }}
                  />
                  <Row>
                    <Col md={8}>
                      <Row>
                        {filteredBooths.map((booth) => (
                          <Col md={6} key={booth.boothId}>
                            <Card className="mb-3" onClick={() => handleBoothClick(booth)} style={{ cursor: "pointer" }}>
                              <Card.Body>
                                <Card.Title>Booth {booth.boothNumber}</Card.Title>
                                <Card.Text>Vendor: {booth.vendorName}</Card.Text>
                                <Image
                                  src={booth.imagePath}
                                  alt="Booth"
                                  width={500}
                                  height={300}
                                  style={{ marginBottom: '10px', width: '100%', height: 'auto' }}
                                />
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
                              <Image
                                src={selectedBooth.imagePath}
                                alt="Booth"
                                width={500}
                                height={300}
                                style={{ marginBottom: '10px', width: '100%', height: 'auto' }}
                              />
                            </Card.Text>
                          </Card.Body>
                        </Card>
                      ) : (
                        <p>Select a booth to view details.</p>
                      )}
                    </Col>
                  </Row>
                </>
              )}
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
                <Form.Label>Booth Image</Form.Label>
                <Form.Control type="file" onChange={handleFileChange} />
              </Form.Group>
              {editMode && currentBooth?.imagePath && (
                <Image
                  src={currentBooth.imagePath}
                  alt="Current Booth"
                  width={500}
                  height={300}
                  style={{ marginTop: '10px', width: '100%', height: 'auto' }}
                />
              )}
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