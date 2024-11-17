"use client";
import { useState, useEffect } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import { useParams } from "next/navigation";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Container, Row, Col, Nav, Navbar, Card, Spinner, Alert } from 'react-bootstrap';
import Sidebar from '@/app/components/Sidebar';

// Register the necessary components for Chart.js
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

  if (loading) return <div className="loading"><Spinner animation="border" variant="primary" /> Loading...</div>;
  if (error) return <Alert variant="danger">Error: {error}</Alert>;

  const { stats, entryTimes, monthData } = data;

  // Formatting time labels for Entry Times chart
  const timeLabels = entryTimes.map(time => new Date(time).toLocaleTimeString());
  const timeCounts = Array.from(new Set(entryTimes)).map(
    time => entryTimes.filter(t => t === time).length
  );

  // Formatting month labels for Monthly Crowd Flow chart
  const monthLabels = Object.keys(monthData).map(month => `Month ${+month + 1}`);
  const monthCounts = Object.values(monthData);

  return (
    <Container fluid>
      <Row>
        {/* Sidebar Section */}
        <Col xs={2.5} className="bg-dark text-white p-3" style={{ position: 'fixed', height: '100vh' }}>
          <Sidebar event={{_id: id}} />
        </Col>

        {/* Main Content Section */}
        <Col xs={10} style={{ marginLeft: '250px' }}>
          <div className="main-content" style={{ padding: '20px', backgroundColor: '#f9f9f9' }}>
            <h1 className="event-title">{data.event.name} Dashboard</h1>

            {/* Card Section for Statistics */}
            <Row className="mb-4">
              <Col>
                <Card>
                  <Card.Body>
                    <Card.Title>Total Registrations</Card.Title>
                    <Card.Text>{stats.totalRegistrations}</Card.Text>
                  </Card.Body>
                </Card>
              </Col>
              <Col>
                <Card>
                  <Card.Body>
                    <Card.Title>Booths Registered</Card.Title>
                    <Card.Text>{stats.boothsRegistered}</Card.Text>
                  </Card.Body>
                </Card>
              </Col>
              <Col>
                <Card>
                  <Card.Body>
                    <Card.Title>Check-Ins</Card.Title>
                    <Card.Text>{stats.checkIns}</Card.Text>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            <div className="charts-container">
              <h2>Entry Times</h2>
              <Line
                data={{
                  labels: timeLabels,
                  datasets: [{
                    label: 'Entries Over Time',
                    data: timeCounts,
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1,
                    tension: 0.4, // Smooth curve
                  }],
                }}
                options={{
                  responsive: true,
                  plugins: {
                    title: {
                      display: true,
                      text: 'User Entry Times',
                    },
                    tooltip: {
                      callbacks: {
                        label: function(tooltipItem) {
                          return `${tooltipItem.label}: ${tooltipItem.raw} people`;
                        },
                      },
                    },
                  },
                  scales: {
                    x: {
                      title: {
                        display: true,
                        text: 'Time of Day',
                      },
                    },
                    y: {
                      title: {
                        display: true,
                        text: 'Number of People',
                      },
                      beginAtZero: true,
                    },
                  },
                }}
              />

              <h2>Monthly Crowd Flow</h2>
              <Bar
                data={{
                  labels: monthLabels,
                  datasets: [{
                    label: 'Monthly Entries',
                    data: monthCounts,
                    backgroundColor: 'rgba(255, 159, 64, 0.2)',
                    borderColor: 'rgba(255, 159, 64, 1)',
                    borderWidth: 1,
                  }],
                }}
                options={{
                  responsive: true,
                  plugins: {
                    title: {
                      display: true,
                      text: 'Crowd Flow by Month',
                    },
                    tooltip: {
                      callbacks: {
                        label: function(tooltipItem) {
                          return `${tooltipItem.label}: ${tooltipItem.raw} people`;
                        },
                      },
                    },
                  },
                  scales: {
                    x: {
                      title: {
                        display: true,
                        text: 'Month',
                      },
                    },
                    y: {
                      title: {
                        display: true,
                        text: 'Number of Entries',
                      },
                      beginAtZero: true,
                    },
                  },
                }}
              />
            </div>
          </div>
        </Col>
      </Row>
    </Container>
  );
}
