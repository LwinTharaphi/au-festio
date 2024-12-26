"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { Nav, Navbar } from "react-bootstrap";
import 'bootstrap/dist/css/bootstrap.min.css';
import './Sidebar.css';
import { BsGrid, BsPeople, BsPerson, BsBoxArrowRight } from "react-icons/bs"; // Add icons

import { signOut } from "next-auth/react";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation"; // Import usePathname from next/navigation

export default function Sidebar() {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname(); // Use usePathname to get the current path

  if (!session) {
    return <p>Loading...</p>; // Show a loading state if the session is not available
  }

  const userId = session.user?.id || session.user?._id;

  const isActive = (path) => pathname === path ? 'active' : ''; // Function to check if the link is active

  return (
    <Navbar expand="lg" className="sticky-top navbar-light bg-light">
      <Navbar.Brand
        className="logo"
        onClick={() => router.push(`/organizers/${userId}/general-dashboard`)} // Direct to dashboard
        style={{ cursor: "pointer" }}
      >
        <img
          src="/path/to/your-logo.png" // Replace with the actual path to your logo
          alt="Project Logo"
          className="logo-img"
        />
      </Navbar.Brand>

      <Navbar.Toggle aria-controls="navbar-nav" />
      <Navbar.Collapse id="navbar-nav" className="justify-content-end"> {/* Align items to the right */}
        <Nav>
          <Nav.Link
            onClick={() => userId && router.push(`/organizers/${userId}/general-dashboard`)}
            className={`navbar-link me-10 d-flex align-items-center ${isActive(`/organizers/${userId}/general-dashboard`)}`} // Apply active class conditionally
          >
            <BsGrid className="me-2" /> {/* Icon */}
            Dashboard {/* Text */}
          </Nav.Link>

          <Nav.Link
            onClick={() => userId && router.push(`/organizers/${userId}/profile`)}
            className={`navbar-link me-10 d-flex align-items-center ${isActive(`/organizers/${userId}/profile`)}`} // Apply active class conditionally
          >
            <BsPerson className="me-2" /> Profile
          </Nav.Link>

          <Nav.Link
            onClick={() => router.push(`/organizers/${userId}/create-event`)}
            className={`navbar-link me-10 d-flex align-items-center ${isActive(`/organizers/${userId}/create-event`)}`} // Apply active class conditionally
          >
            <BsPeople className="me-2" /> Events
          </Nav.Link>

          <Nav.Link
            onClick={() => signOut()} // Log out user
            className="navbar-link me-10 text-danger d-flex align-items-center"
          >
            <BsBoxArrowRight className="me-2 " /> Logout
          </Nav.Link>
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
}
