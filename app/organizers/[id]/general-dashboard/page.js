"use client";
import { useRouter, useParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import Sidebar from "../../../components/general-sidebar";
import { Container, Row, Col, Button, Card, Dropdown, DropdownButton, Form } from 'react-bootstrap'; // Using React Bootstrap for layout
import { useSession } from 'next-auth/react';
import { Spinner } from 'reactstrap';
import { BsPeopleFill, BsShop, BsCheckCircle, BsStarFill } from "react-icons/bs";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, SubTitle } from "chart.js";
// Register the components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  SubTitle
);

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [staffChartData, setStaffChartData] = useState({
    labels: [],
    datasets: [],
  });

  useEffect(() => {
    if (status === "loading") return;  // Don't redirect while loading
    if (status === 'unauthenticated' || session?.user?.role !== "organizer") {
      router.push('/');
    }
    if (status === 'authenticated' && session?.user?.role === "organizer") {
      const userId = session.user.id;
      if (userId) {
        async function fetchData() {
          try {
            const response = await fetch(`/api/organizers/${userId}/general-dashboard`);
            if (!response.ok) throw new Error("Failed to fetch data");
            const json = await response.json();
            setData(json.result); // Store the fetched data
            setEvents(json.result.Events);
            if (json.result.Events.length > 0) {
              setSelectedEvent(json.result.Events[0]); // Default to the first event
              updateStaffChart(json.result.Events[0]);
            }
          } catch (error) {
            setError(error.message);
            console.error("Error fetching dashboard data:", error.message);
          }
        }
        fetchData();
      }
    }
  }, [status, session, router]);  // Removed `data` from dependencies

  const updateStaffChart = (event) => {
    if (!event || !event.roles || event.roles.length === 0) {
      // Reset to empty chart
      setStaffChartData({
        labels: [],
        datasets: [],
      });
      console.log("No event or roles available. Resetting chart.");
      return;
    }
    // if (!event) return;
    const roles = event.roles || []; // Assuming `staffRoles` is an array of objects
    const labels = roles.map(role => role.name); // Role names
    const staffNeeded = roles.map(role => role.staffNeeded);
    const staffRegistered = roles.map(role => role.staffRegistered);
    const staffMissing = roles.map(role => Math.max(0, role.staffNeeded - role.staffRegistered));

    setStaffChartData({
      labels,
      datasets: [
        {
          label: "Staff Needed",
          data: staffNeeded,
          backgroundColor: "rgba(255, 99, 132, 0.2)",
          borderColor: "rgba(255, 99, 132, 1)",
          borderWidth: 1,
        },
        {
          label: "Staff Registered",
          data: staffRegistered,
          backgroundColor: "rgba(75, 192, 192, 0.2)",
          borderColor: "rgba(75, 192, 192, 1)",
          borderWidth: 1,
        },
        {
          label: "Staff Missing",
          data: staffMissing,
          backgroundColor: "rgba(255, 206, 86, 0.2)",
          borderColor: "rgba(255, 206, 86, 1)",
          borderWidth: 1,
        },
      ],
    });
    console.log("Staff Chart Data:", staffChartData);
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

  if (error) {
    return (
      <div>
        <p>Error: {error}</p>
      </div>
    );
  }

  if (status === 'authenticated' && session.user.role === "organizer" && data) {
    // Prepare chart 
    const events = data.Events;
    const eventNames = events.map(event => event.eventName);
    const studentsRegistered = events.map(event => event.studentsRegistered);
    const studentsCheckIn = events.map(event => event.studentsCheckIn);
    return (
      <div style={{ display: 'flex' }}>
        {/* Sidebar */}
        <Sidebar />
        
        {/* Main content area */}
        <div style={{ flex: 1, padding: '20px' }}>
          <Container>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h3>Dashboard</h3>
              <Button variant="primary"
                className="ms-2"
                onClick={() => router.push(`/organizers/${id}/history`)}>
                View History
              </Button>
            </div>
            <p>Welcome to the Dashboard!</p>

            <Row className="mb-4 g-4">
              <Col md={4}>
                <Card className="text-center shadow-sm">
                  <Card.Body>
                    <BsPeopleFill size={30} className="mb-2 text-primary" />
                    <Card.Title style={{ fontSize: "1rem", fontWeight: "bold" }}>
                      Total Events
                    </Card.Title>
                    <Card.Text style={{ fontSize: "1.5rem" }}>
                      {data.totalEvents}
                    </Card.Text>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={4}>
                <Card className="text-center shadow-sm">
                  <Card.Body>
                    <BsShop size={30} className="mb-2 text-success" />
                    <Card.Title style={{ fontSize: "1rem", fontWeight: "bold" }}>
                      Paid Events
                    </Card.Title>
                    <Card.Text style={{ fontSize: "1.5rem" }}>
                      {data.paidEvents}
                    </Card.Text>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={4}>
                <Card className="text-center shadow-sm">
                  <Card.Body>
                    <BsCheckCircle size={30} className="mb-2 text-info" />
                    <Card.Title style={{ fontSize: "1rem", fontWeight: "bold" }}>
                      Free Events
                    </Card.Title>
                    <Card.Text style={{ fontSize: "1.5rem" }}>
                      {data.freeEvents}
                    </Card.Text>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
            <Row className="mb-4 g-4">
              <Col md={4}>
                <Card className="text-center shadow-sm">
                  <Card.Body>
                    <BsPeopleFill size={30} className="mb-2 text-primary" />
                    <Card.Title style={{ fontSize: "1rem", fontWeight: "bold" }}>
                      Upcoming Events
                    </Card.Title>
                    <Card.Text style={{ fontSize: "1.5rem" }}>
                      {data.upcomingEvent}
                    </Card.Text>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={4}>
                <Card className="text-center shadow-sm">
                  <Card.Body>
                    <BsShop size={30} className="mb-2 text-success" />
                    <Card.Title style={{ fontSize: "1rem", fontWeight: "bold" }}>
                      Ongoing Events
                    </Card.Title>
                    <Card.Text style={{ fontSize: "1.5rem" }}>
                      {data.ongoingEvent}
                    </Card.Text>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={4}>
                <Card className="text-center shadow-sm">
                  <Card.Body>
                    <BsCheckCircle size={30} className="mb-2 text-info" />
                    <Card.Title style={{ fontSize: "1rem", fontWeight: "bold" }}>
                      Completed Events
                    </Card.Title>
                    <Card.Text style={{ fontSize: "1.5rem" }}>
                      {data.completedEvent}
                    </Card.Text>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
            {/* Charts Section */}
            <Row className="g-4">
              <Col md={6}>
                <Card className="shadow-sm">
                  <Card.Body>
                    <h5 className="text-center">Students</h5>
                    <Bar
                      data={{
                        labels: eventNames,
                        datasets: [
                          {
                            label: "Students Registered",
                            data: studentsRegistered,
                            backgroundColor: "rgba(54, 162, 235, 0.2)",
                            borderColor: "rgba(54, 162, 235, 1)",
                            borderWidth: 1,
                            tension: 0.4,
                          },
                          {
                            label: "Students Checked In",
                            data: studentsCheckIn,
                            backgroundColor: "rgba(153, 102, 255, 0.2)", // Color for checked-in students bar
                            borderColor: "rgba(153, 102, 255, 1)", // Border color for checked-in students bar
                            borderWidth: 1,
                          },
                        ],
                      }}
                      options={{
                        responsive: true,
                        scales: {
                          x: {
                            beginAtZero: true,
                          },
                          y: {
                            beginAtZero: true,
                          },
                        },
                        plugins: {
                          title: {
                            display: true,
                            text: "Event Registration and Check-In Data",
                          },
                        },
                      }}
                    />
                  </Card.Body>
                </Card>
              </Col>
              <Col md={6}>
                <Card className="shadow-sm">
                  <Card.Body>
                    <Form.Select
                      value={selectedEvent ? selectedEvent.eventName : ""}
                      onChange={(e) => {
                        const event = events.find(ev => ev.eventName === e.target.value);
                        setSelectedEvent(event);
                        updateStaffChart(event);
                      }}
                    >
                      {events.map((event) => (
                        <option key={event.eventName} value={event.eventName}>
                          {event.eventName}
                        </option>
                      ))}
                    </Form.Select>

                    {/* Show the row and columns even if no event is selected */}
                    <div style={{ marginTop: '20px' }}>
                      <h5 className="text-center">Staff Overview</h5>
                      <Bar
                        data={staffChartData}
                        options={{
                          responsive: true,
                          scales: {
                            x: { title: { display: true, text: "Roles" } },
                            y: { title: { display: true, text: "Count" }, beginAtZero: true },
                          },
                          plugins: {
                            tooltip: { enabled: false },
                            legend: { display: true },
                            title: {
                              display: true,
                              text: `Staff Overview for Event: ${selectedEvent?.eventName}`,
                            },
                            subtitle: {
                              display: events.length === 0,
                              text: "There is no event to select. Please add the event",
                              color: 'red',
                              font: {
                                size: 12,
                                weight: 'normal',
                              },
                              padding: {
                                top: 10,
                                bottom: 30
                              }
                            },
                          },
                        }}
                      />
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Container>
        </div>
      </div>
    );
  }

  return null;
}
