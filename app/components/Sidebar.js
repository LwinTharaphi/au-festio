import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Nav, Navbar } from "react-bootstrap";
import 'bootstrap/dist/css/bootstrap.min.css';
import './Sidebar.css';

export default function Sidebar() {
  const router = useRouter();

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
        <Nav.Link as={Link} href={`/dashboard`} className="my-2">
          Dashboard
        </Nav.Link>
        <Nav.Link as={Link} href={`/dashboard/students`} className="my-2">
          Registered Students
        </Nav.Link>
        <Nav.Link as={Link} href="/dashboard/booths" className="my-2">
          Booths
        </Nav.Link>
        <Nav.Link as={Link} href="/dashboard/stuffs" className="my-2">
          Staffs
        </Nav.Link>
        <Nav.Link as={Link} href="/dashboard/scan-qr" className="my-2">
          Scan QR
        </Nav.Link>
        <Nav.Link as={Link} href="/logout" className="my-2">
          Logout
        </Nav.Link>
      </Nav>
    </Navbar>
  );
}


