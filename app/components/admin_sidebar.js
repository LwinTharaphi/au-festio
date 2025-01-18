import React from "react";
import { useRouter } from "next/navigation"; // Fix: use correct Next.js router import
import { Nav, Navbar } from "react-bootstrap";
import 'bootstrap/dist/css/bootstrap.min.css';
import './Sidebar.css';
import { BsPeople, BsGrid, BsBoxArrowRight, BsBell, BsLock } from "react-icons/bs"; // Add icons
import { signOut } from "next-auth/react";
import { usePathname } from "next/navigation";

export default function Sidebar() {

  const router = useRouter();
  const pathname = usePathname();
  const isActive = (path) => pathname === path ? 'active' : '';

  return (
    <Navbar expand="lg" className="flex-column sidebar">
      <Navbar.Brand
        className="mb-4 logo"
        onClick={() => router.push('/admin-dashboard')} // Direct to dashboard
        style={{ cursor: "pointer" }}
      >
        <img
          src="/logo2.png"
          alt="Project Logo"
          style={{
            width: '130px',  // Adjust width
            height: '70px',  // Maintain aspect ratio
            marginLeft: '30px',  // Add space to the left side (adjust as needed)
            objectFit: 'contain'  // Maintain aspect ratio
          }}
        />
      </Navbar.Brand>

      <Nav className="flex-column">
        <Nav.Link
          onClick={() => router.push(`/admin-dashboard`)}
          className={`sidebar-link my-2 text-start ${isActive(`/admin-dashboard`)}`}
        >
          <BsGrid className="me-2" /> Dashboard
        </Nav.Link>

        {/* Events */}
        <Nav.Link
          onClick={() => router.push(`/event-organizers`)}
          className={`sidebar-link my-2 text-start ${isActive(`/event-organizers`)}`}
        >
          <BsPeople className="me-2" /> EventOrganizer
        </Nav.Link>

        {/* Logout */}
        <Nav.Link
          onClick={() => signOut()}// Log out user
          className="sidebar-link my-2 text-start text-danger"
        >
          <BsBoxArrowRight className="me-2" /> Logout
        </Nav.Link>
      </Nav>
    </Navbar>
  );
}
