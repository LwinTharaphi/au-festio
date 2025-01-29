"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Container, Row, Col } from "react-bootstrap";
import QrScanner from "qr-scanner";
import { useParams } from "next/navigation";
import { useSession } from 'next-auth/react';
import Sidebar from "../../../components/Sidebar";
import "../../../components/Sidebar.css";

export default function ScanQRPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { id: eventId } = useParams();
  const userId = session?.user?.id;
  const [scanResult, setScanResult] = useState("");
  const [scanStatus, setScanStatus] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [processing, setProcessing] = useState(false); // To debounce scanning

  useEffect(() => {
    if (status === "loading") return;  // Don't redirect while loading
    if (status === 'unauthenticated' || session?.user?.role !== "organizer") {
      router.push('/');
      return;
    }
    if (status === 'authenticated' && session?.user?.role === "organizer") {
      const video = document.getElementById("qr-video");
      const qrScanner = new QrScanner(video, (result) => {
        if (!processing) {
          setProcessing(true);
          handleScan(result);
        }
      });

      if (isScanning) {
        qrScanner.start().catch((error) => {
          console.error("Error starting QR scanner: ", error);
        });
      } else {
        qrScanner.stop();
      }

      return () => {
        qrScanner.stop(); // Cleanup on unmount
      };
    }
  }, [status, isScanning, session, router]);

  const handleScan = (result) => {
    console.log("QR Scanner Result:", result); // Debug: Log the result object

    // Validate that result is a string and not undefined or null
    if (!result) {
      console.error("No result in QR scan.");
      setScanStatus("Invalid QR");
      setScanResult("");
      resetProcessing();
      return;
    }

    // Process the raw QR data
    const qrData = result.trim(); // Trim to remove any unexpected whitespace
    const qrParts = qrData.split(","); // Split by the comma delimiter

    // Ensure the QR code contains exactly two parts
    if (qrParts.length !== 2) {
      setScanStatus("Invalid QR");
      setScanResult("");
      resetProcessing();
      return;
    }

    const [eventIdFromQR, studentIdFromQR] = qrParts;

    // Check if the scanned Event ID matches the current Event ID
    if (eventIdFromQR !== eventId) {
      console.warn(`Event ID mismatch: Expected ${eventId}, got ${eventIdFromQR}`);
      setScanStatus("Invalid Event ID");
      setScanResult("");
      resetProcessing();
      return;
    }

    console.log(`Valid QR Data: Event ID: ${eventIdFromQR}, Student ID: ${studentIdFromQR}`);
    checkStudentCheckIn(studentIdFromQR, eventIdFromQR);
  };

  const checkStudentCheckIn = async (studentId, eventId) => {
    try {
      const response = await fetch(`/api/organizers/${userId}/events/${eventId}/students/${studentId}`, {
        method: "POST",
      });
      const data = await response.json();

      if (data.message === "This student has already checked in.") {
        setScanStatus("This student has already checked in.");
        setScanResult("");
      } else if (data.success) {
        setScanStatus("Successfully checked in!");
        setScanResult(`Student ID: ${studentId} is checked in.`);
      } else {
        setScanStatus("Invalid QR");
        setScanResult("");
      }
    } catch (error) {
      console.error("Error checking student check-in: ", error);
      setScanStatus("Error scanning QR");
      setScanResult("");
    } finally {
      resetProcessing();
    }
  };

  const resetProcessing = () => {
    setTimeout(() => {
      setScanStatus("");
      setScanResult("");
      setProcessing(false);
    }, 2000); // Adjust the delay for feedback display
  };

  return (
    <Container fluid>
      <Row>
        <Col xs={3} md={2} className="sidebar">
          <Sidebar event={{ _id: eventId }} />
        </Col>
        <Col xs={9} md={10} className="main-content" style={{ backgroundColor: "#F3EFFD" }}>
          <Container>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#F3EFFD' }}>
              <div style={styles.container}>
                <h1 style={styles.title}>Scan QR Code for Event Check-in</h1>
                <div style={styles.videoWrapper}>
                  <video id="qr-video" style={styles.video}></video>
                  <div style={styles.line}></div>
                </div>
                <div style={styles.statusWrapper}>
                  <p style={{ color: scanStatus === "Successfully checked in!" ? "green" : "red" }}>
                    {scanStatus}
                  </p>
                  <p>{scanResult}</p>
                </div>
                <button onClick={() => setIsScanning(!isScanning)} style={styles.button}>
                  {isScanning ? "Stop Scanning" : "Start Scanning"}
                </button>
              </div>
            </div>
          </Container>
        </Col>
      </Row>
    </Container>
  );
}

const styles = {
  container: {
    textAlign: "center",
    fontFamily: "Arial, sans-serif",
    padding: "20px",
  },
  title: {
    marginBottom: "20px",
    fontSize: "24px",
    color: "#333",
  },
  videoWrapper: {
    position: "relative",
    width: "200px",
    height: "200px",
    margin: "0 auto",
    border: "2px solid #ccc",
    borderRadius: "10px",
    overflow: "hidden",
  },
  video: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  line: {
    position: "absolute",
    width: "100%",
    height: "2px",
    backgroundColor: "red",
    top: "0",
    animation: "move 5s infinite",
  },
  statusWrapper: {
    marginTop: "20px",
  },
  button: {
    padding: "10px 20px",
    fontSize: "16px",
    color: "#fff",
    backgroundColor: "#A67EEC",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
};

// Add the animation inline
if (typeof document !== "undefined") {
  const style = document.createElement("style");
  style.innerHTML = `
    @keyframes move {
      0% { top: 0; }
      50% { top: 90%; }
      100% { top: 0; }
    }

    .scanning-line {
      animation: move 5s infinite; /* Increased duration to 3 seconds */
    }
  `;
  document.head.appendChild(style);
}
