"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Container, Row, Col, Table, Button, Alert, Form, Modal, Spinner } from "react-bootstrap";
import { FaTrash, FaEdit, FaEye, FaEyeSlash, FaPlus } from "react-icons/fa";
import Sidebar from "../components/admin_sidebar";
import FormField from "../components/FormField";
import { useSession } from 'next-auth/react'

export default function EventOrganizersPage() {
  const {data: session, status} = useSession();
  const router = useRouter();
  const [organizers, setOrganizers] = useState([]);
  const [error, setError] = useState("");

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [editOrganizerId, setEditOrganizerId] = useState(null);
  const [refresh, setRefresh] = useState(false); // Trigger re-fetch
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [organizerToDelete, setOrganizerToDelete] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetch organizers data
  useEffect(() => {
    if (status === "loading") return;  // Don't redirect while loading
    if (status === 'unauthenticated' || session?.user?.role !== "admin"){
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
  }, [refresh,status,router,session]);

  const refreshEvents = () => setRefresh(!refresh);

  const maskPassword = (password) => (password ? "•".repeat(password.length) : "");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !email || !password || !phone) {
      setError("Please fill in all fields.");
      return;
    }

    const organizerData = { name, email, password, phone };

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

  const handleShowDeleteModal = (organizerId) => {
    setOrganizerToDelete(organizerId);
    setShowDeleteModal(true);
  };

  const handleEdit = (organizer) => {
    setName(organizer.name);
    setEmail(organizer.email);
    setPassword(organizer.password);
    setPhone(organizer.phone);
    setEditOrganizerId(organizer._id);
    setShowFormModal(true);
  };

  const resetForm = () => {
    setName("");
    setEmail("");
    setPassword("");
    setPhone("");
    setEditOrganizerId(null);
    setShowPassword(false);
  };

  const handleShowFormModal = () => {
    setName("");
    setEmail("");
    setPassword("");
    setPhone("");
    setEditOrganizerId(null); // Ensure no organizer is being edited
    setShowFormModal(true);
  };
  

  const togglePasswordVisibility = () => setShowPassword((prev) => !prev);

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

  if(status === 'authenticated' && session.user.role === "admin"){
    return (
      <Container fluid>
        <Row>
          <Col xs={3} md={2} className="sidebar">
            <Sidebar />
          </Col>
          <Col xs={9} md={10} className="main-content">
            <Container className="my-5">
              <h4>Event Organizers</h4>
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
              <Table striped bordered hover>
                <thead>
                  <tr>
                    <th>No.</th>
                    <th>Organizer Name</th>
                    <th>Email</th>
                    <th>Password</th>
                    <th>Phone Number</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {organizers.length > 0 ? (
                    organizers.map((organizer, index) => (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td>{organizer.name}</td>
                        <td>{organizer.email}</td>
                        <td>{maskPassword(organizer.password)}</td>
                        <td>{organizer.phone}</td>
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
            <Form onSubmit={handleSubmit}>
              <FormField
                title="Organizer Name"
                type="text"
                placeholder="Enter name"
                value={name}
                onChange={setName}
              />
              <FormField
                title="Email"
                type="text"
                placeholder="Enter email"
                value={email}
                onChange={setEmail}
              />
              <FormField
                title="Password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter password"
                value={password}
                onChange={setPassword}
              />
              <FormField
                title="Phone Number"
                type="text"
                placeholder="Enter phone number"
                value={phone}
                onChange={setPhone}
              />
              <Button variant="primary" type="submit">
                {editOrganizerId ? "Update Organizer" : "Add Organizer"}
              </Button>
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
      </Container>
    );
  }
  return null;
}
