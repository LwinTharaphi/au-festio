"use client";
import { useRouter, useParams } from 'next/navigation';
import React from 'react';
import Sidebar from "../../../components/general-sidebar";
import { Container, Row, Col, Button } from 'react-bootstrap'; // Using React Bootstrap for layout
import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { Spinner } from 'reactstrap';

export default function Dashboard()  {
  const {data: session, status } = useSession();
  const router = useRouter();
  const { id } = useParams();
  console.log(session)

  useEffect(() => {
    if (status === "loading") return;  // Don't redirect while loading
    if (status === 'unauthenticated' || session?.user?.role !== "organizer"){
      router.push('/')
    }
    if (status === 'authenticated' && session?.user && session.user.role === "organizer"){
      const userId = session.user.id
      if(userId){
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
      }
    }
  }, [id,router,session,status]);
  
  if (status === 'loading'){
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

  if(status === 'authenticated' && session.user.role === "organizer"){
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
                View History</Button>
                </div>     
                <p>Welcome to the Dashboard!</p>
          {/* Example widgets */}
          <Row>
            <Col md={4}>
              <div className="widget" style={{ border: '1px solid #ccc', padding: '20px' }}>
                <h4>Widget 1</h4>
                <p>Some stats or content for Widget 1.</p>
              </div>
            </Col>
            <Col md={4}>
              <div className="widget" style={{ border: '1px solid #ccc', padding: '20px' }}>
                <h4>Widget 2</h4>
                <p>Some stats or content for Widget 2.</p>
              </div>
            </Col>
            <Col md={4}>
              <div className="widget" style={{ border: '1px solid #ccc', padding: '20px' }}>
                <h4>Widget 3</h4>
                <p>Some stats or content for Widget 3.</p>
              </div>
            </Col>
          </Row>
        </Container>
      </div>
    </div>
    )
  }
  return null;
};


