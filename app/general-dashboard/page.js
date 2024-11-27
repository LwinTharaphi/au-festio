"use client";
import React from 'react';
import Sidebar from "../components/general-sidebar";
import { Container, Row, Col } from 'react-bootstrap'; // Using React Bootstrap for layout

export default function Dashboard()  {
  return (
    <div style={{ display: 'flex' }}>
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main content area */}
      <div style={{ flex: 1, padding: '20px' }}>
        <Container>
          <Row>
            <Col>
              <h3>Dashboard</h3>
              <p>Welcome to the Dashboard!</p>
            </Col>
          </Row>

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
  );
};


