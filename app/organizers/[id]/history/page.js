"use client";
import React, { useEffect, useState } from "react";
import { Card, Row, Col, Spinner } from "react-bootstrap";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function OrganizerHistoryPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [completedEvents, setCompletedEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompletedEvents = async () => {
      try {
        if (status === "loading") return;  // Don't redirect while loading
        if (status === 'unauthenticated' || session?.user?.role !== "organizer"){
          router.push('/')
        }

        if (status === "authenticated" && session.user.role === "organizer") {
          setLoading(true);
          const response = await fetch(`/api/events`);
          if (!response.ok) {
            throw new Error("Failed to fetch events.");
          }
          const events = await response.json();

          // Check if events are completed based on `eventDate`
          const today = new Date();
          const filteredEvents = events.filter((event) => {
            const eventDate = new Date(event.eventDate); // Parse eventDate
            return eventDate < today; // Completed if eventDate is in the past
          });

          setCompletedEvents(filteredEvents); // Update state with filtered events
        }
      } catch (error) {
        console.error("Error fetching events:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCompletedEvents();
  }, [router, session, status]);

  if (loading || status === "loading") {
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

  if (status === "authenticated" && session.user.role === "organizer") {
    return (
      <div className="container mt-5">
        <h3 className="mb-4">History</h3>
        {completedEvents.length === 0 ? (
          <p>No completed events found.</p>
        ) : (
          <Row xs={1} md={2} lg={3} className="g-4">
            {completedEvents.map((event, index) => (
              <Col key={index}>
                <Card>
                  <Card.Img
                    variant="top"
                    src={event.poster}
                    alt={event.name}
                  />
                  <Card.Body>
                    <Card.Title>{event.eventName}</Card.Title>
                    <Card.Text>
                      <strong>Completed on:</strong>{" "}
                      {new Date(event.eventDate).toLocaleDateString()}
                    </Card.Text>
                    <Card.Text>{event.description}</Card.Text>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </div>
    );
  }
  return null;
}
