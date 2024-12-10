"use client";
import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Container, Row, Col, Table, Button, Alert, Modal, Form, Dropdown, Spinner } from "react-bootstrap";
import { FaTrash, FaEdit, FaEyeSlash, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import Sidebar from "../../../components/Sidebar";
import "../../../components/Sidebar.css";
import { useSession } from 'next-auth/react';

export default function RegisteredStudentsPage() {
  const {data: session, status} = useSession();
  const { id } = useParams(); // Use this as eventId
  const router = useRouter();
  const [eventData, setEventData] = useState(null);
  const [eventName, setEventName] = useState("");
  const [eventsList, setEventsList] = useState([]);
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [searchID, setSearchID] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  // const [showRefundModal, setShowRefundModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [updatedStudent, setUpdatedStudent] = useState({
    sid: "",
    name: "",
    email: "",
    faculty: "",
    phone: "",
    status: "",
  });

  useEffect(() => {
    if (status === "loading") return;  // Don't redirect while loading
    if (status === 'unauthenticated' || session?.user?.role !== "organizer"){
      router.push('/')
    }
    if (status === 'authenticated' && session?.user && session.user.role === "organizer"){
      const userId = session.user.id
      if(userId){
        const fetchEventData = async () => {
          setError(null); // Clear previous errors before fetching data
          try {
            setLoading(true);
            const response = await fetch(`/api/events/${id}`);
            if (!response.ok) {
              throw new Error("Failed to fetch event data.");
            }
    
            const event = await response.json();
            setEventName(event.eventName);
            setEventData(event); // Store event data in the state
          } catch (err) {
            setError(err.message);
          }finally {
            setLoading(false);
          }
        };
    
        const fetchStudents = async () => {
          try {
            const response = await fetch(`/api/events/${id}/students`);
            if (!response.ok) {
              throw new Error("Failed to fetch registered students.");
            }
            const data = await response.json();
    
            console.log("Fetched data:", data); // Log the fetched data for debugging
            setStudents(data);
            setFilteredStudents(data);
          } catch (err) {
            setError(err.message);
          }
        };
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
        if (id) {
          fetchEventData();
          fetchStudents();
        }
        fetchEventsList();
      }
    }
  }, [id,router,session,status]);

  // const handleRowClick = (student) => {
  //   if (student.status === "refund requested") {
  //     setSelectedStudent(student);
  //     setShowRefundModal(true); // Show the refund request modal
  //   } else {
  //     setError("Refund requests can only be processed for students with a 'refund requested' status.");
  //     setTimeout(() => setError(null), 3000); // Clear the error after 3 seconds
  //   }
  // };

  const handleRowClick = (student) => {
    setSelectedStudent(student);
    setShowModal(true);
  };

  const updateStatus = async (studentId, status) => {
    try {
      await fetch(`/api/events/${id}/students/${studentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      // Update local state
      setStudents(prevStudents =>
        prevStudents.map(student =>
          student._id === studentId ? { ...student, status } : student
        )
      );
      setFilteredStudents(prevFiltered =>
        prevFiltered.map(student =>
          student._id === studentId ? { ...student, status } : student
        )
      );
    } catch (error) {
      setError("Failed to update status.");
    }
  };


  const handleDelete = async () => {
    try {
      await fetch(`/api/events/${id}/students/${selectedStudent._id}`, { method: "DELETE" });

      // Update local state
      setStudents(prevStudents =>
        prevStudents.filter(student => student._id !== selectedStudent._id)
      );
      setFilteredStudents(prevFiltered =>
        prevFiltered.filter(student => student._id !== selectedStudent._id)
      );
      setShowDeleteModal(false);
    } catch (error) {
      setError("Failed to delete student.");
    }
  };


  // const handleRefundRequest = async () => {
  //   try {
  //     await fetch(`/api/events/${id}/students/${selectedStudent._id}`, {
  //       method: "PUT",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({ status: "refunded" }),
  //     });
  //     setStudents(students.map(student =>
  //       student._id === selectedStudent._id ? { ...student, status: "refunded" } : student
  //     ));

  //     setShowRefundModal(false);
  //   } catch (error) {
  //     setError("Failed to process refund request.");
  //   }
  // };

  const handleUpdateStudent = async () => {
    try {
      await fetch(`/api/events/${id}/students/${selectedStudent._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedStudent),
      });

      // Update local state
      setStudents(prevStudents =>
        prevStudents.map(student =>
          student._id === selectedStudent._id ? { ...student, ...updatedStudent } : student
        )
      );
      setFilteredStudents(prevFiltered =>
        prevFiltered.map(student =>
          student._id === selectedStudent._id ? { ...student, ...updatedStudent } : student
        )
      );
      setShowEditModal(false);
    } catch (error) {
      setError("Failed to update student.");
    }
  };


  const handleEventChange = (id) => {
    router.push(`/events/${id}/students`);
  };

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchID(value);

    // Filter by either sid or name
    setFilteredStudents(
      students.filter(
        (student) =>
          student.sid.toLowerCase().includes(value) ||
          student.name.toLowerCase().includes(value)
      )
    );
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

  if (status === 'authenticated' && session.user.role === "organizer"){
    return (
      <Container fluid>
        <Row>
          <Col xs={3} md={2} className="sidebar">
            <Sidebar event={{ _id: id }} />
          </Col>
          <Col xs={9} md={10} className="main-content">
            <Container>
              <div className="d-flex justify-content-between align-items-center mb-4 sticky-header">
                <h4>Registered Students for {eventName}</h4>
                
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
              </div>
              <div className="d-flex justify-content-end align-items-center sticky-header">
                <div>
                  <Form.Control
                    type="text"
                    placeholder="Search by ID or Name"
                    value={searchID}
                    onChange={handleSearch}
                    style={{ maxWidth: "300px" }}
                  />
                </div>
              </div>
              {error && <Alert variant="danger">{error}</Alert>} {/* Show error if any */}
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
                      <th>ID</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Faculty</th>
                      <th>Phone</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.length > 0 ? (
                      filteredStudents.map(student => (
                        <tr key={student._id} onClick={() => handleRowClick(student)} style={{ cursor: 'pointer' }}>
                          <td>{student.sid}</td>
                          <td>{student.name}</td>
                          <td>{student.email}</td>
                          <td>{student.faculty}</td>
                          <td>{student.phone}</td>
                          <td>{student.status}</td>
                          <td>
                            <div style={{ display: "flex", alignItems: "center" }}>
                              <FaEdit
                                style={{ cursor: "pointer", color: "blue", marginRight: "10px" }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedStudent(student);
                                  setUpdatedStudent({
                                    sid: student.sid,
                                    name: student.name,
                                    email: student.email,
                                    faculty: student.faculty,
                                    phone: student.phone,
                                    status: student.status,
                                  });
                                  setShowEditModal(true); // Open edit modal
                                }}
                              />
                              <FaTrash
                                style={{ cursor: "pointer", color: "red" }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedStudent(student);
                                  setShowDeleteModal(true);
                                }}
                              />
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="text-center">
                          No students registered yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </>
              )}
            </Container>
          </Col>
        </Row>
  
        {/* Modal for student refund request
        {selectedStudent && (
          <Modal show={showRefundModal} onHide={() => setShowRefundModal(false)}>
            <Modal.Header closeButton>
              <Modal.Title>Refund Request for {selectedStudent.name}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <p>ID: {selectedStudent.sid}</p>
              <p>Name: {selectedStudent.name}</p>
              <p>Are you sure you want to process the refund for this student?</p>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowRefundModal(false)}>
                Close
              </Button>
              <Button variant="danger" onClick={handleRefundRequest}>
                Confirm Refund
              </Button>
            </Modal.Footer>
          </Modal>
        )} */}
  
  
        {/* Modal for edit student */}
        {selectedStudent && (
          <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
            <Modal.Header closeButton>
              <Modal.Title>Update Student Details</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form>
                <Form.Group controlId="sid">
                  <Form.Label>ID</Form.Label>
                  <Form.Control
                    type="text"
                    value={updatedStudent.sid}
                    onChange={(e) => setUpdatedStudent({ ...updatedStudent, sid: e.target.value })}
                  />
                </Form.Group>
                <Form.Group controlId="name">
                  <Form.Label>Name</Form.Label>
                  <Form.Control
                    type="text"
                    value={updatedStudent.name}
                    onChange={(e) => setUpdatedStudent({ ...updatedStudent, name: e.target.value })}
                  />
                </Form.Group>
                <Form.Group controlId="email">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    value={updatedStudent.email}
                    onChange={(e) => setUpdatedStudent({ ...updatedStudent, email: e.target.value })}
                  />
                </Form.Group>
                <Form.Group controlId="faculty">
                  <Form.Label>Faculty</Form.Label>
                  <Form.Control
                    type="text"
                    value={updatedStudent.faculty}
                    onChange={(e) => setUpdatedStudent({ ...updatedStudent, faculty: e.target.value })}
                  />
                </Form.Group>
                <Form.Group controlId="phone">
                  <Form.Label>Phone</Form.Label>
                  <Form.Control
                    type="text"
                    value={updatedStudent.phone}
                    onChange={(e) => setUpdatedStudent({ ...updatedStudent, phone: e.target.value })}
                  />
                </Form.Group>
                <Form.Group controlId="status">
                  <Form.Label>Status</Form.Label>
                  <Form.Control
                    as="select"
                    value={updatedStudent.status}
                    onChange={(e) => setUpdatedStudent({ ...updatedStudent, status: e.target.value })}
                  >
                    <option value="not viewed">Not viewed</option>
                    <option value="paid">Paid</option>
                    <option value="rejected">Rejected</option>
                  </Form.Control>
                </Form.Group>
  
              </Form>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Close
              </Button>
              <Button variant="primary" onClick={handleUpdateStudent}>
                Save Changes
              </Button>
            </Modal.Footer>
          </Modal>
        )}
  
        {/* Confirmation Modal for delete */}
        {selectedStudent && (
          <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
            <Modal.Header closeButton>
              <Modal.Title>Confirm Deletion</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              Are you sure you want to delete the student {selectedStudent.name}?
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
                Cancel
              </Button>
              <Button variant="danger" onClick={handleDelete}>
                Confirm Delete
              </Button>
            </Modal.Footer>
          </Modal>
        )}
  
        {/* Modal for student details */}
        {selectedStudent && (
          <Modal show={showModal} onHide={() => setShowModal(false)}>
            <Modal.Header closeButton>
              <Modal.Title>Student Details</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <p><strong>ID:</strong> {selectedStudent.sid}</p>
              <p><strong>Name:</strong> {selectedStudent.name}</p>
              <div>
                <strong>Payment Screenshot:</strong>
                <img
                  src={selectedStudent.paymentScreenshotUrl}
                  alt="Payment Screenshot"
                  style={{ width: "100%", marginTop: "10px" }}
                />
              </div>
            </Modal.Body>
            <Modal.Footer>
              <Button
                variant="success"
                onClick={() => {
                  updateStatus(selectedStudent._id, "paid");
                  setShowModal(false);
                }}
                disabled={selectedStudent.status === "paid"}
              >
                Approve
              </Button>
              <Button
                variant="danger"
                onClick={() => {
                  updateStatus(selectedStudent._id, "rejected");
                  setShowModal(false);
                }}
                disabled={selectedStudent.status === "rejected"}
              >
                Deny
              </Button>
            </Modal.Footer>
          </Modal>
        )}
      </Container>
    );
  }
  return null;
}
