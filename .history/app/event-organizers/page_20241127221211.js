"use client";
import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Container, Row, Col, Table, Button, Alert, Form, Dropdown } from "react-bootstrap";
import { FaTrash, FaEdit } from "react-icons/fa";
import Sidebar from "../components/admin_sidebar";
import moment from 'moment';
import FormField from "../components/FormField";

export default function EventPerformancesPage() {
  const { id } = useParams(); // Get eventId from the URL params
  const router = useRouter();
  const [performances, setPerformances] = useState([]);
  const [eventData, setEventData] = useState(null); // State to store event data
  const [eventName, setEventName] = useState("");
  const [eventsList, setEventsList] = useState([]);
  const [error, setError] = useState("");

  // State for individual form fields
  const [serialNo, setSerialNo] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [editPerformanceId, setEditPerformanceId] = useState(null);

  // Fetch event details and performances for the event
  useEffect(() => {
    const fetchEventData = async () => {
      setError(null); // Clear previous errors before fetching data
      try {
        const response = await fetch(`/api/events/${id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch event data.");
        }

        const event = await response.json();
        setEventName(event.eventName);
        setEventData(event); // Store event data in the state
      } catch (err) {
        setError(err.message);
      }
    };

    const fetchPerformances = async () => {
      try {
        const response = await fetch(`/api/events/${id}/performances`);
        if (!response.ok) {
          throw new Error("Failed to fetch event performances.");
        }
        const data = await response.json();
        setPerformances(data);
      } catch (err) {
        setError(err.message);
      }
    };

    if (id) {
      fetchEventData(); // Fetch event data
      fetchPerformances(); // Fetch performances data
    }
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

  // Handle form submission to add or update performance
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!serialNo || !name || !description || !startTime || !endTime) {
      setError("Please fill in all fields.");
      return;
    }
    const startDate = moment(`${startTime} PM`, "h:mm A").toDate();
    const endDate = moment(`${endTime} PM`, "h:mm A").toDate();

    const performanceData = {
      serialNo,
      name,
      description,
      startTime: startDate,
      endTime: endDate,
    };

    try {
      let response;
      if (editPerformanceId) {
        // Update performance
        response = await fetch(`/api/events/${id}/performances/${editPerformanceId}`, {
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
        response = await fetch(`/api/events/${id}/performances`, {
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
      setSerialNo("");
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
      await fetch(`/api/events/${id}/performances/${performanceId}`, {
        method: "DELETE",
      });
      setPerformances(performances.filter((performance) => performance._id !== performanceId));
    } catch (error) {
      setError("Failed to delete performance.");
    }
  };

  // Handle edit performance
  const handleEdit = (performance) => {
    setSerialNo(performance.serialNo);
    setName(performance.name);
    setDescription(performance.description);
    setStartTime(performance.startTime);
    setEndTime(performance.endTime);
    setEditPerformanceId(performance._id);
  };

  const handleEventChange = (id) => {
    router.push(`/events/${id}/performance-schedule`);
  };

  return (
    <Container fluid>
      <Row>
        {/* Sidebar */}
        <Col xs={3} md={2} className="sidebar">
          <Sidebar />
        </Col>

        {/* Main Content */}
        <Col xs={9} md={10} className="main-content">
          <Container className="my-5">
            <h4>EventOrganizer</h4>

            {/* Error Display */}
            {error && <Alert variant="danger">{error}</Alert>}

            {/* Form for Adding or Editing Performance */}
            <Form onSubmit={handleSubmit} className="mb-4">
              <Row>
                <Col md={2}>
                <FormField
                    title="Event Name"
                    type="text"
                    placeholder="Enter event name"
                    value={eventName}
                    onChange={setEventName}
                  />
                </Col>
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
                      type="text"
                      placeholder="e.g. 08:10 PM"
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
                      type="text"
                      placeholder="e.g. 09:00 PM"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Button variant="primary" type="submit">
                {editPerformanceId ? "Update Performance" : "Add Performance"}
              </Button>
            </Form>

            {/* Table for Performance List */}
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>Serial No.</th>
                  <th>Name</th>
                  <th>Description</th>
                  <th>Start Time</th>
                  <th>End Time</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {performances.length > 0 ? (
                  performances.map((performance) => (
                    <tr key={performance._id}>
                      <td>{performance.serialNo}</td>
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
          </Container>
        </Col>
      </Row>
    </Container>
  );
}
