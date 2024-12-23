"use client"
import React from "react";
import { useRouter, useParams } from "next/navigation"; // Fix: use correct Next.js router import
import { Nav, Navbar } from "react-bootstrap";
import 'bootstrap/dist/css/bootstrap.min.css';
import './Sidebar.css';
import { BsGrid, BsPeople, BsPerson, BsBoxArrowRight, BsBell, BsLock } from "react-icons/bs"; // Add icons

import { signOut } from "next-auth/react";
import { useSession } from "next-auth/react";
export default function Sidebar() {
  const {data: session} = useSession();

  const router = useRouter();
  // const { id } = useParams();
  if (!session) {
    return <p>Loading...</p>; // Show a loading state if the ID is not available
  }

  const userId = session.user?.id || session.user?._id

  return (
    <Navbar expand="lg" className="flex-column sidebar">
      <Navbar.Brand
        className="mb-4 logo"
        onClick={() => router.push(`/organizers/${userId}/general-dashboard`)} // Direct to dashboard
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
          onClick={() => userId && router.push(`/organizers/${userId}/general-dashboard`)}
          className="sidebar-link my-2"
        >
          <BsGrid className="me-2" /> Dashboard
        </Nav.Link>

        {/* Profile */}
        <Nav.Link
          onClick={() => userId && router.push(`/organizers/${userId}/profile`)}
          className="sidebar-link my-2"
        >
          <BsPerson className="me-2" /> Profile
        </Nav.Link>

        {/* Events */}
        <Nav.Link
          onClick={() => router.push(`/organizers/${userId}/create-event`)}
          className="sidebar-link my-2"
        >
          <BsPeople className="me-2" /> Events
        </Nav.Link>

        {/* Logout */}
        <Nav.Link
          onClick={() => signOut()} // Log out user
          className="sidebar-link my-2 text-danger"
        >
          <BsBoxArrowRight className="me-2" /> Logout
        </Nav.Link>
      </Nav>
    </Navbar>
  );
}
