"use client";
import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Container, Row, Col, Alert } from "react-bootstrap";
import Sidebar from "../../../components/Sidebar";
import "../../../components/Sidebar.css";

export default function BoothPage() {
  const { id } = useParams(); // Get eventId from URL parameters
  const [eventName, setEventName] = useState(""); // State to hold the event name
  const [error, setError] = useState(null); // State to handle any error

  // Fetch event name based on eventId
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await fetch(`/api/events/${id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch event data.");
        }
        const event = await response.json();
        setEventName(event.title);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchEvent();
  }, [id]);

  return (
    <Container fluid>
      <Row>
        <Col xs={3} md={2} className="sidebar">
          <Sidebar /> {/* Sidebar component */}
        </Col>
        <Col xs={9} md={10} className="main-content">
          <Container className="my-5">
            {error && <Alert variant="danger">{error}</Alert>} {/* Show error if any */}
            {!error && eventName && (
              <h4>Booths for Event: {eventName}</h4> 
            )}
            {!error && !eventName && <p>Loading event name...</p>} {/* Show loading state */}
          </Container>
        </Col>
      </Row>
    </Container>
  );
}
