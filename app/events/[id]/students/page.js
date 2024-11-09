"use client";
import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Container, Row, Col, Table, Button, Alert } from "react-bootstrap";
import Sidebar from "../../../components/Sidebar";
import "../../../components/Sidebar.css";

export default function RegisteredStudentsPage() {
  const { id: eventId } = useParams();
  const [students, setStudents] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await fetch(`/api/events/${eventId}/students`);
        if (!response.ok) {
          throw new Error("Failed to fetch registered students.");
        }
        const data = await response.json();
        setStudents(data);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchStudents();
  }, [eventId]);

  const updateStatus = (studentId, status) => {
    setStudents(students.map(student => 
      student._id === studentId ? { ...student, status } : student
    ));
    // Here you can also add a call to an API to update the status in the database
  };

  return (
    <Container fluid>
      <Row>
        <Col xs={3} md={2} className="sidebar">
          <Sidebar />
        </Col>
        <Col xs={9} md={10} className="main-content">
          <Container className="my-5">
            <h4>Registered Students for Event {eventId}</h4>
            {error ? (
              <Alert variant="danger">{error}</Alert>
            ) : (
              <Table striped bordered hover>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map(student => (
                    <tr key={student._id}>
                      <td>{student._id}</td>
                      <td>{student.name}</td>
                      <td>{student.status}</td>
                      <td>
                        <Button
                          variant="success"
                          onClick={() => updateStatus(student._id, "approved")}
                          disabled={student.status === "approved"}
                        >
                          Approve
                        </Button>{" "}
                        <Button
                          variant="danger"
                          onClick={() => updateStatus(student._id, "denied")}
                          disabled={student.status === "denied"}
                        >
                          Deny
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </Container>
        </Col>
      </Row>
    </Container>
  );
}
