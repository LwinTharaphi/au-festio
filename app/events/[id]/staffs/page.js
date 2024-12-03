"use client";
import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Container, Row, Col, Alert, Card, Button, Modal, Form, Table, Dropdown, Spinner } from "react-bootstrap";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FaTrash, FaEdit } from "react-icons/fa";
import Sidebar from "../../../components/Sidebar";
import "../../../components/Sidebar.css";

export default function StaffPage() {
  const { id } = useParams(); // Get eventId from URL parameters
  const router = useRouter();
  const [eventName, setEventName] = useState(""); // State to hold the event name
  const [eventsList, setEventsList] = useState([]);
  const [error, setError] = useState(null); // State to handle any error
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState([]); // State to hold the list of roles
  const [staff, setStaff] = useState([]); // State to hold the list of staff
  const [filteredStaffs, setFilteredStaffs] = useState([]);
  const [searchID, setSearchID] = useState("");
  const [showModal, setShowModal] = useState(false); // State to control modal visibility
  const [newRole, setNewRole] = useState({ name: "", count: "" }); // State to hold new role data
  const [isEditing, setIsEditing] = useState(false); // State to check if we are editing
  const [editRoleId, setEditRoleId] = useState(null); // State to hold the role ID being edited
  const [approvalStatus, setApprovalStatus] = useState(""); // To store the approval status (approved/denied)
  const [showApprovalModal, setShowApprovalModal] = useState(false); // To control modal visibility
  const [showRoleDeleteModal, setShowRoleDeleteModal] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState(null);
  const [showStaffDeleteModal, setShowStaffDeleteModal] = useState(false);
  const [StaffToDelete, setStaffToDelete] = useState(null);
  const [currentStaff, setCurrentStaff] = useState(null); // To hold the current staff being approved/denied
  const [showStaffModal, setShowStaffModal] = useState(false);
  const [isEditingStaff, setIsEditingStaff] = useState(false);
  const [editStaffId, setEditStaffId] = useState(null);
  const [newStaff, setNewStaff] = useState({
    id: "",
    name: "",
    email: "",
    faculty: "",
    phone: "",
    role: "",
    status: "",
  });

  // Fetch event name, roles, and staff based on eventId
  useEffect(() => {
    const fetchEventData = async () => {
      try {
        setLoading(true);
        const eventResponse = await fetch(`/api/events/${id}`);
        if (!eventResponse.ok) {
          throw new Error("Failed to fetch event data.");
        }
        const event = await eventResponse.json();
        setEventName(event.eventName);

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
        setFilteredStaffs(staffData);
      } catch (err) {
        setError(err.message);
      }finally {
        setLoading(false);
      }
    };

    fetchEventData();
  }, [id]);

  useEffect(() => {
    const fetchEventsList = async () => {
      try {
        const response = await fetch("/api/events");
        if (!response.ok) {
          throw new Error("Failed to fetch events list.");
        }
        const data = await response.json();
        setEventsList(data);
        console.log("Fetched events:", data); // Log the fetched events
      } catch (err) {
        setError(err.message);
      }
    };

    fetchEventsList();
  }, []);

  useEffect(() => {
    // Filter the staff by ID or name when the searchID is updated
    if (searchID.trim() !== "") {
      const filtered = staff.filter(
        (staffMember) =>
          staffMember.id.toLowerCase().includes(searchID.toLowerCase()) ||
          staffMember.name.toLowerCase().includes(searchID.toLowerCase())
      );
      setFilteredStaffs(filtered);
    } else {
      setFilteredStaffs(staff); // Reset the filter when searchID is empty
    }
  }, [searchID, staff]);
  
  // Handle the search input change
  const handleSearchIDChange = (event) => {
    setSearchID(event.target.value); // Update the searchID state
  };
  

  // Function to handle showing the staff modal
  const handleShowStaffModal = (staffMember = null) => {
    if (staffMember) {
      setIsEditingStaff(true);
      setEditStaffId(staffMember._id);
      setNewStaff({
        id: staffMember.id,
        name: staffMember.name,
        email: staffMember.email,
        faculty: staffMember.faculty,
        phone: staffMember.phone,
        status: staffMember.status,
        role: staffMember.role._id, // Assuming role is an object with an _id
      });
    } else {
      setIsEditingStaff(false);
      setNewStaff({ id: "", name: "", email: "", faculty: "", phone: "", role: "", status: "" });
    }
    setShowStaffModal(true);
  };

  const handleCloseStaffModal = () => {
    setShowStaffModal(false);
    setNewStaff({ id: "", name: "", email: "", faculty: "", phone: "", role: "", status: "" });
  };

  const handleShowApprovalModal = (staffMember) => {
    setCurrentStaff(staffMember); // Store the current staff to approve/deny
    setApprovalStatus(staffMember.status); // Set the current approval status (approved/denied)
    setShowApprovalModal(true); // Show the modal
  };

  const handleCloseApprovalModal = () => {
    setShowApprovalModal(false); // Hide the modal
  };

  const handleSaveApproval = async (status) => {
    if (!currentStaff) return; // If no staff is selected, return

    try {
      const updatedStaff = { ...currentStaff, status }; // Update the status of the staff
      const response = await fetch(`/api/events/${id}/staffs/${currentStaff._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedStaff),
      });

      if (!response.ok) throw new Error("Failed to update staff status.");

      const updatedData = await response.json();
      setStaff(staff.map((staffMember) => (staffMember._id === currentStaff._id ? updatedData : staffMember))); // Update staff in the state
      setShowApprovalModal(false); // Close the modal after saving
    } catch (err) {
      setError(err.message); // Show any errors if occurred
    }
  };

  const handleSaveStaff = async () => {
    try {
      if (isEditingStaff) {
        const response = await fetch(`/api/events/${id}/staffs/${editStaffId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newStaff),
        });
        if (!response.ok) throw new Error("Failed to update staff.");
        const updatedStaff = await response.json();
        setStaff(staff.map((s) => (s._id === editStaffId ? updatedStaff : s)));
      }
      handleCloseStaffModal();
    } catch (err) {
      setError(err.message);
    }
  };

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
      setShowRoleDeleteModal(false);
    } catch (err) {
      setError(err.message);
    }
  };

  // Handle Delete Modal Show/Hide
  const handleShowDeleteModal = (role) => {
    setRoleToDelete(role);
    setShowRoleDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    setShowRoleDeleteModal(false);
    setRoleToDelete(null);
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
      setShowStaffDeleteModal(false);
    } catch (err) {
      setError(err.message);
    }
  };
  // Handle Delete Modal Show/Hide
  const handleShowStaffDeleteModal = (staffMember) => {
    setStaffToDelete(staffMember);
    setShowStaffDeleteModal(true);
  };

  const handleCloseStaffDeleteModal = (staffMember) => {
    setShowStaffDeleteModal(false);
    setStaffToDelete(null);
  };

  const handleEventChange = (id) => {
    router.push(`/events/${id}/staffs`);
  };
  return (
    <Container fluid>
      <Row>
        <Col xs={3} md={2} className="sidebar">
          <Sidebar event={{ _id: id }} /> {/* Sidebar component */}
        </Col>
        <Col xs={9} md={10} className="main-content">
          <Container className="my-5">
            {error && <Alert variant="danger">{error}</Alert>} {/* Show error if any */}
            {!error && eventName && <h4>Staff List for {eventName}</h4>}
            {/* {!error && !eventName && <p>Loading event name...</p>} Show loading state */}
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
            <Dropdown className="mb-4" style={{ textAlign: "right" }}>
              <Dropdown.Toggle variant="secondary" id="dropdown-basic">
                Select Event
              </Dropdown.Toggle>
              <Dropdown.Menu>
                {eventsList.length > 0 ? (
                  eventsList.map((event) => (
                    <Dropdown.Item key={event._id} onClick={() => handleEventChange(event._id)}>
                      {event.eventName}
                    </Dropdown.Item>
                  ))
                ) : (
                  <Dropdown.Item disabled>No events found</Dropdown.Item>
                )}
              </Dropdown.Menu>
            </Dropdown>

            {/* Role Cards */}
            <div className="d-flex flex-wrap">
              {roles.map((role) => (
                <Card key={role._id} className="m-2" style={{ width: "18rem" }}>
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <Card.Title>{role.name}</Card.Title>
                        <Card.Text>Required: {role.count}</Card.Text>
                      </div>
                      <div>
                        <Button
                          variant="secondary"
                          size="sm"
                          className="me-2"
                          onClick={() => handleShowModal(role)}
                        >
                          <FontAwesomeIcon icon={faEdit} /> {/* Edit Icon */}
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleShowDeleteModal(role)}
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </Button>
                      </div>
                    </div>
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
            <div className="d-flex justify-content-between align-items-center my-4">
              <h5 className="mb-0">Registered Staff</h5>
              <Form.Control
                type="text"
                placeholder="Search by ID or Name"
                value={searchID}
                onChange={handleSearchIDChange}
                style={{ maxWidth: "300px" }}
              />
            </div>

            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Faculty</th>
                  <th>Phone No</th>
                  <th>Assigned Role</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStaffs.map((staffMember) => (
                  <tr key={staffMember._id}>
                    <td>{staffMember.id}</td>
                    <td>{staffMember.name}</td>
                    <td>{staffMember.email}</td>
                    <td>{staffMember.faculty}</td>
                    <td>{staffMember.phone}</td>
                    <td>{staffMember.role.name}</td>
                    <td>
                      <a
                        href="#"
                        onClick={() => handleShowApprovalModal(staffMember)}
                        style={{ textDecoration: 'underline', color: 'inherit' }}
                      >
                        {staffMember.status}
                      </a>
                    </td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <FaEdit
                          style={{ cursor: "pointer", color: "blue", marginRight: "10px" }}
                          onClick={() => handleShowStaffModal(staffMember)}
                        />
                        <FaTrash
                          style={{ cursor: "pointer", color: "red" }}
                          onClick={() => handleShowStaffDeleteModal(staffMember)}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>

            {/* Modal for Adding/Editing Staff */}
            <Modal show={showStaffModal} onHide={handleCloseStaffModal}>
              <Modal.Header closeButton>
                <Modal.Title>{isEditingStaff ? "Edit Staff" : "Add Staff"}</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <Form>
                  <Form.Group controlId="formStaffName">
                    <Form.Label>ID</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter ID"
                      value={newStaff.id}
                      onChange={(e) => setNewStaff({ ...newStaff, id: e.target.value })}
                    />
                  </Form.Group>
                  <Form.Group controlId="formStaffName">
                    <Form.Label>Name</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter name"
                      value={newStaff.name}
                      onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
                    />
                  </Form.Group>
                  <Form.Group controlId="formStaffEmail" className="mt-3">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      type="email"
                      placeholder="Enter email"
                      value={newStaff.email}
                      onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                    />
                  </Form.Group>
                  <Form.Group controlId="formStaffFaculty" className="mt-3">
                    <Form.Label>Faculty</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter faculty"
                      value={newStaff.faculty}
                      onChange={(e) => setNewStaff({ ...newStaff, faculty: e.target.value })}
                    />
                  </Form.Group>
                  <Form.Group controlId="formStaffPhone" className="mt-3">
                    <Form.Label>Phone No</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter phone number"
                      value={newStaff.phone}
                      onChange={(e) => setNewStaff({ ...newStaff, phone: e.target.value })}
                    />
                  </Form.Group>
                  <Form.Group controlId="formStaffRole" className="mt-3">
                    <Form.Label>Role</Form.Label>
                    <Form.Control
                      as="select"
                      value={newStaff.role}
                      onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value })}
                    >
                      <option value="">Select a role</option>
                      {roles.map((role) => (
                        <option key={role._id} value={role._id}>
                          {role.name}
                        </option>
                      ))}
                    </Form.Control>
                  </Form.Group>
                </Form>
              </Modal.Body>
              <Modal.Footer>
                <Button variant="secondary" onClick={handleCloseStaffModal}>
                  Close
                </Button>
                <Button variant="primary" onClick={handleSaveStaff}>
                  Save Changes
                </Button>
              </Modal.Footer>
            </Modal>

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

            <Modal show={showApprovalModal} onHide={handleCloseApprovalModal}>
              <Modal.Header closeButton>
                <Modal.Title>Approve or Deny Staff</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <p>Are you sure you want to {approvalStatus === "approved" ? "deny" : "approve"} this staff member?</p>
              </Modal.Body>
              <Modal.Footer>
                <Button variant="secondary" onClick={handleCloseApprovalModal}>
                  Close
                </Button>
                <Button
                  variant="success"
                  onClick={() => handleSaveApproval("approved")}
                >
                  Approve
                </Button>
                <Button
                  variant="danger"
                  onClick={() => handleSaveApproval("denied")}
                >
                  Deny
                </Button>
              </Modal.Footer>
            </Modal>

            {/* Delete Confirmation Modal */}
            {roleToDelete && (
              <Modal show={showRoleDeleteModal} onHide={handleCloseDeleteModal} centered>
                <Modal.Header closeButton>
                  <Modal.Title>Confirm Delete</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  Are you sure you want to delete the role <strong>{roleToDelete.name}</strong>?
                </Modal.Body>
                <Modal.Footer>
                  <Button variant="secondary" onClick={handleCloseDeleteModal}>
                    Cancel
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => handleDeleteRole(roleToDelete._id)}
                  >
                    Delete
                  </Button>
                </Modal.Footer>
              </Modal>
            )}

            {/* Delete Confirmation Modal */}
            {StaffToDelete && (
              <Modal show={showStaffDeleteModal} onHide={handleCloseStaffDeleteModal} centered>
                <Modal.Header closeButton>
                  <Modal.Title>Confirm Delete</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  Are you sure you want to delete the staff <strong>{StaffToDelete.name}</strong>?
                </Modal.Body>
                <Modal.Footer>
                  <Button variant="secondary" onClick={handleCloseStaffDeleteModal}>
                    Cancel
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => handleDeleteStaff(StaffToDelete._id)}
                  >
                    Delete
                  </Button>
                </Modal.Footer>
              </Modal>
            )}
            </>
            )}
          </Container>
        </Col>
      </Row>        
    </Container>
  );
}


