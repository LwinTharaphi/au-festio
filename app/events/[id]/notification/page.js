"use client";
import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Container, Row, Col, Table, Button, Form } from "react-bootstrap";
import Sidebar from "../../../components/Sidebar";
import "../../../components/Sidebar.css";

export default function NotificationPage() {
    const { id } = useParams(); // Fetch event ID from route
    const [students, setStudents] = useState([]);
    const [selectedStudents, setSelectedStudents] = useState([]);
    const [notificationTitle, setNotificationTitle] = useState("");
    const [notificationBody, setNotificationBody] = useState("");
    const [selectAll, setSelectAll] = useState(false);
    const [eventName, setEventName] = useState("");

    // Fetch event and student data
    useEffect(() => {
        const fetchEventData = async () => {
            try {
                const response = await fetch(`/api/events/${id}`);
                if (!response.ok) {
                    throw new Error("Failed to fetch event data.");
                }
                const event = await response.json();
                setEventName(event.eventName || "Event");
            } catch (error) {
                console.error("Error fetching event data:", error);
            }
        };

        const fetchStudents = async () => {
            try {
                const response = await fetch(`/api/events/${id}/students`);
                if (!response.ok) {
                    throw new Error("Failed to fetch students.");
                }
                const data = await response.json();
                setStudents(data);
            } catch (error) {
                console.error("Error fetching students:", error);
            }
        };

        fetchEventData();
        fetchStudents();
    }, [id]);

    // Handle "Select All" toggle
    const handleSelectAll = () => {
        setSelectAll(!selectAll); // Toggle the state
        setSelectedStudents(!selectAll ? students.map((student) => student.id) : []); // Select or deselect all
    };

    // Handle individual checkbox toggle
    const handleCheckboxChange = (studentId) => {
        setSelectedStudents((prevSelected) => {
            const isSelected = prevSelected.includes(studentId);
            return isSelected
                ? prevSelected.filter((id) => id !== studentId) // Deselect
                : [...prevSelected, studentId]; // Select
        });
    };

    // Send notification to individual student
    const handleSendNotification = async (studentId) => {
        try {
            await fetch(`/api/events/${id}/notifications`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    studentId,
                    title: notificationTitle,
                    body: notificationBody,
                }),
            });
            alert(`Notification sent to student ID: ${studentId}`);
        } catch (error) {
            console.error("Error sending notification:", error);
        }
    };

    // Send notifications to all selected students
    const handleSendAll = async () => {
        try {
            await fetch(`/api/events/${id}/notifications/bulk`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    studentIds: selectedStudents,
                    title: notificationTitle,
                    body: notificationBody,
                }),
            });
            alert("Notifications sent to all selected students.");
        } catch (error) {
            console.error("Error sending bulk notifications:", error);
        }
    };

    return (
        <Container fluid>
            <Row>
                {/* Sidebar */}
                <Col xs={3} md={2} className="sidebar">
                    <Sidebar event={{ _id: id }} />
                </Col>

                {/* Main Content */}
                <Col xs={9} md={10}>
                    <h3 className="mb-4 mt-5">Send Notifications for {eventName}</h3>
                    <div className="notification-form mb-4">
                        <Form.Group controlId="notificationTitle">
                            <Form.Label>Notification Title</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter notification title"
                                value={notificationTitle}
                                onChange={(e) => setNotificationTitle(e.target.value)}
                            />
                        </Form.Group>
                        <Form.Group controlId="notificationBody" className="mt-3">
                            <Form.Label>Notification Body</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={4}
                                placeholder="Enter notification body"
                                value={notificationBody}
                                onChange={(e) => setNotificationBody(e.target.value)}
                            />
                        </Form.Group>
                    </div>

                    <h2>Registered Students</h2>
                    <Table striped bordered hover>
                        <thead>
                            <tr>
                                <th>
                                    <Form.Check
                                        type="checkbox"
                                        checked={selectAll}
                                        onChange={handleSelectAll}
                                    />
                                </th>
                                <th>ID</th>
                                <th>Name</th>
                                <th>Email</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {students.map((student, index) => (
                                <tr key={student.id || index}>
                                    <td>
                                        <Form.Check
                                            type="checkbox"
                                            checked={selectedStudents.includes(student.id)}
                                            onChange={() => handleCheckboxChange(student.id)}
                                        />
                                    </td>
                                    <td>{student.sid}</td>
                                    <td>{student.name}</td>
                                    <td>{student.email}</td>
                                    <td>
                                        <Button
                                            variant="primary"
                                            size="sm"
                                            onClick={() => handleSendNotification(student.id)}
                                            disabled={!notificationTitle || !notificationBody}
                                        >
                                            Send
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>

                    </Table>
                    <Button
                        variant="success"
                        onClick={handleSendAll}
                        disabled={
                            selectedStudents.length === 0 || !notificationTitle || !notificationBody
                        }
                    >
                        Send All
                    </Button>
                </Col>
            </Row>
        </Container>
    );
}
