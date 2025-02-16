"use client";
import { useState, useEffect } from "react";
import { Line, Bar } from "react-chartjs-2";
import { useParams, useRouter } from "next/navigation";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Spinner,
  Alert,
  Breadcrumb,
  Button
} from "react-bootstrap";
import Sidebar from "@/app/components/Sidebar";
import { BsPeopleFill, BsShop, BsCheckCircle, BsStarFill } from "react-icons/bs";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);
import { useSession } from 'next-auth/react';

export default function Dashboard() {
  const { data: session, status } = useSession();
  const { id } = useParams(); // Get eventId from URL parameters
  const route = useRouter();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") return;  // Don't redirect while loading
    if (status === 'unauthenticated' || session?.user?.role !== "organizer") {
      route.push('/')
    }
    if (status === 'authenticated' && session?.user && session.user.role === "organizer") {
      const userId = session.user.id
      if (userId) {
        async function fetchData() {
          try {
            setLoading(true);
            const response = await fetch(`/api/organizers/${userId}/events/${id}/dashboards`);
            if (!response.ok) throw new Error("Failed to fetch data");
            const json = await response.json();
            setData(json);
          } catch (error) {
            setError(error.message);
            console.error("Error fetching dashboard data:", error.message);
          } finally {
            setLoading(false);
          }
        }
        fetchData();
      }
    }
  }, [id, route, session, status]);

  const { stats, entryTimes, monthData, event, averageRating, performanceDetails } = data || {};

  if (status === 'loading' || !data) {
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
  if (error) return <Alert variant="danger">Error: {error}</Alert>;

  // Formatting Entry Times Data
  const timeLabels = Array.from(
    new Set(entryTimes.map((time) => new Date(time).toLocaleTimeString()))
  );
  const timeCounts = timeLabels.map((time) =>
    entryTimes.filter((t) => new Date(t).toLocaleTimeString() === time).length
  );

  // Formatting Monthly Crowd Flow Data
  // const monthLabels = Object.keys(monthData).map(
  //   (month) => `Month ${+month + 1}`
  // );
  // const monthCounts = Object.values(monthData);

  if (status === 'authenticated' && session.user.role === "organizer") {
    return (
      <Container fluid>
        <Row>
          {/* Sidebar */}
          <Col xs={3} md={2} className="sidebar">
            <Sidebar event={{ _id: id }} /> {/* Sidebar component */}
          </Col>

          {/* Main Content */}
          <Col xs={10} className="main-content p-4" style={{ backgroundColor: "#F3EFFD" }}>
            <Breadcrumb>
              <Breadcrumb.Item href={`/organizers/${session.user.id}/create-event`}>All Events</Breadcrumb.Item>
              {/* <Breadcrumb.Item active>{event.eventName}</Breadcrumb.Item> */}
            </Breadcrumb>
            <div className="d-flex aligh-items-center justify-content-between">
              <h2 className="text-primary">
                {event.eventName} Dashboard
              </h2>
              <Button
                style={{ backgroundColor: "#A67EEC" }} // Corrected the background color
                className="ms-2"
                onClick={() => route.push(`/events/${id}/feedbacks`)} // Fixed the router reference to `router.push`
              >
                View Feedbacks
              </Button>
            </div>
            <p></p>

            {/* Statistics Cards */}
            <Row className="mb-4 g-4">
              <Col md={3}>
                <Card className="text-center shadow-sm" style={{ backgroundColor: "#FDE2E4" }}>
                  <Card.Body>
                    <BsPeopleFill size={30} className="mb-2 text-primary" />
                    <Card.Title style={{ fontSize: "1rem", fontWeight: "bold" }}>
                      Total Registrations
                    </Card.Title>
                    <Card.Text style={{ fontSize: "1.5rem" }}>
                      {stats.totalRegistrations}
                    </Card.Text>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={3}>
                <Card className="text-center shadow-sm" style={{ backgroundColor: "#E2F0CB" }}>
                  <Card.Body>
                    <BsShop size={30} className="mb-2 text-success" />
                    <Card.Title style={{ fontSize: "1rem", fontWeight: "bold" }}>
                      Booths Registered
                    </Card.Title>
                    <Card.Text style={{ fontSize: "1.5rem" }}>
                      {stats.boothsRegistered}
                    </Card.Text>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={3}>
                <Card className="text-center shadow-sm" style={{ backgroundColor: "#D7E3FC" }}>
                  <Card.Body>
                    <BsCheckCircle size={30} className="mb-2 text-info" />
                    <Card.Title style={{ fontSize: "1rem", fontWeight: "bold" }}>
                      Check-Ins
                    </Card.Title>
                    <Card.Text style={{ fontSize: "1.5rem" }}>
                      {stats.checkIns}
                    </Card.Text>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={3}>
                <Card className="text-center shadow-sm" style={{ backgroundColor: "#FFF4E6" }}>
                  <Card.Body>
                    {/* Centered Big Star */}
                    <BsStarFill size={30} className="mb-2 text-warning" />
                    {/* Card Title */}
                    <Card.Title style={{ fontSize: "1rem", fontWeight: "bold" }}>
                      Average Rating
                    </Card.Title>

                    {/* Rating Value */}
                    <Card.Text style={{ fontSize: "1.5rem" }}>
                      {averageRating.toFixed(1)}
                    </Card.Text>
                  </Card.Body>
                </Card>
              </Col>
            </Row>


            {/* Charts Section */}
            <Row className="g-4">
              <Col md={6}>
                <Card className="shadow-sm" style={{ backgroundColor: "#F4F9F9", minHeight: "300px" }}>
                  <Card.Body>
                    <h5 className="text-center">Entry Times</h5>
                    <Line
                      data={{
                        labels: timeLabels,
                        datasets: [
                          {
                            label: "Entries Over Time",
                            data: timeCounts,
                            backgroundColor: "rgba(54, 162, 235, 0.2)",
                            borderColor: "rgba(54, 162, 235, 1)",
                            borderWidth: 1,
                            tension: 0.4,
                          },
                        ],
                      }}
                      options={{
                        responsive: true,
                        plugins: {
                          legend: { display: false },
                          tooltip: {
                            callbacks: {
                              label: (tooltipItem) =>
                                `${tooltipItem.raw} people`,
                            },
                          },
                        },
                        scales: {
                          x: {
                            title: { display: true, text: "Time of Day" },
                          },
                          y: {
                            title: { display: true, text: "Number of People" },
                            beginAtZero: true,
                          },
                        },
                      }}
                    />
                  </Card.Body>
                </Card>
              </Col>
              <Col md={6}>
                <Card className="text-center shadow-sm" style={{ backgroundColor: "#F4F9F9", minHeight: "300px" }}>
                  <Card.Body>
                    <Card.Title style={{ fontSize: "1rem", fontWeight: "bold" }}>Performance Details</Card.Title>
                    <div style={{ maxHeight: "200px", overflowY: "auto" }}>
                      <table
                        style={{
                          width: "100%",
                          backgroundColor: "#F4F9F9",
                          borderCollapse: "collapse",
                          fontSize: "0.9rem",
                          marginTop: "10px",
                        }}
                      >
                        <thead>
                          <tr style={{ borderBottom: "1px solid #ccc", textAlign: "center" }}>
                            <th style={{ padding: "8px 12px" }}>Performance Name</th>
                            <th style={{ padding: "8px 12px" }}>Time</th>
                          </tr>
                        </thead>
                        <tbody>
                          {performanceDetails && performanceDetails.length > 0 ? (
                            performanceDetails.map((performance, index) => {
                              const startTime = new Date(performance.startTime);
                              const endTime = new Date(performance.endTime);
                              return (
                                <tr key={index} style={{ borderBottom: "1px solid #ddd" }}>
                                  <td style={{ padding: "8px 12px" }}>{performance.name}</td>
                                  <td style={{ padding: "8px 12px" }}>
                                    {startTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} -{" "}
                                    {endTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                  </td>
                                </tr>
                              );
                            })
                          ) : (
                            <tr>
                              <td colSpan="2" style={{ textAlign: "center", padding: "8px 12px" }}>
                                No performances available.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </Card.Body>
                </Card>
              </Col>

            </Row>
            <Row>

            </Row>

          </Col>
        </Row>
      </Container>
    );
  }
  return null;

}
