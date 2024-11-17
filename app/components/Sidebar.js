import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Nav, Navbar } from "react-bootstrap";
import 'bootstrap/dist/css/bootstrap.min.css';
import './Sidebar.css';
import { BsGrid, BsPeople, BsShop, BsPerson, BsQrCodeScan, BsBoxArrowRight } from "react-icons/bs"; // Add icons

export default function Sidebar({ event }) {
  const router = useRouter();

  if (!event) {
    return <div className="sidebar-loading">Loading...</div>; // Handle loading state
  }

  return (
    <Navbar expand="lg" className="flex-column sidebar">
      <Navbar.Brand
        className="mb-4 logo"
        onClick={() => router.push('/dashboard')}
        style={{ cursor: "pointer" }}
      >
        <img
          src="/path/to/your-logo.png" // Replace with the actual path to your logo
          alt="Project Logo"
          className="logo-img"
        />
      </Navbar.Brand>

      <Nav className="flex-column">
        {/* Dashboard */}
        <Nav.Link
          onClick={() => router.push(`/events/${event._id}/dashboard`)}
          className="sidebar-link my-2"
        >
          <BsGrid className="me-2" /> Dashboard
        </Nav.Link>

        {/* Registered Students */}
        <Nav.Link
          onClick={() => router.push(`/events/${event._id}/students`)}
          className="sidebar-link my-2"
        >
          <BsPeople className="me-2" /> Registered Students
        </Nav.Link>

        {/* Booths */}
        <Nav.Link
          onClick={() => router.push(`/events/${event._id}/booths`)}
          className="sidebar-link my-2"
        >
          <BsShop className="me-2" /> Booths
        </Nav.Link>

        {/* Staffs */}
        <Nav.Link
          onClick={() => router.push(`/events/${event._id}/staffs`)}
          className="sidebar-link my-2"
        >
          <BsPerson className="me-2" /> Staffs
        </Nav.Link>

        {/* Scan QR */}
        <Nav.Link
          onClick={() => router.push(`/events/${event._id}/scan`)}
          className="sidebar-link my-2"
        >
          <BsQrCodeScan className="me-2" /> Scan QR
        </Nav.Link>

        {/* Logout */}
        <Nav.Link
          onClick={() => router.push(`/`)}
          className="sidebar-link my-2 text-danger"
        >
          <BsBoxArrowRight className="me-2" /> Logout
        </Nav.Link>
      </Nav>
    </Navbar>
  );
}
