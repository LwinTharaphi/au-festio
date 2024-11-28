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

export default function Dashboard() {
  const { id } = useParams(); // Get eventId from URL parameters
  const route = useRouter();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const response = await fetch(`/api/events/${id}/dashboards`);
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
  }, [id]);

  if (loading)
    return (
      <div className="loading d-flex justify-content-center align-items-center">
        <Spinner animation="border" variant="primary" /> Loading...
      </div>
    );
  if (error) return <Alert variant="danger">Error: {error}</Alert>;

  const { stats, entryTimes, monthData, event, averageRating } = data;

  // Formatting Entry Times Data
  const timeLabels = Array.from(
    new Set(entryTimes.map((time) => new Date(time).toLocaleTimeString()))
  );
  const timeCounts = timeLabels.map((time) =>
    entryTimes.filter((t) => new Date(t).toLocaleTimeString() === time).length
  );

  // Formatting Monthly Crowd Flow Data
  const monthLabels = Object.keys(monthData).map(
    (month) => `Month ${+month + 1}`
  );
  const monthCounts = Object.values(monthData);
  

  return (
    <Container fluid>
      <Row>
        {/* Sidebar */}
        <Col
          xs={2}
          className="sidebar bg-white text-white p-3"
          style={{ minHeight: "100vh" }}
        >
          <Sidebar event={{ _id: id }} />
        </Col>

        {/* Main Content */}
        <Col xs={10} className="main-content p-4">
          <Breadcrumb>
            <Breadcrumb.Item href="/create-event">Create Events</Breadcrumb.Item>
            <Breadcrumb.Item href="/events">Events</Breadcrumb.Item>
            <Breadcrumb.Item active>{event.eventName}</Breadcrumb.Item>
          </Breadcrumb>
          <div className="d-flex aligh-items-center justify-content-between">
            <h1 className="display-5 mb-4 text-primary">
              {event.eventName} Dashboard
            </h1>
            <Button variant="primary"
              className="ms-3"
              onClick={()=> route.push(`/events/${id}/feedbacks`)}>
                View FeedBacks</Button>
          </div>

          {/* Statistics Cards */}
          <Row className="mb-4 g-4">
            <Col md={4}>
              <Card className="text-center shadow-sm">
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
            <Col md={4}>
              <Card className="text-center shadow-sm">
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
            <Col md={4}>
              <Card className="text-center shadow-sm">
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
          </Row>


          {/* Charts Section */}
          <Row className="g-4">
            <Col md={6}>
              <Card className="shadow-sm">
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
              <Card className="shadow-sm">
                <Card.Body>
                  <h5 className="text-center">Monthly Crowd Flow</h5>
                  <Bar
                    data={{
                      labels: monthLabels,
                      datasets: [
                        {
                          label: "Monthly Entries",
                          data: monthCounts,
                          backgroundColor: "rgba(255, 159, 64, 0.2)",
                          borderColor: "rgba(255, 159, 64, 1)",
                          borderWidth: 1,
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
                              `${tooltipItem.raw} entries`,
                          },
                        },
                      },
                      scales: {
                        x: {
                          title: { display: true, text: "Month" },
                        },
                        y: {
                          title: { display: true, text: "Number of Entries" },
                          beginAtZero: true,
                        },
                      },
                    }}
                  />
                </Card.Body>
              </Card>
            </Col>
          </Row>
          <Row>
            <Col md={4}>
              <Card className="text-center shadow-sm">
                <Card.Body className="d-flex flex-column align-items-center justify-content-center">
                  {/* Centered Big Star */}
                  <div className="mb-3">
                    <BsStarFill size={50} className="text-warning" />
                  </div>
                  
                  {/* Card Title */}
                  <Card.Title style={{ fontSize: "1.25rem", fontWeight: "bold" }}>
                    Average Rating
                  </Card.Title>
                  
                  {/* Rating Value */}
                  <Card.Text style={{ fontSize: "1.5rem", fontWeight: "normal" }}>
                    {averageRating.toFixed(1)}
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
          </Row>

        </Col>
      </Row>
    </Container>
  );
}
