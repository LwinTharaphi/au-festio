"use client";
import { useRouter, useParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import Sidebar from '../components/admin_sidebar';
import { Container, Row, Col, Button, Card, Dropdown, DropdownButton, Form } from 'react-bootstrap'; // Using React Bootstrap for layout
import { useSession } from 'next-auth/react';
import { Spinner } from 'reactstrap';
import { BsPeopleFill, BsShop, BsCheckCircle, BsStarFill } from "react-icons/bs";
import { Bar, Pie } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, SubTitle, ArcElement } from "chart.js";
// Register the components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  SubTitle
);

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [events, setEvents] = useState([]);
  const [organizers, setOrganizers] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [staffChartData, setStaffChartData] = useState({
    labels: [],
    datasets: [],
  });
  const [selectedOrganizer, setSelectedOrganizer] = useState(null);

  useEffect(() => {
    if (status === "loading") return;  // Don't redirect while loading
    if (status === 'unauthenticated' || session?.user?.role !== "admin") {
      router.push('/');
    }
    if (status === 'authenticated' && session?.user?.role === "admin") {
      fetchOrganizers();
    }
  }, [status, session, router]);

  const fetchOrganizers = async () => {
    try {
      const response = await fetch(`/api/event-organizers`);
      if (!response.ok) throw new Error("Failed to fetch organizers");
      const json = await response.json();
      setOrganizers(json); // Store the fetched data
      if (json.length > 0) {
        const firstOrganizerId = json[0]._id;
        setSelectedOrganizer(firstOrganizerId);
        fetchDashboardData(firstOrganizerId);
      }
    } catch (error) {
      console.error('Error fetching organizers:', error);
      setError(error.message);
    }
  };

  const fetchDashboardData = async (organizerId) => {
    try {
      const url = `/api/admin-dashboard?organizer_id=${organizerId}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch data");
      const json = await response.json();
      console.log('Fetched dashboard data:', json); // Debugging statement
      setData(json.result.Organizer); // Store the fetched data
      setEvents(json.result.Organizer.Events);
      if (json.result.Organizer.Events.length > 0) {
        setSelectedEvent(json.result.Organizer.Events[0]); // Default to the first event
        updateStaffChart(json.result.Organizer.Events[0]);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError(error.message);
    }
  };

  const handleOrganizerChange = (organizerId) => {
    setSelectedOrganizer(organizerId);
    setData(null); // Reset the data to show loading spinner
    setEvents([]); // Reset the events to show loading spinner
    setStaffChartData({
      labels: [],
      datasets: [],
    }); // Reset the staff chart data
    setSelectedEvent(null); // Reset the selected event
    fetchDashboardData(organizerId);
  };

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
    const roles = event.roles || []; // Assuming `roles` is an array of objects
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

  const PieChartCard = ({ data }) => {
      if (!data || (data.paidEvents === 0 && data.freeEvents === 0)) {
        return (
          <Card className="text-center shadow-sm" style={{ backgroundColor: "#F0F4F8", padding: "20px" }}>
            <h5 style={{ fontWeight: "bold" }}>Free and Paid Events</h5>
            <p>No events created yet.</p>
          </Card>
        );
      }
  
      const chartData = {
        labels: ['Paid Events', 'Free Events'],
        datasets: [
          {
            data: [data.paidEvents, data.freeEvents],
            backgroundColor: ['#B8D8E3', '#F6A9B8'], // Colors for paid and free events
            borderColor: 'white',
            borderWidth: 1,
          },
        ],
      };
  
      return (
        <Card className="text-center shadow-sm" style={{ backgroundColor: "#F0F4F8", padding: "20px" }}>
          <h5 style={{ fontWeight: "bold" }}>Free and Paid Events</h5>
          <Pie data={chartData} />
        </Card>
      );
  };

  const StudentRegistrationPieChart = ({ events }) => {
      if (!events || events.length === 0 || events.every(event => event.studentsRegistered === 0)) {
        return (
          <Card className="shadow-sm" style={{ backgroundColor: "#F4F9F9", height: '100%', textAlign: 'center' }}>
            <Card.Body>
              <h5 style={{ fontWeight: "bold" }}>Registered Participants</h5>
              <p>No participants have registered yet.</p>
            </Card.Body>
          </Card>
        );
      }
      
      const eventNames = events.map(event => event.eventName);
      const studentsRegistered = events.map(event => event.studentsRegistered);
    
      const chartData = {
        labels: eventNames,
        datasets: [
          {
            data: studentsRegistered,
            backgroundColor: ['#B8D8E3', '#F6A9B8', '#F9E2A6', '#A4D9D2', '#F8A8A2'],
            hoverBackgroundColor: ['#B8D8E3', '#F6A9B8', '#F9E2A6', '#A4D9D2', '#F8A8A2'], // Hover colors
          },
        ],
      };
    
      const chartOptions = {
        plugins: {
          legend: {
            position: 'top',  // Set to 'top' to move the legend to the top
            align: 'end',     // Align the legend to the right
            labels: {
              font: {
                size: 8, // Make the labels smaller
              },
            },
          },
        },
      };
    
      return (
        <Card className="shadow-sm" style={{ backgroundColor: "#F4F9F9", height: '100%', textAlign: 'center' }}>
          <Card.Body>
            <h5 style={{ fontWeight: "bold" }}>Registered Participants</h5>
            <Pie data={chartData} options={chartOptions} />
          </Card.Body>
        </Card>
      );
  };
  
  
  const CheckInPieChart = ({ events }) => {
    if (!events || events.length === 0 || events.every(event => event.studentsCheckIn === 0)) {
      return (
        <Card className="shadow-sm" style={{ backgroundColor: "#F4F9F9", height: '100%', textAlign: 'center' }}>
          <Card.Body>
            <h5 style={{ fontWeight: "bold" }}>Check-In Participants</h5>
            <p>No participants have checked in yet.</p>
          </Card.Body>
        </Card>
      );
    }

    const eventNames = events.map(event => event.eventName);
    const studentsCheckIn = events.map(event => event.studentsCheckIn);

    const chartData = {
      labels: eventNames,
      datasets: [
        {
          data: studentsCheckIn,
          backgroundColor: ['#B8D8E3', '#F6A9B8', '#F9E2A6', '#A4D9D2', '#F8A8A2'], // Custom colors for each event
          hoverBackgroundColor: ['#B8D8E3', '#F6A9B8', '#F9E2A6', '#A4D9D2', '#F8A8A2'], // Hover colors
        },
      ],
    };

    const chartOptions = {
      plugins: {
        legend: {
          position: 'top',  // Set to 'top' to move the legend to the top
          align: 'end',     // Align the legend to the right
          labels: {
            font: {
              size: 8, // Make the labels smaller
            },
          },
        },
      },
    };

    return (
      <Card className="shadow-sm" style={{ backgroundColor: "#F4F9F9", height: '100%', textAlign: 'center' }}>
        <Card.Body>
          <h5 style={{ fontWeight: "bold" }}>Check-In Participants</h5>
          <Pie data={chartData} options={chartOptions}/>
        </Card.Body>
      </Card>
    );
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
          backgroundColor: "#F3EFFD",
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

  if (status === 'authenticated' && session.user.role === "admin" && data) {
    // Prepare chart 
    const eventNames = events.map(event => event.eventName);
    const studentsRegistered = events.map(event => event.studentsRegistered);
    const studentsCheckIn = events.map(event => event.studentsCheckIn);
    return (
      <div style={{ display: 'flex', backgroundColor: '#F3EFFD' }}>
        {/* Sidebar */}
        <Sidebar />
        
        {/* Main content area */}
        <div style={{ flex: 1, padding: '20px' }}>
          <Container>
          <div className="d-flex justify-content-between align-items-center mb-3" style={{ backgroundColor: "#F3EFFD" }}>
            <h3 className="mb-4">Admin Dashboard</h3>
            <DropdownButton
              id="dropdown-basic-button"
              title={selectedOrganizer ? organizers.find(org => org._id === selectedOrganizer)?.name : "Select Organizer"}
              onSelect={handleOrganizerChange}
            >
              {organizers.map(organizer => (
                <Dropdown.Item key={organizer._id} eventKey={organizer._id}>
                  {organizer.name}
                </Dropdown.Item>
              ))}
            </DropdownButton>
            </div>
            {(selectedEvent || events.length === 0) && (
              <>
                <Row className="mb-4 g-4">
                  <Col md={4}>
                    <Card className="text-center shadow-sm">
                      <Card.Body>
                        <BsPeopleFill size={30} className="mb-2 text-primary" />
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
                        <BsShop size={30} className="mb-2 text-success" />
                        <Card.Title style={{ fontSize: "1rem", fontWeight: "bold" }}>
                          Free Events
                        </Card.Title>
                        <Card.Text style={{ fontSize: "1.5rem" }}>
                          {data.freeEvents}
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
                <Row className="g-4 mb-4">
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
                <Row className="mb-4 g-4">
                  <Col md={4}>
                    <PieChartCard data={{ paidEvents: data.paidEvents, freeEvents: data.freeEvents }} />
                  </Col>
                  <Col md={4}>
                    <StudentRegistrationPieChart events={events} />
                  </Col>
                  <Col md={4}>
                    <CheckInPieChart events={events} />
                  </Col>
                </Row>
              </>
            )}
          </Container>
        </div>
      </div>
    );
  }

  return null;
}