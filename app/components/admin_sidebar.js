import React from "react";
import { useRouter } from "next/navigation"; // Fix: use correct Next.js router import
import { Nav, Navbar } from "react-bootstrap";
import 'bootstrap/dist/css/bootstrap.min.css';
import './Sidebar.css';
import { BsPeople, BsPerson, BsBoxArrowRight, BsBell, BsLock } from "react-icons/bs"; // Add icons
import { signOut } from "next-auth/react";

export default function Sidebar() {

  const router = useRouter();

  return (
    <Navbar expand="lg" className="flex-column sidebar">
      <Navbar.Brand
        className="mb-4 logo"
        onClick={() => router.push('/admin-dashboard')} // Direct to dashboard
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
          onClick={() => router.push(`/admin-dashboard`)}
          className="sidebar-link my-2"
        >
          <BsPerson className="me-2" /> Dashboard
        </Nav.Link>

        {/* Events */}
        <Nav.Link
          onClick={() => router.push(`/event-organizers`)}
          className="sidebar-link my-2"
        >
          <BsPeople className="me-2" /> EventOrganizer
        </Nav.Link>

        {/* Logout */}
        <Nav.Link
          onClick={() => signOut()}// Log out user
          className="sidebar-link my-2 text-danger"
        >
          <BsBoxArrowRight className="me-2" /> Logout
        </Nav.Link>
      </Nav>
    </Navbar>
  );
}
