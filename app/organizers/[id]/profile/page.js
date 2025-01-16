"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Container, Row, Col, Alert, Form, Button, Spinner, Card } from "react-bootstrap";
import Sidebar from "../../../components/general-sidebar";
import { useSession } from 'next-auth/react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserCircle, faEnvelope, faPhone, faLock, faSpinner } from "@fortawesome/free-solid-svg-icons";

export default function Profile() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [organizer, setOrganizer] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordChangeMessage, setPasswordChangeMessage] = useState("");

  useEffect(() => {
    if (status === "loading") return;

    if (status === 'unauthenticated' || session?.user?.role !== "organizer") {
      router.push('/');
    }

    if (status === "authenticated" && session?.user && session.user.role === "organizer") {
      const userId = session.user.id;
      if (userId) {
        const fetchOrganizer = async () => {
          try {
            setLoading(true);
            const response = await fetch(`/api/event-organizers/${userId}`);
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
    }
  }, [status, router, session]);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!session?.user) {
      setPasswordChangeMessage("You must be logged in to change your password");
      return;
    }
    if (passwords.newPassword !== passwords.confirmPassword) {
      setPasswordChangeMessage("New password and confirmation do not match.");
      return;
    }

    try {
      const response = await fetch(`/api/event-organizers/${session.user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(passwords),
      });

      if (!response.ok) throw new Error("Failed to change password.");

      setPasswordChangeMessage("Password changed successfully.");
      setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      setPasswordChangeMessage(err.message);
    }
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
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#F3EFFD' }}>
        <Sidebar />
        <div style={{ flex: 1, padding: "20px" }}>
          <Container>
            <h1 className="mb-4 text-center">Organizer Profile</h1>
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
              <Row>
                <Col md={showChangePassword ? 6 : { span: 8, offset: 2 }}>
                <Card className="p-4 shadow-sm rounded" style={{ backgroundColor: "#F3EFFD" }}>
                    <Card.Body className="text-center">
                      <div className="rounded-circle mx-auto mb-5" style={{ width: "120px", height: "120px", overflow: "hidden", backgroundColor: "#007bff", display: "flex", justifyContent: "center", alignItems: "center" }}>
                        {organizer?.profilePicture ? (
                          <img
                            src={organizer.profilePicture}
                            alt="Profile Picture"
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          />
                        ) : (
                          <FontAwesomeIcon icon={faUserCircle} size="6x" color="white" />
                        )}
                      </div>
                      {organizer ? (
                        <>
                          <h3 className="mb-4">{organizer.name}</h3>
                          <p>
                            <FontAwesomeIcon icon={faEnvelope} className="me-2" /> {organizer.email}
                          </p>
                          <p>
                            <FontAwesomeIcon icon={faPhone} className="me-2" /> {organizer.phone}
                          </p>
                        </>
                      ) : (
                        <p>Loading organizer details...</p>
                      )}
                      <Button
                        style={{ backgroundColor: "#A67EEC", color: "#fff", border: "none" }}
                        className="ms-2"
                        onClick={() => setShowChangePassword((prev) => !prev)}
                      >
                        {showChangePassword ? "Cancel" : "Change Password"}
                      </Button>
                    </Card.Body>
                  </Card>
                </Col>
                {showChangePassword && (
                  <Col md={6}>
                    <Card className="p-4 shadow-sm rounded" style={{ backgroundColor: "#F3EFFD" }}>
                      <Card.Body>
                        <h4 className="text-center mb-4">Change Password</h4>
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
                            <Form.Label>
                              <FontAwesomeIcon icon={faLock} className="me-2" /> Current Password
                            </Form.Label>
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
                            <Form.Label>
                              <FontAwesomeIcon icon={faLock} className="me-2" /> New Password
                            </Form.Label>
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
                            <Form.Label>
                              <FontAwesomeIcon icon={faLock} className="me-2" /> Confirm New Password
                            </Form.Label>
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
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "center", // Centers the button horizontally
                              alignItems: "center", // Centers the button vertically (if needed)
                              height: "100%", // Ensure it works in a full-height container
                            }}
                          >
                            <Button
                              style={{
                                backgroundColor: "#A67EEC",
                                color: "#fff",
                                border: "none",
                                padding: "8px 16px",
                                borderRadius: "4px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                              className="ms-2"
                              type="submit"
                            >
                              Change Password
                            </Button>
                          </div>


                        </Form>
                      </Card.Body>
                    </Card>
                  </Col>
                )}
              </Row>
            )}
          </Container>
        </div>
      </div>
    );
  }

  return null;
}
