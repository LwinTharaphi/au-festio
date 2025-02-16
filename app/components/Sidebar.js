import React from "react";
import { useRouter } from "next/navigation";
import { Nav, Navbar } from "react-bootstrap";
import 'bootstrap/dist/css/bootstrap.min.css';
import './Sidebar.css';
import {
  BsGrid,
  BsPeople,
  BsShop,
  BsPerson,
  BsQrCodeScan,
  BsBell,
  BsClock
} from "react-icons/bs"; // Add icons
import { usePathname } from "next/navigation";

export default function Sidebar({ event }) {
  const router = useRouter();
  const pathname = usePathname();

  if (!event) {
    return <div className="sidebar-loading">Loading...</div>; // Handle loading state
  }

  const isActive = (path) => pathname === path ? 'active' : '';

  return (
    <Navbar expand="lg" className="flex-column sidebar">
      <Navbar.Brand
        className="mb-4 logo"
        onClick={() => router.push('/dashboard')}
        style={{ cursor: "pointer" }}
      >
        <img
          src="/logo.png"
          alt="Project Logo"
          style={{
            width: '130px',  // Adjust width
            height: '70px',  // Maintain aspect ratio
            marginLeft: '30px',  // Add space to the left side (adjust as needed)  
            objectFit: 'contain'  // Fit the image inside the container
          }}
        />
      </Navbar.Brand>

      <Nav className="flex-column">
        {/* Dashboard */}
        <Nav.Link
          onClick={() => router.push(`/events/${event._id}/dashboard`)}
          className={`sidebar-link my-2 text-start ${isActive(`/events/${event._id}/dashboard`)}`}
        >
          <BsGrid className="me-2" /> Dashboard
        </Nav.Link>

        {/* Performance Schedule */}
        <Nav.Link
          onClick={() => router.push(`/events/${event._id}/performance-schedule`)}
          className={`sidebar-link my-2 text-start ${isActive(`/events/${event._id}/performance-schedule`)}`}
        >
          <BsClock className="me-2" /> Performance Schedule
        </Nav.Link>

        {/* Registered Students */}
        <Nav.Link
          onClick={() => router.push(`/events/${event._id}/students`)}
          className={`sidebar-link my-2 text-start ${isActive(`/events/${event._id}/students`)}`}
        >
          <BsPeople className="me-2" /> Registered Students
        </Nav.Link>

        {/* Booths */}
        <Nav.Link
          onClick={() => router.push(`/events/${event._id}/booths`)}
          className={`sidebar-link my-2 text-start ${isActive(`/events/${event._id}/booths`)}`}
        >
          <BsShop className="me-2" /> Booths
        </Nav.Link>

        {/* Staffs */}
        <Nav.Link
          onClick={() => router.push(`/events/${event._id}/staffs`)}
          className={`sidebar-link my-2 text-start ${isActive(`/events/${event._id}/staffs`)}`}
        >
          <BsPerson className="me-2" /> Staffs
        </Nav.Link>

        {/* Scan QR */}
        <Nav.Link
          onClick={() => router.push(`/events/${event._id}/scanQR`)}
          className={`sidebar-link my-2sidebar-link my-2 text-start ${isActive(`/events/${event._id}/scan`)}`}
        >
          <BsQrCodeScan className="me-2" /> Scan QR
        </Nav.Link>

      </Nav>
    </Navbar>
  );
}
