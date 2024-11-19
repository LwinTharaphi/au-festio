"use client";
import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Container, Row, Col, Table, Button, Alert, Modal, Form, Dropdown } from "react-bootstrap";
import { FaTrash, FaEdit } from "react-icons/fa";
import Sidebar from "../../../components/Sidebar";
import "../../../components/Sidebar.css";

export default function RegisteredStudentsPage() {
  const { id } = useParams(); // Use this as eventId
  const router = useRouter();
  const [eventData, setEventData] = useState(null);
  const [eventName, setEventName] = useState("");
  const [eventsList, setEventsList] = useState([]);
  const [students, setStudents] = useState([]);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [updatedStudent, setUpdatedStudent] = useState({
    sid:"",
    name: "",
    email: "",
    faculty: "",
    phone: "",
    status: "",
  });

  useEffect(() => {
    const fetchEventData = async () => {
      setError(null); // Clear previous errors before fetching data
      try {
        const response = await fetch(`/api/events/${id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch event data.");
        }

        const event = await response.json();
        setEventName(event.eventName);
        setEventData(event); // Store event data in the state
      } catch (err) {
        setError(err.message);
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
      } catch (err) {
        setError(err.message);
      }
    };

    if (id) {
      fetchEventData();
      fetchStudents();
    }
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

  const handleRowClick = (student) => {
    setSelectedStudent(student);
    setShowRefundModal(true); // Show the refund request modal
  };

  // const handleRowClick = (student) => {
  //   setSelectedStudent(student);
  //   setUpdatedStudent({
  //     name: student.name,
  //     email: student.email,
  //     faculty: student.faculty,
  //     phone: student.phone,
  //     status: student.status,
  //   });
  //   setShowModal(true);
  // };

  const updateStatus = async (studentId, status) => {
    try {
      await fetch(`/api/events/${id}/students/${studentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      setStudents(students.map(student =>
        student._id === studentId ? { ...student, status } : student
      ));
    } catch (error) {
      setError("Failed to update status.");
    }
  };

  const handleDelete = async () => {
    try {
      await fetch(`/api/events/${id}/students/${selectedStudent._id}`, { method: "DELETE" });
      setStudents(students.filter(student => student._id !== selectedStudent._id));
      setShowDeleteModal(false);
    } catch (error) {
      setError("Failed to delete student.");
    }
  };

  const handleRefundRequest = async () => {
    try {
      // Handle the refund request
      console.log("Refund request confirmed for student:", selectedStudent);
      setShowRefundModal(false); // Close the refund modal
    } catch (error) {
      setError("Failed to process refund request.");
    }
  };

  const handleUpdateStudent = async () => {
    try {
      await fetch(`/api/events/${id}/students/${selectedStudent._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedStudent),
      });
      setStudents(students.map(student =>
        student._id === selectedStudent._id ? { ...student, ...updatedStudent } : student
      ));
      setShowModal(false);
    } catch (error) {
      setError("Failed to update student.");
    }
  };

  const handleEventChange = (id) => {
    router.push(`/events/${id}/students`);
  };

  return (
    <Container fluid>
      <Row>
        <Col xs={3} md={2} className="sidebar">
          <Sidebar event={{ _id: id }} />
        </Col>
        <Col xs={9} md={10} className="main-content">
          <Container className="my-5">
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
            {error ? (
              <Alert variant="danger">{error}</Alert>
            ) : (
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
                  {students.length > 0 ? (
                    students.map(student => (
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
                                setShowModal(true); // Open edit modal
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
            )}
          </Container>
        </Col>
      </Row>

       {/* Modal for student refund request */}
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
      )}

      {/* Modal for edit student */}
      {selectedStudent && (
        <Modal show={showModal} onHide={() => setShowModal(false)}>
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
                  <option value="approved">Approved</option>
                  <option value="denied">Denied</option>
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
    </Container>
  );
}
