"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Container, Row, Col, Card, Image, Alert, Form, Button } from "react-bootstrap";
import Sidebar from "../../../components/general-sidebar";

export default function Profile() {
  const [organizer, setOrganizer] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordChangeMessage, setPasswordChangeMessage] = useState("");

  const { id } = useParams();
  const router = useRouter();

  // Fetch the organizer data
  useEffect(() => {
    if (id) {
      const fetchOrganizer = async () => {
        try {
          setLoading(true);
          const response = await fetch(`/api/event-organizers/${id}`);
          if (!response.ok) throw new Error("Failed to fetch organizer details.");
          const data = await response.json();
          setOrganizer(data);
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };
      fetchOrganizer();
    }
  }, [id]);

  // Helper function to get initials
  const getInitials = (name) => {
    return name
      ? name
          .split(" ")
          .map((word) => word[0])
          .join("")
          .toUpperCase()
      : "";
  };

  // Handle password change form submission
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      setPasswordChangeMessage("New password and confirmation do not match.");
      return;
    }

    try {
      const response = await fetch(`/api/event-organizers/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword: passwords.currentPassword,
          newPassword: passwords.newPassword,
          confirmPassword: passwords.confirmPassword, 
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to change password.");
      }

      setPasswordChangeMessage("Password changed successfully.");
      setPasswords({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      setPasswordChangeMessage(err.message);
    }
  };

  return (
    <div style={{ display: "flex" }}>
      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <div style={{ flex: 1, padding: "20px" }}>
        <Container>
          <h1>Profile</h1>
          {error && <Alert variant="danger">{error}</Alert>}
          {loading ? (
            <p>Loading organizer details...</p>
          ) : (
            <>
              {organizer && (
                <Row className="justify-content-center mb-5">
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
              )}

              {/* Change Password Section */}
              <Row className="justify-content-center">
                <Col md={6}>
                  <Card className="p-4 shadow-sm">
                    <Card.Body>
                      <Card.Title className="text-center">Change Password</Card.Title>
                      {passwordChangeMessage && (
                        <Alert
                          variant={
                            passwordChangeMessage.includes("successfully")
                              ? "success"
                              : "danger"
                          }
                        >
                          {passwordChangeMessage}
                        </Alert>
                      )}
                      <Form onSubmit={handlePasswordChange}>
                        <Form.Group controlId="currentPassword" className="mb-3">
                          <Form.Label>Current Password</Form.Label>
                          <Form.Control
                            type="password"
                            placeholder="Enter current password"
                            value={passwords.currentPassword}
                            onChange={(e) =>
                              setPasswords({ ...passwords, currentPassword: e.target.value })
                            }
                            required
                          />
                        </Form.Group>
                        <Form.Group controlId="newPassword" className="mb-3">
                          <Form.Label>New Password</Form.Label>
                          <Form.Control
                            type="password"
                            placeholder="Enter new password"
                            value={passwords.newPassword}
                            onChange={(e) =>
                              setPasswords({ ...passwords, newPassword: e.target.value })
                            }
                            required
                          />
                        </Form.Group>
                        <Form.Group controlId="confirmPassword" className="mb-3">
                          <Form.Label>Confirm New Password</Form.Label>
                          <Form.Control
                            type="password"
                            placeholder="Confirm new password"
                            value={passwords.confirmPassword}
                            onChange={(e) =>
                              setPasswords({ ...passwords, confirmPassword: e.target.value })
                            }
                            required
                          />
                        </Form.Group>
                        <Button variant="primary" type="submit" className="w-100">
                          Change Password
                        </Button>
                      </Form>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </>
          )}
        </Container>
      </div>
    </div>
  );
}
