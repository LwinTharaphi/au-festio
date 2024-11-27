"use client";
import React from "react";
import Sidebar from "../components/general-sidebar"; // Sidebar import
import { Container, Row, Col, Card } from "react-bootstrap"; // Using React Bootstrap components for layout

export default function Profile() {
  return (
    <div style={{ display: 'flex' }}>
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main content area */}
      <div style={{ flex: 1, padding: '20px' }}>
        <Container>       
              <h1>Profile</h1>
              <p>Manage your account settings and personal information here.</p>           
        </Container>
      </div>
    </div>
  );
};


