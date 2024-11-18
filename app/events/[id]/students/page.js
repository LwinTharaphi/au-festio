"use client";
import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Container, Row, Col, Table, Button, Alert, Modal } from "react-bootstrap";
import { FaTrash, FaEdit } from "react-icons/fa";
import Sidebar from "../../../components/Sidebar";
import "../../../components/Sidebar.css";

export default function RegisteredStudentsPage() {
  const { id } = useParams(); // Use this as eventId
  const [eventData, setEventData] = useState(null);
  const [eventName, setEventName] = useState("");
  const [students, setStudents] = useState([]);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

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
      setStudents(students.map(student =>
        student._id === studentId ? { ...student, status } : student
      ));
    } catch (error) {
      setError("Failed to update status.");
    }
  };

  const handleDelete = async (studentId) => {
    try {
      await fetch(`/api/events/${id}/students/${studentId}`, { method: "DELETE" });
      setStudents(students.filter(student => student._id !== studentId));
    } catch (error) {
      setError("Failed to delete student.");
    }
  };

  return (
    <Container fluid>
      <Row>
        <Col xs={3} md={2} className="sidebar">
          <Sidebar event={{_id:id}}/>
        </Col>
        <Col xs={9} md={10} className="main-content">
          <Container className="my-5">
            <h4>Registered Students for {eventName}</h4>
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
                      <tr key={student._id} onClick={() => handleRowClick(student)}>
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
                              // Implement edit logic here
                            }}
                          />
                          <FaTrash
                            style={{ cursor: "pointer", color: "red" }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(student._id);
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
                updateStatus(selectedStudent._id, "approved");
                setShowModal(false);
              }}
              disabled={selectedStudent.status === "approved"}
            >
              Approve
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                updateStatus(selectedStudent._id, "denied");
                setShowModal(false);
              }}
              disabled={selectedStudent.status === "denied"}
            >
              Deny
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </Container>
  );
}
