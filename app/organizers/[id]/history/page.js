"use client";
import React, { useEffect, useState } from "react";
import { Card, Row, Col, Spinner, Modal, Button } from "react-bootstrap";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Pie, Bar } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import html2canvas from 'html2canvas';
import { AiFillDelete } from 'react-icons/ai';
import Sidebar from "../../../components/general-sidebar";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

export default function OrganizerHistoryPage() {
  const { data: session, status } = useSession();
  const userId = session?.user?.id;
  const router = useRouter();
  const [completedEvents, setCompletedEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);

  useEffect(() => {
    const fetchCompletedEvents = async () => {
      try {
        if (status === "loading") return;  // Don't redirect while loading
        if (status === 'unauthenticated' || session?.user?.role !== "organizer") {
          router.push('/')
        }

        if (status === "authenticated" && session.user.role === "organizer") {
          setLoading(true);
          const userId = session.user.id;
          const response = await fetch(`/api/organizers/${userId}/events`);
          if (!response.ok) {
            throw new Error("Failed to fetch events.");
          }
          const events = await response.json();

          // Check if events are completed based on `eventDate`
          const today = new Date();
          const filteredEvents = events.filter((event) => {
            const eventDate = new Date(event.eventDate); // Parse eventDate
            return eventDate < today; // Completed if eventDate is in the past
          });

          setCompletedEvents(filteredEvents); // Update state with filtered events
        }
      } catch (error) {
        console.error("Error fetching events:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCompletedEvents();
  }, [router, session, status]);

  const handleDeleteClick = (eventId) => {
    setEventToDelete(eventId);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      const response = await fetch(`/api/organizers/${userId}/events/${eventToDelete}`, { method: 'DELETE' });
      if (!response.ok) {
        throw new Error("Failed to delete event.");
      }
      setCompletedEvents((prev) => prev.filter((event) => event._id !== eventToDelete));
      setShowDeleteModal(false);
      setEventToDelete(null);
    } catch (error) {
      console.error("Error deleting event:", error);
    }
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setEventToDelete(null);
  };

  const handleCardClick = async (eventId) => {
    try {
      // Fetch students data
      const studentsResponse = await fetch(`/api/organizers/${userId}/events/${eventId}/students`);
      const studentsData = await studentsResponse.json();

      // Fetch staffs data
      const staffsResponse = await fetch(`/api/organizers/${userId}/events/${eventId}/staffs`);
      const staffsData = await staffsResponse.json();

      // Fetch staffs data
      const boothsResponse = await fetch(`/api/organizers/${userId}/events/${eventId}/booths`);
      const boothsData = await boothsResponse.json();

      const feedbacksResponse = await fetch(`/api/organizers/${userId}/events/${eventId}/feedbacks`);
      const feedbacksData = await feedbacksResponse.json();

      // Assuming booths and feedback are part of the event data or another endpoint
      const eventResponse = await fetch(`/api/organizers/${userId}/events/${eventId}`);
      const eventData = await eventResponse.json();

      // Count feedback stars (1 to 5)
      const feedbackStars = [0, 0, 0, 0, 0]; // Initialize an array to hold counts for each star (1-5)
      feedbacksData.forEach(feedback => {
        if (feedback.star >= 1 && feedback.star <= 5) {
          feedbackStars[feedback.star - 1] += 1; // Increment the count for the respective star
        }
      });

      // Set selected event data for modal
      setSelectedEvent({
        eventName: eventData.eventName,
        totalRegistered: studentsData.length, // Registered students count
        totalCheckedIn: studentsData.filter(student => student.checkedIn).length, // Checked-in students count
        totalBooths: boothsData.length, // booth count
        totalStaffs: staffsData.length, // Staff count
        feedbackStars: feedbackStars, // Assuming feedback stars are part of event data
      });

      setShowModal(true);
    } catch (error) {
      console.error("Error fetching event stats:", error);
    }
  };

  const handleClose = () => setShowModal(false);

  const handleSaveToDevice = () => {
    if (selectedEvent) {
      // Temporarily hide the buttons
      const buttons = document.querySelectorAll('.modal-footer button');
      buttons.forEach(button => button.classList.add('hide-buttons'));

      // Wait for the DOM to update before capturing the screenshot
      setTimeout(() => {
        html2canvas(document.querySelector("#event-statistics-modal")).then((canvas) => {
          const link = document.createElement('a');
          link.href = canvas.toDataURL();
          link.download = `event-statistics-${selectedEvent.eventName}.png`;
          link.click();

          // Show the buttons back after saving
          buttons.forEach(button => button.classList.remove('hide-buttons'));
        });
      }, 100); // Delay of 100ms to ensure DOM updates
    }
  };


  if (loading || status === "loading") {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          flexDirection: "column",
          backgroundColor: '#F3EFFD'
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

  if (status === "authenticated" && session.user.role === "organizer") {
    return (
      <div style={{ backgroundColor: '#F3EFFD' }}>
        <Sidebar />
      <div className="container" style={{ backgroundColor: '#F3EFFD' }}>
        <h3 className="mb-4 mt-4">History</h3>
        {completedEvents.length === 0 ? (
          <p>No completed events found.</p>
        ) : (
          <Row xs={1} md={2} lg={3} className="g-4">
            {completedEvents.map((event, index) => (
              <Col key={index}>
                <Card onClick={() => handleCardClick(event._id)} style={{ cursor: 'pointer' }}>
                  <Card.Img
                    variant="top"
                    src={event.poster}
                    alt={event.name}
                    style={{
                      height: "200px", // Fixed height
                      objectFit: "cover", // Ensures the image fills the space proportionally
                      width: "100%", // Ensures it spans the card's width
                    }}
                  />

                  <Card.Body>
                    <Card.Title>{event.eventName}</Card.Title>
                    <Card.Text>
                      <strong>Completed on:</strong>{" "}
                      {new Date(event.eventDate).toLocaleDateString()}
                    </Card.Text>
                    <Card.Text>{event.description}</Card.Text>
                  </Card.Body>
                  <AiFillDelete
                    style={{
                      position: "absolute",
                      top: "10px",
                      right: "10px",
                      color: "blue",
                      cursor: "pointer",
                      fontSize: '1.5rem',
                    }}
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent the card's onClick from being triggered
                      handleDeleteClick(event._id);
                    }}
                  />
                </Card>
              </Col>
            ))}
          </Row>
        )}

        {/* Delete Confirmation Modal */}
        <Modal show={showDeleteModal} onHide={handleCloseDeleteModal}>
          <Modal.Header closeButton>
            <Modal.Title>Confirm Delete</Modal.Title>
          </Modal.Header>
          <Modal.Body>Are you sure you want to delete this event?</Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseDeleteModal}>Cancel</Button>
            <Button variant="danger" onClick={confirmDelete}>Delete</Button>
          </Modal.Footer>
        </Modal>

        <Modal show={showModal} onHide={handleClose} id="event-statistics-modal" size="lg">
          <Modal.Header closeButton>
            <Modal.Title>Event Statistics: {selectedEvent?.eventName}</Modal.Title>
          </Modal.Header>
          <Modal.Body style={{ height: 'auto', padding: '3rem' }}>
            {selectedEvent ? (
              <div>
                <Row>
                  <Col>
                    <Card style={{ border: '2px solid #b1e7cc' }}>
                      <Card.Body>
                        <Card.Title style={{ fontSize: '0.8rem' }}>Registered Students</Card.Title>
                        <Card.Text>{selectedEvent.totalRegistered}</Card.Text>
                      </Card.Body>
                    </Card>

                  </Col>
                  <Col>
                    <Card style={{ border: '2px solid #b1e7cc' }}>
                      <Card.Body>
                        <Card.Title style={{ fontSize: '0.8rem' }}>Check-in Students</Card.Title>
                        <Card.Text>{selectedEvent.totalCheckedIn}</Card.Text>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col>
                    <Card style={{ border: '2px solid #b1e7cc' }}>
                      <Card.Body>
                        <Card.Title style={{ fontSize: '0.8rem' }}>Total Booths</Card.Title>
                        <Card.Text>{selectedEvent.totalBooths}</Card.Text>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col>
                    <Card style={{ border: '2px solid #b1e7cc' }}>
                      <Card.Body>
                        <Card.Title style={{ fontSize: '0.8rem' }}>Total Staffs</Card.Title>
                        <Card.Text>{selectedEvent.totalStaffs}</Card.Text>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
                <Row className="mt-4">
                  <Col>
                    <Card style={{ border: '2px solid #b1e7cc' }}>
                      <Card.Body>
                        <Card.Title>Attendance (Pie Chart)</Card.Title>
                        <Pie data={{
                          labels: ['Checked In', 'Not Checked In'],
                          datasets: [{
                            data: [selectedEvent.totalCheckedIn, selectedEvent.totalRegistered - selectedEvent.totalCheckedIn],
                            backgroundColor: ['#36A2EB', '#FF6384'],
                          }]
                        }} />
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col>
                    <Card style={{ border: '2px solid #b1e7cc' }}>
                      <Card.Body>
                        <Card.Title>Feedback (Bar Chart)</Card.Title>
                        <Bar data={{
                          labels: ['1', '2', '3', '4', '5'],
                          datasets: [{
                            label: 'Feedback Stars',
                            data: selectedEvent.feedbackStars,
                            backgroundColor: '#FF6384',
                          }]
                        }} />
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              </div>
            ) : (
              <p>Loading statistics...</p>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>Close</Button>
            <Button variant="primary" onClick={handleSaveToDevice}>Save to Device</Button>
          </Modal.Footer>
        </Modal>
      </div>
      </div>
    );
  }

  return null;
}
