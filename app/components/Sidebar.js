import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Nav, Navbar } from "react-bootstrap";
import 'bootstrap/dist/css/bootstrap.min.css';
import './Sidebar.css';

export default function Sidebar({event}) {
  const router = useRouter();
  if (!event) {
    return <div>Loading...</div>; // Handle cases where `event` isn't available yet
  }

  return (
    <Navbar expand="lg" className="flex-column sidebar">
      <Navbar.Brand className="mb-4 logo" onClick={() => router.push('/dashboard')}>
        <img
          src="/path/to/your-logo.png" // Replace with the actual path to your logo
          alt="Project Logo"
          className="logo-img"
        />
      </Navbar.Brand>

      <Nav className="flex-column">
        <Nav.Link onClick={()=> router.push(`/events/${event._id}/dashboard`)} className="my-2">
          Dashboard
        </Nav.Link>
        <Nav.Link onClick={()=> router.push(`/events/${event._id}/students`)} className="my-2">
          Registered Students
        </Nav.Link>
        <Nav.Link onClick={()=> router.push(`/events/${event._id}/booths`)} className="my-2">
          Booths
        </Nav.Link>
        <Nav.Link onClick={()=> router.push(`/events/${event._id}/staffs`)} className="my-2">
          Staffs
        </Nav.Link>
        <Nav.Link onClick={()=> router.push(`/`)} className="my-2">
          Scan QR
        </Nav.Link>
        <Nav.Link onClick={()=> router.push(`/`)} className="my-2">
          Logout
        </Nav.Link>
      </Nav>
    </Navbar>
  );
}


