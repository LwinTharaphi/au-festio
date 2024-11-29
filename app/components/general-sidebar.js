import React from "react";
import { useRouter, useParams } from "next/navigation"; // Fix: use correct Next.js router import
import { Nav, Navbar } from "react-bootstrap";
import 'bootstrap/dist/css/bootstrap.min.css';
import './Sidebar.css';
import { BsGrid, BsPeople, BsPerson, BsBoxArrowRight, BsBell, BsLock } from "react-icons/bs"; // Add icons


export default function Sidebar() {
  const router = useRouter();
  const { id } = useParams();
  if (!id) {
    return <p>Loading...</p>; // Show a loading state if the ID is not available
  }

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
      <Nav.Link
          onClick={() => id && router.push(`/organizers/${id}/general-dashboard`)}
          className="sidebar-link my-2"
        >
          <BsGrid className="me-2" /> Dashboard
        </Nav.Link>

        {/* Profile */}
        <Nav.Link
          onClick={() => id && router.push(`/organizers/${id}/profile`)}
          className="sidebar-link my-2"
        >
          <BsPerson className="me-2" /> Profile
        </Nav.Link>

        {/* Events */}
        <Nav.Link
          onClick={() => router.push(`/organizers/${id}/create-event`)}
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
