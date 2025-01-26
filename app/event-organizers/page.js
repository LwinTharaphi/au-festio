"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Container, Row, Col, Table, Button, Alert, Form, Modal, Spinner } from "react-bootstrap";
import { FaTrash, FaEdit, FaEye, FaEyeSlash, FaPlus } from "react-icons/fa";
import Sidebar from "../components/admin_sidebar";
import FormField from "../components/FormField";
import { useSession } from 'next-auth/react'
import { set } from "mongoose";

export default function EventOrganizersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [organizers, setOrganizers] = useState([]);
  const [error, setError] = useState("");

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [lifetime, setLifetime] = useState("");
  const [editOrganizerId, setEditOrganizerId] = useState(null);
  const [refresh, setRefresh] = useState(false); // Trigger re-fetch
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [organizerToDelete, setOrganizerToDelete] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showResetAllModal, setShowResetAllModal] = useState(false);

  // Fetch organizers data
  useEffect(() => {
    if (status === "loading") return;  // Don't redirect while loading
    if (status === 'unauthenticated' || session?.user?.role !== "admin") {
      router.push('/')
    }

    if (status === "authenticated" && session.user.role === "admin") {
      const fetchOrganizers = async () => {
        setError(null); // Clear previous errors
        try {
          setLoading(true);
          const response = await fetch(`/api/event-organizers`);
          if (!response.ok) throw new Error("Failed to fetch organizers.");
          const data = await response.json();
          setOrganizers(data);
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };
      fetchOrganizers();
    }
  }, [refresh, status, router, session]);

  const refreshEvents = () => setRefresh(!refresh);

  const maskPassword = (password) => (password ? "•".repeat(password.length) : "");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !email || !password || !phone || !lifetime) {
      setError("Please fill in all fields.");
      return;
    }

    const organizerData = { name, email, password, phone, lifetime };

    try {
      let response;
      if (editOrganizerId) {
        response = await fetch(`/api/event-organizers/${editOrganizerId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(organizerData),
        });
        if (!response.ok) throw new Error("Failed to update organizer.");
        refreshEvents();
      } else {
        response = await fetch(`/api/event-organizers`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(organizerData),
        });
        if (!response.ok) throw new Error("Failed to add organizer.");
        refreshEvents();
      }

      // Reset form and close modal
      resetForm();
      setShowFormModal(false);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async () => {
    if (organizerToDelete) {
      try {
        await fetch(`/api/event-organizers/${organizerToDelete}`, { method: "DELETE" });
        refreshEvents();
      } catch (err) {
        setError("Failed to delete organizer.");
      } finally {
        setShowDeleteModal(false);
        setOrganizerToDelete(null);
      }
    }
  };

  // Function to determine the organizer's status based on lifetime
  const getOrganizerStatus = (lifetime, createdAt) => {
    if (lifetime.toLowerCase() === "permanent") {
      return "active"; // Permanent organizers are always active
    }

    // Check if the lifetime has expired using the createdAt date
    if (isLifetimeExpired(lifetime, createdAt)) {
      return "terminated"; // Expired lifetimes transition to terminated
    }

    return "active"; // All other non-expired lifetimes are active
  };

  // Function to calculate expiration date based on the lifetime string and createdAt
  const calculateExpirationDate = (lifetime, createdAt) => {
    const startDate = new Date(createdAt);

    if (lifetime === "permanent") {
      // Return a date far in the future for permanent
      return new Date(9999, 11, 31); // December 31, 9999
    }

    const regex = /(\d+)-?(day|month|year)s?/i;

    const match = lifetime.match(regex);
    if (match) {
      const amount = parseInt(match[1], 10);
      const unit = match[2].toLowerCase();

      if (unit === "month") {
        startDate.setMonth(startDate.getMonth() + amount);
      } else if (unit === "year") {
        startDate.setFullYear(startDate.getFullYear() + amount);
      } else if (unit === "day") {
        startDate.setDate(startDate.getDate() + amount);
      }
    }

    return startDate;
  };

  // Function to check if the lifetime has expired
  const isLifetimeExpired = (lifetime, createdAt) => {
    const expirationDate = calculateExpirationDate(lifetime, createdAt);
    const currentDate = new Date();
    return expirationDate < currentDate; // Returns true if expired
  };

  // Function to generate a random email
  const generateRandomEmail = () => {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const domain = "@terminated.com"; // You can change this to any domain you prefer
    let email = "";

    // Generate a random email name
    for (let i = 0; i < 10; i++) {
      email += characters.charAt(Math.floor(Math.random() * characters.length));
    }

    // Append the domain to form the full email address
    email += domain;
    return email;
  };

  const GenerateEmailComponent = ({ organizerId }) => {
    const [newEmail, setNewEmail] = useState(null);
    const [error, setError] = useState(null);

    // Function to update email for the organizer
    const generateNewEmail = async () => {
      const newEmail = generateRandomEmail();
      try {
        const response = await fetch(`/api/event-organizers/${organizerId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: newEmail }), // Send the random email
        });
        if (!response.ok) throw new Error("Failed to update email.");
        setNewEmail(newEmail); // Set the new email if the request is successful
      } catch (error) {
        setError("Error updating email: " + error.message); // Set the error message
      }
    };

    // Trigger the email generation when the component mounts
    useEffect(() => {
      generateNewEmail();
    }, [organizerId]); // Run the effect when organizerId changes
    return (
      <>
        {error && <span>{error}</span>}
        {newEmail && <span>{newEmail}</span>}
      </>
    );
  };

  const handleShowDeleteModal = (organizerId) => {
    setOrganizerToDelete(organizerId);
    setShowDeleteModal(true);
  };

  const handleEdit = (organizer) => {
    setName(organizer.name);
    setEmail(organizer.email);
    setPassword(organizer.password);
    setPhone(organizer.phone);
    setLifetime(organizer.lifetime);
    setEditOrganizerId(organizer._id);
    setShowFormModal(true);
  };

  const resetForm = () => {
    setName("");
    setEmail("");
    setPassword("");
    setPhone("");
    setLifetime("");
    setEditOrganizerId(null);
    setShowPassword(false);
  };

  const handleShowFormModal = () => {
    setName("");
    setEmail("");
    setPassword("");
    setPhone("");
    setLifetime("");
    setEditOrganizerId(null); // Ensure no organizer is being edited
    setShowFormModal(true);
  };


  const togglePasswordVisibility = () => setShowPassword((prev) => !prev);

  const handleResetAllPasswords = async () => {
    try {
      const response = await fetch(`/api/event-organizers/reset-all-passwords`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ defaultPassword: "12345" }),
      });
      if (!response.ok) throw new Error("Failed to reset passwords.");
      alert("Passwords reset successfully, and emails sent to all organizers.");
      refreshEvents(); // Refresh the table to reflect changes
    } catch (err) {
      setError("Failed to reset all passwords.");
    } finally {
      setShowResetAllModal(false);
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

  if (status === 'authenticated' && session.user.role === "admin") {
    return (
      <Container fluid style={{ backgroundColor: "#F3EFFD" }}>
        <Row>
          <Col xs={3} md={2} className="sidebar">
            <Sidebar />
          </Col>
          <Col xs={9} md={10} className="main-content">
            <Container className="my-5" style={{ backgroundColor: "#F3EFFD" }}>
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
                  {/* Reset All Passwords Button */}
                  <div className="d-flex justify-content-between align-items-center mb-3" style={{ backgroundColor: "#F3EFFD" }}>
                    <h4>Event Organizers</h4>
                    <Button
                      style={{ backgroundColor: "#A67EEC" }} // Corrected the background color
                      className="ms-2"
                      onClick={() => setShowResetAllModal(true)}>
                      Reset All Passwords
                    </Button>
                  </div>
                  <Table hover responsive style={{ fontSize: '0.8rem' }}>
                    <thead>
                      <tr>
                        <th>No.</th>
                        <th>Organizer Name</th>
                        <th>Email</th>
                        <th>Lifetime</th>
                        <th>Password</th>
                        <th>Phone Number</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {organizers.length > 0 ? (
                        organizers.map((organizer, index) => (
                          <tr key={index}>
                            <td>{index + 1}</td>
                            <td>{organizer.name}</td>
                            <td>
                              {isLifetimeExpired(organizer.lifetime, organizer.createdAt)
                                ? "Invalid Email"
                                : organizer.email}
                            </td>
                            <td>{organizer.lifetime}</td>
                            <td>
                              {maskPassword(organizer.password)}
                            </td>
                            <td>{organizer.phone}</td>
                            <td>
                              {getOrganizerStatus(organizer.lifetime, organizer.createdAt)} </td>
                            <td>
                              <div style={{ display: "flex", alignItems: "center" }}>
                                <FaEdit
                                  style={{ cursor: "pointer", color: "blue", marginRight: "10px" }}
                                  onClick={() => handleEdit(organizer)}
                                />
                                <FaTrash
                                  style={{ cursor: "pointer", color: "red" }}
                                  onClick={() => handleShowDeleteModal(organizer._id)}
                                />
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="6">No organizers found.</td>
                        </tr>
                      )}
                    </tbody>
                  </Table>

                  {/* FAB Button */}
                  <Button
                    variant="primary"
                    className="fab"
                    onClick={handleShowFormModal}
                    style={{
                      position: "fixed",
                      bottom: "20px",
                      right: "20px",
                      borderRadius: "50%",
                      width: "60px",
                      height: "60px",
                      fontSize: "24px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <FaPlus />
                  </Button>
                </>
              )}
            </Container>
          </Col>
        </Row>

        {/* Form Modal */}
        <Modal show={showFormModal} onHide={() => setShowFormModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>{editOrganizerId ? "Edit Organizer" : "Add Organizer"}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={handleSubmit} className="p-4 shadow-sm rounded bg-light">
              <Form.Group className="mb-3" controlId="organizerName">
                <Form.Label>Organizer Name</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="organizerEmail">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  placeholder="Enter email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="organizerLifetime">
                <Form.Label>Lifetime</Form.Label>
                <Form.Select
                  value={lifetime}
                  onChange={(e) => setLifetime(e.target.value)}
                >
                  <option value="1-day">1 Day</option>
                  <option value="1-month">1 Month</option>
                  <option value="3-months">3 Months</option>
                  <option value="6-months">6 Months</option>
                  <option value="1-year">1 Year</option>
                  <option value="permanent">Permanent</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3" controlId="organizerPassword">
                <Form.Label>Password</Form.Label>
                <Form.Control
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="organizerPhone">
                <Form.Label>Phone Number</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter phone number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </Form.Group>

              <div className="d-grid">
                <Button variant="primary" type="submit">
                  {editOrganizerId ? "Update Organizer" : "Add Organizer"}
                </Button>
              </div>
            </Form>
          </Modal.Body>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Confirm Delete</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            Are you sure you want to delete this organizer? This action cannot be undone.
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              Delete
            </Button>
          </Modal.Footer>
        </Modal>
        {/* Reset All Passwords Confirmation Modal */}
        <Modal show={showResetAllModal} onHide={() => setShowResetAllModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Confirm Reset All Passwords</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            Are you sure you want to reset all organizers&apos; passwords to <strong>12345</strong>? This action will also notify them via email.
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowResetAllModal(false)}>
              Cancel
            </Button>
            <Button variant="warning" onClick={handleResetAllPasswords}>
              Reset Passwords
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    );
  }
  return null;
}
