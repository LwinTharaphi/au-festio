"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Container, Row, Col, Alert, Form, Button, Spinner } from "react-bootstrap";
import Sidebar from "../../../components/general-sidebar";
import { useSession } from 'next-auth/react'

export default function Profile() {
  const {data: session, status} = useSession();
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
    // console.log(session)
    // if (!session) {
    //   // If no session, redirect to login page
    //   router.push("/"); // or another appropriate route
    // }
    if (status === 'unauthenticated'){
      router.push('/')
    }

    if (status === "authenticated" && session?.user && session.user.role === "organizer") {
      const userId = session.user.id
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
  }, [status,router,session]);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if(!session?.user){
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

  if(status === 'authenticated' && session.user.role === "organizer"){
    return (
      <div style={{ display: "flex", minHeight: "100vh" }}>
        <Sidebar />
        <div style={{ flex: 1, padding: "20px" }}>
          <Container>
            <h1 className="mb-4">Profile</h1>
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
                {organizer && (
                  <div className="d-flex flex-column align-items-center mb-5">
                    <div
                      className="rounded-circle mb-3"
                      style={{
                        width: "120px",
                        height: "120px",
                        backgroundColor: organizer.profilePicture ? "transparent" : "#007bff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        overflow: "hidden",
                      }}
                    >
                      {organizer.profilePicture ? (
                        <img
                          src={organizer.profilePicture}
                          alt={`${organizer.name}'s profile`}
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                      ) : (
                        <span style={{ color: "#fff", fontSize: "36px", fontWeight: "bold" }}>
                          {organizer.name
                            .split(" ")
                            .map((word) => word[0])
                            .join("")}
                        </span>
                      )}
                    </div>
                    <h3>{organizer.name}</h3>
                    <p>
                      <strong>Email:</strong> {organizer.email}
                    </p>
                    <p>
                      <strong>Phone:</strong> {organizer.phone}
                    </p>
                    <Button
                      variant="primary"
                      onClick={() => setShowChangePassword((prev) => !prev)}
                      className="mt-3"
                    >
                      {showChangePassword ? "Cancel" : "Change Password"}
                    </Button>
                  </div>
                )}
  
                {showChangePassword && (
                  <Row className="justify-content-center">
                    <Col md={6}>
                      <div className="p-4 shadow-sm rounded bg-light">
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
                          <Button variant="success" type="submit" className="w-100">
                            Change Password
                          </Button>
                        </Form>
                      </div>
                    </Col>
                  </Row>
                )}
              </>
            )}
          </Container>
        </div>
      </div>
    );
  }

  return null;
}
