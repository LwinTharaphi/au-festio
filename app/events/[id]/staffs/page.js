"use client";
import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Container, Row, Col, Alert, Card, Button, Modal, Form, Table } from "react-bootstrap";
import Sidebar from "../../../components/Sidebar";
import "../../../components/Sidebar.css";

export default function StaffPage() {
  const { id } = useParams(); // Get eventId from URL parameters
  const [eventName, setEventName] = useState(""); // State to hold the event name
  const [error, setError] = useState(null); // State to handle any error
  const [roles, setRoles] = useState([]); // State to hold the list of roles
  const [staff, setStaff] = useState([]); // State to hold the list of staff
  const [showModal, setShowModal] = useState(false); // State to control modal visibility
  const [newRole, setNewRole] = useState({ name: "", count: "" }); // State to hold new role data
  const [isEditing, setIsEditing] = useState(false); // State to check if we are editing
  const [editRoleId, setEditRoleId] = useState(null); // State to hold the role ID being edited

  // Fetch event name, roles, and staff based on eventId
  useEffect(() => {
    const fetchEventData = async () => {
      try {
        const eventResponse = await fetch(`/api/events/${id}`);
        if (!eventResponse.ok) {
          throw new Error("Failed to fetch event data.");
        }
        const event = await eventResponse.json();
        setEventName(event.title);

        // Fetch roles data
        const rolesResponse = await fetch(`/api/events/${id}/staffroles`);
        if (!rolesResponse.ok) {
          throw new Error("Failed to fetch roles.");
        }
        const rolesData = await rolesResponse.json();
        setRoles(rolesData);

        // Fetch staff data
        const staffResponse = await fetch(`/api/events/${id}/staffs`);
        if (!staffResponse.ok) {
          throw new Error("Failed to fetch staff data.");
        }
        const staffData = await staffResponse.json();
        setStaff(staffData);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchEventData();
  }, [id]);

  // Handle showing the modal for adding or editing a role
  const handleShowModal = (role = null) => {
    if (role) {
      setIsEditing(true);
      setEditRoleId(role._id);
      setNewRole({ name: role.name, count: role.count });
    } else {
      setIsEditing(false);
      setNewRole({ name: "", count: "" });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setNewRole({ name: "", count: "" });
  };

  // Handle saving a new role or updating an existing one
  const handleSaveRole = async () => {
    try {
      if (isEditing) {
        // Update existing role
        const response = await fetch(`/api/events/${id}/staffroles/${editRoleId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newRole),
        });
        if (!response.ok) {
          throw new Error("Failed to update role.");
        }
        const updatedRole = await response.json();
        setRoles(roles.map((role) => (role._id === editRoleId ? updatedRole : role)));
      } else {
        // Add new role
        const response = await fetch(`/api/events/${id}/staffroles`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newRole),
        });
        if (!response.ok) {
          throw new Error("Failed to add new role.");
        }
        const addedRole = await response.json();
        setRoles([...roles, addedRole]);
      }
      handleCloseModal();
    } catch (err) {
      setError(err.message);
    }
  };

  // Handle deleting a role
  const handleDeleteRole = async (roleId) => {
    try {
      const response = await fetch(`/api/events/${id}/staffroles/${roleId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to delete role.");
      }
      setRoles(roles.filter((role) => role._id !== roleId));
    } catch (err) {
      setError(err.message);
    }
  };

  // Handle deleting a staff member
  const handleDeleteStaff = async (staffId) => {
    try {
      const response = await fetch(`/api/events/${id}/staffs/${staffId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to delete staff.");
      }
      setStaff(staff.filter((staffMember) => staffMember._id !== staffId));
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Container fluid>
      <Row>
        <Col xs={3} md={2} className="sidebar">
          <Sidebar event={{_id: id}}/> {/* Sidebar component */}
        </Col>
        <Col xs={9} md={10} className="main-content">
          <Container className="my-5">
            {error && <Alert variant="danger">{error}</Alert>} {/* Show error if any */}
            {!error && eventName && <h4>Staff List for Event: {eventName}</h4>}
            {!error && !eventName && <p>Loading event name...</p>} {/* Show loading state */}

            {/* Role Cards */}
            <div className="d-flex flex-wrap">
              {roles.map((role) => (
                <Card key={role._id} className="m-2" style={{ width: "18rem" }}>
                  <Card.Body>
                    <Card.Title>{role.name}</Card.Title>
                    <Card.Text>Required: {role.count}</Card.Text>
                    <Button variant="secondary" onClick={() => handleShowModal(role)}>
                      Edit
                    </Button>{" "}
                    <Button variant="danger" onClick={() => handleDeleteRole(role._id)}>
                      Delete
                    </Button>
                  </Card.Body>
                </Card>
              ))}

              {/* "Add New Role" Card */}
              <Card className="m-2" style={{ width: "18rem", cursor: "pointer" }} onClick={() => handleShowModal()}>
                <Card.Body>
                  <Card.Title>Add New Role</Card.Title>
                </Card.Body>
              </Card>
            </div>

            {/* Staff Table */}
            <h5 className="my-4">Registered Staff</h5>
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>ID</th>
                  <th>Email</th>
                  <th>Faculty</th>
                  <th>Phone No</th>
                  <th>Assigned Role</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {staff.map((staffMember) => (
                  <tr key={staffMember._id}>
                    <td>{staffMember.name}</td>
                    <td>{staffMember.id}</td>
                    <td>{staffMember.email}</td>
                    <td>{staffMember.faculty}</td>
                    <td>{staffMember.phone}</td>
                    <td>{staffMember.role.name}</td>
                    <td>
                      <Button variant="warning" size="sm" className="mr-2">
                        Update
                      </Button>
                      <Button variant="danger" size="sm" onClick={() => handleDeleteStaff(staffMember._id)}>
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>

            {/* Modal for Adding/Editing Role */}
            <Modal show={showModal} onHide={handleCloseModal}>
              <Modal.Header closeButton>
                <Modal.Title>{isEditing ? "Edit Role" : "Add Role"}</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <Form>
                  <Form.Group controlId="formRoleName">
                    <Form.Label>Role Name</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter role name"
                      value={newRole.name}
                      onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
                    />
                  </Form.Group>
                  <Form.Group controlId="formRoleCount" className="mt-3">
                    <Form.Label>Number of People Needed</Form.Label>
                    <Form.Control
                      type="number"
                      placeholder="Enter count"
                      value={newRole.count}
                      onChange={(e) => setNewRole({ ...newRole, count: e.target.value })}
                    />
                  </Form.Group>
                </Form>
              </Modal.Body>
              <Modal.Footer>
                <Button variant="secondary" onClick={handleCloseModal}>
                  Close
                </Button>
                <Button variant="primary" onClick={handleSaveRole}>
                  Save Role
                </Button>
              </Modal.Footer>
            </Modal>
          </Container>
        </Col>
      </Row>
    </Container>
  );
}
