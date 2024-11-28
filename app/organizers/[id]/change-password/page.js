"use client";
import React, { useState } from "react";
import Sidebar from "../../../components/general-sidebar"; // Sidebar import
import { Container, Row, Col, Card, Button, Form } from "react-bootstrap"; // React Bootstrap components

export default function ChangePassword() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    // Simple validation
    if (!oldPassword || !newPassword || !confirmPassword) {
      setError("All fields are required.");
      setSuccess("");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New password and confirm password do not match.");
      setSuccess("");
      return;
    }

    // Reset error and success message
    setError("");
    setSuccess("Password changed successfully!");

    // You can add the logic to handle the password change (API call, etc.)
    console.log("Password changed:", { oldPassword, newPassword });
  };

  return (
    <div style={{ display: 'flex' }}>
      {/* Sidebar */}
      <Sidebar />

      {/* Main content area */}
      <div style={{ flex: 1, padding: '20px' }}>
        <Container>
          <h1>Change Password</h1>
          <p>Update your password by filling in the form below.</p>

          {/* Display error or success message */}
          {error && <div className="alert alert-danger">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          {/* Change Password Form */}
          <Card className="mb-4">
            <Card.Header as="h5">Update Password</Card.Header>
            <Card.Body>
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="formOldPassword">
                  <Form.Label>Old Password</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Enter old password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formNewPassword">
                  <Form.Label>New Password</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formConfirmPassword">
                  <Form.Label>Confirm New Password</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </Form.Group>

                <Button variant="primary" type="submit">
                  Change Password
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Container>
      </div>
    </div>
  );
}
