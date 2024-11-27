"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Container, Row, Col, Table, Button, Alert, Form } from "react-bootstrap";
import { FaTrash, FaEdit } from "react-icons/fa";
import Sidebar from "../components/admin_sidebar";
import FormField from "../components/FormField";

export default function EventOrganizersPage() {
  const router = useRouter();
  const [organizers, setOrganizers] = useState([]);
  const [error, setError] = useState("");

  // Form states
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [editOrganizerId, setEditOrganizerId] = useState(null);

  // Fetch organizers data
  useEffect(() => {
    const fetchOrganizers = async () => {
      setError(null); // Clear previous errors
      try {
        const response = await fetch(`/api/event-organizers`);
        if (!response.ok) throw new Error("Failed to fetch organizers.");
        const data = await response.json();
        setOrganizers(data);
      } catch (err) {
        setError(err.message);
      }
    };
    fetchOrganizers();
  }, []);

  // Handle form submission to add or update organizer
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !password || !phone) {
      setError("Please fill in all fields.");
      return;
    }

    const organizerData = { name, password, phone };

    try {
      let response;
      if (editOrganizerId) {
        // Update existing organizer
        response = await fetch(`/api/event-organizers/${editOrganizerId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(organizerData),
        });
        if (!response.ok) throw new Error("Failed to update organizer.");
        const updatedOrganizer = await response.json();
        setOrganizers((prev) =>
          prev.map((org) =>
            org._id === updatedOrganizer._id ? updatedOrganizer : org
          )
        );
        setEditOrganizerId(null);
      } else {
        // Add new organizer
        response = await fetch(`/api/event-organizers`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(organizerData),
        });
        if (!response.ok) throw new Error("Failed to add organizer.");
        const newOrganizer = await response.json();
        setOrganizers((prev) => [...prev, newOrganizer]);
      }

      // Reset form fields
      setName("");
      setPassword("");
      setPhone("");
    } catch (err) {
      setError(err.message);
    }
  };

  // Handle delete organizer
  const handleDelete = async (organizerId) => {
    try {
      await fetch(`/api/event-organizers/${organizerId}`, { method: "DELETE" });
      setOrganizers(organizers.filter((org) => org._id !== organizerId));
    } catch (err) {
      setError("Failed to delete organizer.");
    }
  };

  // Handle edit organizer
  const handleEdit = (organizer) => {
    setName(organizer.name);
    setPassword(organizer.password);
    setPhone(organizer.phone);
    setEditOrganizerId(organizer._id);
  };

  return (
    <Container fluid>
      <Row>
        {/* Sidebar */}
        <Col xs={3} md={2} className="sidebar">
          <Sidebar />
        </Col>

        {/* Main Content */}
        <Col xs={9} md={10} className="main-content">
          <Container className="my-5">
            <h4>Event Organizers</h4>

            {/* Error Display */}
            {error && <Alert variant="danger">{error}</Alert>}

            {/* Form for Adding or Editing Organizer */}
            <Form onSubmit={handleSubmit} className="mb-4">
              <Row>
                <Col md={4}>
                  <FormField
                    title="Organizer Name"
                    type="text"
                    placeholder="Enter name"
                    value={name}
                    onChange={setName}
                  />
                </Col>
                <Col md={4}>
                  <FormField
                    title="Password"
                    type="password"
                    placeholder="Enter password"
                    value={password}
                    onChange={setPassword}
                  />
                </Col>
                <Col md={4}>
                  <FormField
                    title="Phone Number"
                    type="text"
                    placeholder="Enter phone number"
                    value={phone}
                    onChange={setPhone}
                  />
                </Col>
              </Row>
              <Button variant="primary" type="submit">
                {editOrganizerId ? "Update Organizer" : "Add Organizer"}
              </Button>
            </Form>

            {/* Table for Organizers List */}
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>No.</th>
                  <th>Organizer Name</th>
                  <th>Password</th>
                  <th>Phone Number</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {organizers.length > 0 ? (
                  organizers.map((organizer, index) => (
                    <tr key={organizer._id}>
                      <td>{index + 1}</td>
                      <td>{organizer.name}</td>
                      <td>{organizer.password}</td>
                      <td>{organizer.phone}</td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center" }}>
                          <FaEdit
                            style={{
                              cursor: "pointer",
                              color: "blue",
                              marginRight: "10px",
                            }}
                            onClick={() => handleEdit(organizer)}
                          />
                          <FaTrash
                            style={{ cursor: "pointer", color: "red" }}
                            onClick={() => handleDelete(organizer._id)}
                          />
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5">No organizers found.</td>
                  </tr>
                )}
              </tbody>
            </Table>
          </Container>
        </Col>
      </Row>
    </Container>
  );
}
