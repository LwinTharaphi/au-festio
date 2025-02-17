"use client";
import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Container, Row, Col, Table, Button, Alert, Form, Dropdown, Spinner, Breadcrumb } from "react-bootstrap";
import { FaTrash, FaEdit } from "react-icons/fa";
import Sidebar from "../../../components/Sidebar";
import "../../../components/Sidebar.css";
import moment from 'moment';
import { useSession } from 'next-auth/react';
import { set } from "mongoose";


export default function EventPerformancesPage() {
  const { data: session, status } = useSession();
  const { id } = useParams(); // Get eventId from the URL params
  const userId = session?.user?.id;
  const router = useRouter();
  const [performances, setPerformances] = useState([]);
  const [eventData, setEventData] = useState(null); // State to store event data
  const [eventName, setEventName] = useState("");
  const [eventsList, setEventsList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // State for individual form fields
  // const [serialNo, setSerialNo] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [editPerformanceId, setEditPerformanceId] = useState(null);
  const [startTime, setStartTime] = useState("08:00"); // Default time
  const [endTime, setEndTime] = useState("09:00"); // Default time

  // Fetch event details and performances for the event
  useEffect(() => {
    if (status === "loading") return;  // Don't redirect while loading
    if (status === 'unauthenticated' || session?.user?.role !== "organizer") {
      router.push('/')
    }
    if (status === 'authenticated' && session?.user && session.user.role === "organizer") {
      const userId = session.user.id
      if (userId) {
        const fetchEventData = async () => {
          setError(null); // Clear previous errors before fetching data
          try {
            setLoading(true);
            const response = await fetch(`/api/organizers/${userId}/events/${id}`);
            if (!response.ok) {
              throw new Error("Failed to fetch event data.");
            }

            const event = await response.json();
            setEventName(event.eventName);
            setEventData(event); // Store event data in the state
          } catch (err) {
            setError(err.message);
          } finally {
            setLoading(false);
          }
        };

        const fetchPerformances = async () => {
          try {
            const response = await fetch(`/api/organizers/${userId}/events/${id}/performances`);
            if (!response.ok) {
              throw new Error("Failed to fetch event performances.");
            }
            const data = await response.json();
            setPerformances(data);
          } catch (err) {
            setError(err.message);
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
            const nonCompletedEvents = data.events.filter((event) => {
              const registrationDate = moment(event.registerationDate);
              const eventDate = moment(event.eventDate);

              // Include events where today is between registration and event date or before registration
              return today.isBetween(registrationDate, eventDate, "day", "[]") || today.isBefore(registrationDate, "day");
            });
            setEventsList(nonCompletedEvents);
            console.log("Fetched events:", data); // Log the fetched events
          } catch (err) {
            setError(err.message);
          }
        };

        if (id) {
          fetchEventData(); // Fetch event data
          fetchPerformances(); // Fetch performances data
        }
        fetchEventsList();
      }
    }

  }, [id, , router, session, status]);

  // Handle form submission to add or update performance
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !description || !startTime || !endTime) {
      setError("Please fill in all fields.");
      return;
    }
    const startDate = moment(`${startTime} PM`, "h:mm A").toDate();
    const endDate = moment(`${endTime} PM`, "h:mm A").toDate();

    const performanceData = {
      // serialNo,
      name,
      description,
      startTime: startDate,
      endTime: endDate,
    };

    try {
      let response;
      if (editPerformanceId) {
        console.log("Edit performance data:", performanceData);
        // Update performance
        response = await fetch(`/api/organizers/${userId}/events/${id}/performances/${editPerformanceId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(performanceData),
        });
        if (!response.ok) throw new Error("Failed to update performance.");
        const updatedPerformance = await response.json();
        setPerformances((prev) =>
          prev.map((p) =>
            p._id === updatedPerformance._id ? updatedPerformance : p
          )
        );
        setEditPerformanceId(null);
      } else {
        // Add new performance
        response = await fetch(`/api/organizers/${userId}/events/${id}/performances`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(performanceData),
        });
        if (!response.ok) throw new Error("Failed to add performance.");
        const addedPerformance = await response.json();
        setPerformances((prev) => [...prev, addedPerformance]);
      }

      // Reset form fields
      // setSerialNo("");
      setName("");
      setDescription("");
      setStartTime("");
      setEndTime("");
    } catch (err) {
      setError(err.message);
    }
  };

  // Handle delete performance
  const handleDelete = async (performanceId) => {
    try {
      await fetch(`/api/organizers/${userId}/events/${id}/performances/${performanceId}`, {
        method: "DELETE",
      });
      setPerformances(performances.filter((performance) => performance._id !== performanceId));
    } catch (error) {
      setError("Failed to delete performance.");
    }
  };

  // Handle edit performance
  const handleEdit = (performance) => {
    // setSerialNo(performance.serialNo);
    setName(performance.name);
    setDescription(performance.description);
    setStartTime(performance.startTime);
    setEndTime(performance.endTime);
    setEditPerformanceId(performance._id);
  };

  const handleEventChange = (id) => {
    router.push(`/events/${id}/performance-schedule`);
  };



  if (status === 'loading') {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          flexDirection: "column",
        }}
      >
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
          {/* Sidebar */}
          <Col xs={3} md={2} className="sidebar">
            <Sidebar event={{ _id: id }} />
          </Col>

          {/* Main Content */}
          <Col xs={10} className="main-content p-4" style={{ backgroundColor: "#F3EFFD" }}>
            <Breadcrumb>
              <Breadcrumb.Item href={`/organizers/${session.user.id}/create-event`}>All Events</Breadcrumb.Item>
              {/* <Breadcrumb.Item active>{event.eventName}</Breadcrumb.Item> */}
            </Breadcrumb>
            <Container>
              <div className="d-flex justify-content-between align-items-center mb-3 sticky-header" style={{ backgroundColor: '#F3EFFD' }}>
                <h4>Performances for {eventName}</h4>
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
              {/* Error Display */}
              {error && <Alert variant="danger">{error}</Alert>}

              {loading ? (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "100vh",
                    flexDirection: "column",
                  }}
                >
                  <Spinner animation="border" variant="primary" role="status" style={{ width: "2rem", height: "2rem" }}>
                    <span className="visually-hidden">Loading...</span>
                  </Spinner>
                  <p style={{ marginTop: "1rem", fontSize: "1.2rem", fontWeight: "500", color: "#007bff" }}>
                    Loading...
                  </p>
                </div>
              ) : (
                <>

                  {/* Form for Adding or Editing Performance */}
                  <Form onSubmit={handleSubmit} className="mb-4">
                    <h5>{editPerformanceId ? "Edit Performance" : "Add a Performance"}</h5>
                    <Row>
                      <Col md={3}>
                        <Form.Group className="mb-3">
                          <Form.Label>Performance Name</Form.Label>
                          <Form.Control
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                          />
                        </Form.Group>
                      </Col>
                      <Col md={4}>
                        <Form.Group className="mb-3">
                          <Form.Label>Description</Form.Label>
                          <Form.Control
                            as="textarea"
                            rows={2}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                          />
                        </Form.Group>
                      </Col>
                      <Col md={2}>
                        <Form.Group className="mb-3">
                          <Form.Label>Start Time</Form.Label>
                          <Form.Control
                            type="time"
                            value={startTime}
                            onChange={(e) => setStartTime(e.target.value)}
                            required
                          />
                        </Form.Group>
                      </Col>
                      <Col md={2}>
                        <Form.Group className="mb-3">
                          <Form.Label>End Time</Form.Label>
                          <Form.Control
                            type="time"
                            value={endTime}
                            onChange={(e) => setEndTime(e.target.value)}
                            required
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                    <Button style={{ backgroundColor: "#A67EEC" }}
                      onClick={handleSubmit}
                    >
                      {editPerformanceId ? "Update Performance" : "Add Performance"}
                    </Button>
                  </Form>

                  {/* Table for Performance List */}
                  <Table hover responsive style={{ fontSize: '0.8rem' }}>
                    <thead>
                      <tr>
                        <th>No.</th>
                        <th>Name</th>
                        <th>Description</th>
                        <th>Start Time</th>
                        <th>End Time</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {performances.length > 0 ? (
                        performances.map((performance, index) => (
                          <tr key={performance._id}>
                            <td>{index + 1}</td>
                            <td>{performance.name}</td>
                            <td>{performance.description}</td>
                            <td>{moment(performance.startTime).format("h:mm A")}</td>
                            <td>{moment(performance.endTime).format("h:mm A")}</td>
                            <td>
                              <div style={{ display: "flex", alignItems: "center" }}>
                                <FaEdit
                                  style={{ cursor: "pointer", color: "blue", marginRight: "10px" }}
                                  onClick={() => handleEdit(performance)}
                                />
                                <FaTrash
                                  style={{ cursor: "pointer", color: "red" }}
                                  onClick={() => handleDelete(performance._id)}
                                />
                              </div>
                            </td>

                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="6">No performances found.</td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                </>
              )}
            </Container>
          </Col>
        </Row>
      </Container>
    );

  }
  return null;
}
