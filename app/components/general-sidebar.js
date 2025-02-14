"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { Nav, Navbar } from "react-bootstrap";
import 'bootstrap/dist/css/bootstrap.min.css';
import './Sidebar.css';
import { BsGrid, BsPeople, BsPerson, BsBoxArrowRight, BsClockHistory, BsBell } from "react-icons/bs"; // Add icons

import { signOut } from "next-auth/react";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation"; // Import usePathname from next/navigation
import { useEffect, useState } from "react";
import { useNotifications } from "../NotificationProvider";

export default function Sidebar() {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname(); // Use usePathname to get the current path
  // const [unreadCount , setUnReadCount] = useState(0);
  const { unreadCount } = useNotifications();
  const userId = session?.user?.id;

  const isActive = (path) => pathname === path ? 'active' : ''; // Function to check if the link is active

  return (
    <Navbar className="sticky-top navbar-light bg-light" style={{width: '100%'}}> 
      <Navbar.Brand
        className="logo"
        onClick={() => router.push(`/organizers/${userId}/general-dashboard`)} // Direct to dashboard
        style={{ cursor: "pointer" }}
      >
        <img
          src="/logo2.png"
          alt="Project Logo"
          style={{
            width: '130px',  // Adjust width
            height: '70px',  // Maintain aspect ratio
            marginLeft: '30px',  // Add space to the left side (adjust as needed)
            objectFit: 'contain',  // Maintain image aspect ratio
          }}
        />

      </Navbar.Brand>

      {/* <Navbar.Toggle aria-controls="navbar-nav" /> */}
      {/* <Navbar.Collapse id="navbar-nav" className="justify-content-end"> Align items to the right */}
      <div className="navbar-container" style={{ display: 'flex', flexDirection: 'row', flexWrap: 'nowrap' }}>
        <Nav className="ml-auto navbar-nav">
          <Nav.Link
            onClick={() => userId && router.push(`/organizers/${userId}/general-dashboard`)}
            className={`navbar-link me-10 d-flex align-items-center ${isActive(`/organizers/${userId}/general-dashboard`)}`} // Apply active class conditionally
          >
            <BsGrid className="me-2" />
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
            onClick={() => router.push(`/organizers/${userId}/history`)}
            className={`navbar-link me-10 d-flex align-items-center ${isActive(`/organizers/${userId}/history`)}`} // Apply active class conditionally
          >
            <BsClockHistory className="me-2" /> History
          </Nav.Link>
          <Nav.Link
            onClick={() => router.push(`/organizers/${userId}/notification`)}
            className={`navbar-link me-10 d-flex align-items-center ${isActive(`/organizers/${userId}/notification`)}`} // Apply active class conditionally
          >
            <BsBell className="me-2" /> Notification
            {unreadCount > 0 && <span className="badge bg-danger">{unreadCount}</span>}
          </Nav.Link>

          <Nav.Link
            onClick={() => signOut()} // Log out user
            className="navbar-link me-10 text-danger d-flex align-items-center"
          >
            <BsBoxArrowRight className="me-2 " /> Logout
          </Nav.Link>
        </Nav>
      </div>
      {/* </Navbar.Collapse> */}
    </Navbar>
  );
}
