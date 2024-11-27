import React from "react";
import { useRouter } from "next/navigation"; // Fix: use correct Next.js router import
import { Nav, Navbar } from "react-bootstrap";
import 'bootstrap/dist/css/bootstrap.min.css';
import './Sidebar.css';
import { BsPeople, BsPerson, BsBoxArrowRight, BsBell, BsLock } from "react-icons/bs"; // Add icons


export default function Sidebar() {
  const router = useRouter();

  return (
    <Navbar expand="lg" className="flex-column sidebar">
      <Navbar.Brand
        className="mb-4 logo"
        onClick={() => router.push('/dashboard')} // Direct to dashboard
        style={{ cursor: "pointer" }}
      >
        <img
          src="/path/to/your-logo.png" // Replace with the actual path to your logo
          alt="Project Logo"
          className="logo-img"
        />
      </Navbar.Brand>

      <Nav className="flex-column">
        {/* Profile */}
        <Nav.Link
          onClick={() => router.push(`/profile`)}
          className="sidebar-link my-2"
        >
          <BsPerson className="me-2" /> Profile
        </Nav.Link>

        {/* Events */}
        <Nav.Link
          onClick={() => router.push(`/create-event`)}
          className="sidebar-link my-2"
        >
          <BsPeople className="me-2" /> Events
        </Nav.Link>

        {/* Logout */}
        <Nav.Link
          onClick={() => router.push(`/`)} // Log out user
          className="sidebar-link my-2 text-danger"
        >
          <BsBoxArrowRight className="me-2" /> Logout
        </Nav.Link>
      </Nav>
    </Navbar>
  );
}
