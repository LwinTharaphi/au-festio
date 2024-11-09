"use client";
import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Container, Row, Col, Card, Alert } from "react-bootstrap";
import Sidebar from "../../../components/Sidebar";
import "../../../components/Sidebar.css"; // Import the CSS file for sidebar styling

export default function EventDashboard() {
  const { id } = useParams();
  const [eventName, setEventName] = useState("");
  const [error, setError] = useState(null);

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
        {/* Sidebar Column */}
        <Col xs={3} md={2} className="sidebar">
          <Sidebar />
        </Col>

        {/* Main Content Column */}
        <Col xs={9} md={10} className="main-content">
          <Container className="my-5">
            <Card className="text-center">
              <Card.Header>
                <h4>Event Dashboard</h4>
              </Card.Header>
              <Card.Body>
                {error ? (
                  <Alert variant="danger">{error}</Alert>
                ) : (
                  <>
                    <Card.Title>{eventName || "Loading event name..."}</Card.Title>
                    <Card.Text>Welcome to the {eventName} dashboard!</Card.Text>
                  </>
                )}
              </Card.Body>
            </Card>
          </Container>
        </Col>
      </Row>
    </Container>
  );
}
