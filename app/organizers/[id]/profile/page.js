"use client";
import React, { useState, useEffect } from "react";
import { useParams,useRouter } from "next/navigation"; // Import useRouter to get the dynamic id from the URL
import { Container, Row, Col, Card, Image, Alert } from "react-bootstrap";
import Sidebar from "../../../components/general-sidebar"; // Sidebar import

export default function Profile() {
  const [organizer, setOrganizer] = useState(null);
  const [error, setError] = useState("");
  
  // Get the organizer id from the URL using useRouter
  const { id } = useParams(); // Get eventId from URL parameters
  const router = useRouter();// id from the dynamic route parameter

  // Fetch the event organizer data
  useEffect(() => {
    if (id) { // Ensure id is available before making the fetch request
      const fetchOrganizer = async () => {
        try {
          const response = await fetch(`/api/event-organizers/${id}`);
          if (!response.ok) throw new Error("Failed to fetch organizer details.");
          const data = await response.json();
          setOrganizer(data);
        } catch (err) {
          setError(err.message);
        }
      };
      fetchOrganizer();
    }
  }, [id]); // Only run when id changes

  // Helper function to get initials for profile picture
  const getInitials = (name) => {
    return name
      ? name
          .split(" ")
          .map((word) => word[0])
          .join("")
          .toUpperCase()
      : "";
  };

  return (
    <div style={{ display: "flex" }}>
      {/* Sidebar */}
      <Sidebar />

      {/* Main content area */}
      <div style={{ flex: 1, padding: "20px" }}>
        <Container>
          <h1>Profile</h1>
          {error && <Alert variant="danger">{error}</Alert>}
          {organizer ? (
            <Row className="justify-content-center">
              <Col md={6}>
                <Card className="p-4 shadow-sm">
                  <div className="text-center mb-4">
                    {organizer.profilePicture ? (
                      <Image
                        src={organizer.profilePicture}
                        roundedCircle
                        style={{ width: "120px", height: "120px" }}
                        alt={`${organizer.name}'s profile`}
                      />
                    ) : (
                      <div
                        style={{
                          width: "120px",
                          height: "120px",
                          backgroundColor: "#007bff",
                          color: "#fff",
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "36px",
                          fontWeight: "bold",
                        }}
                      >
                        {getInitials(organizer.name)}
                      </div>
                    )}
                  </div>
                  <Card.Body>
                    <Card.Title className="text-center">
                      {organizer.name}
                    </Card.Title>
                    <Card.Text>
                      <strong>Email:</strong> {organizer.email}
                    </Card.Text>
                    <Card.Text>
                      <strong>Phone:</strong> {organizer.phone}
                    </Card.Text>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          ) : (
            <p>Loading organizer details...</p>
          )}
        </Container>
      </div>
    </div>
  );
}
