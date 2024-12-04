import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Card, Row, Col, Spinner } from "react-bootstrap";
import { useSession } from 'next-auth/react'
import { useRouter } from "next/navigation";

export default function OrganizerHistoryPage () {
  const {data: session, status} = useSession();
  const router = useRouter();
  const { id } = useParams(); // Get the organizer ID from the route
  const [completedEvents, setCompletedEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch completed events for the organizer
    const fetchCompletedEvents = async () => {
      // console.log(session)
    if (status === 'unauthenticated'){
      router.push('/organizer-login')
    }

    if (status === "authenticated" && session?.user) {
      const userId = session.user.id
      if (userId) {
        try {
          const response = await fetch(`/api/organizers/${id}/history`);
          if (!response.ok) throw new Error("Failed to fetch completed events.");
          const data = await response.json();
          setCompletedEvents(data);
        } catch (error) {
          console.error(error);
        } finally {
          setLoading(false);
        }
      };
  
      fetchCompletedEvents();
      }
    }
  
  }, [id,router,session,status]);

  if (loading) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" />
        <p>Loading completed events...</p>
      </div>
    );
  }
  if (status === 'loading'){
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

  if(status === "authenticated"){
    return (
      <div className="container mt-5">
        <h1 className="mb-4">Completed Events</h1>
        {completedEvents.length === 0 ? (
          <p>No completed events found.</p>
        ) : (
          <Row xs={1} md={2} lg={3} className="g-4">
            {completedEvents.map((event) => (
              <Col key={event.id}>
                <Card>
                  <Card.Img
                    variant="top"
                    src={event.imageUrl || "https://via.placeholder.com/300"}
                    alt={event.name}
                  />
                  <Card.Body>
                    <Card.Title>{event.name}</Card.Title>
                    <Card.Text>
                      <strong>Completed on:</strong>{" "}
                      {new Date(event.completedDate).toLocaleDateString()}
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
};

