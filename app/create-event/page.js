"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Table, Form, Button, Container, Row, Col, Card, Alert, Modal } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

export default function EventForm() {
  const router = useRouter();
  const [events, setEvents] = useState([]);
  const [eventData, setEventData] = useState({ title: "", date: "", description: "" });
  const [isEditing, setIsEditing] = useState(false);  
  const [currentEventId, setCurrentEventId] = useState(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    const response = await fetch("/api/events");
    const data = await response.json();
    setEvents(data);
  };

  const handleChange = (e) => {
    setEventData({ ...eventData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const method = isEditing ? "PUT" : "POST"; 
    const url = isEditing ? `/api/events/${currentEventId}` : "/api/events";

    const response = await fetch(url, {
      method: method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(eventData),
    });

    if (response.ok) {
      setEventData({ title: "", date: "", description: "" });
      setIsEditing(false);  
      setCurrentEventId(null);  
      fetchEvents();  
    }
  };

  const handleDelete = async (id) => {
    await fetch(`/api/events/${id}`, { method: "DELETE" });
    fetchEvents();
  };

  const handleEdit = (event) => {
    setEventData({
      title: event.title,
      date: event.date,
      description: event.description,
    });
    setIsEditing(true);
    setCurrentEventId(event._id);
  };

  // Navigate to the dashboard page when an event card is clicked
  const handleCardClick = (id) => {
    router.push(`/events/${id}/dashboard`);
  };

  return (
    <Container className="my-5">
      {/* Event Creation/Update Form in a Bootstrap Card */}
      <Card className="mb-4">
        <Card.Header>
          <h4>{isEditing ? "Edit Event" : "Create Event"}</h4>
        </Card.Header>
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Event Title</Form.Label>
              <Form.Control
                name="title"
                value={eventData.title}
                onChange={handleChange}
                type="text"
                placeholder="Enter event title"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Event Date</Form.Label>
              <Form.Control
                name="date"
                value={eventData.date}
                onChange={handleChange}
                type="date"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Event Description</Form.Label>
              <Form.Control
                name="description"
                value={eventData.description}
                onChange={handleChange}
                as="textarea"
                rows={3}
                placeholder="Enter event description"
                required
              />
            </Form.Group>

            <Button variant="primary" type="submit">
              {isEditing ? "Update Event" : "Create Event"}
            </Button>
          </Form>
        </Card.Body>
      </Card>

      {/* Event List Section in a Bootstrap Card */}
      <Card>
        <Card.Header>
          <h4>Event List</h4>
        </Card.Header>
        <Card.Body>
          <Row>
            {events.map((event) => (
              <Col key={event._id} md={4} className="mb-4">
                <Card className="shadow-sm" onClick={() => handleCardClick(event._id)} style={{ cursor: "pointer" }}>
                  <Card.Body>
                    <Card.Title>{event.title}</Card.Title>
                    <Card.Text><strong>Date:</strong> {event.date}</Card.Text>
                    <Card.Text><strong>Description:</strong> {event.description}</Card.Text>
                    <div className="d-flex justify-content-between">
                      <Button variant="warning" size="sm" onClick={(e) => { e.stopPropagation(); handleEdit(event); }}>Edit</Button>
                      <Button variant="danger" size="sm" onClick={(e) => { e.stopPropagation(); handleDelete(event._id); }}>Delete</Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Card.Body>
      </Card>
    </Container>
  );
}
