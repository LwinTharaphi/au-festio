"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import QrScanner from "qr-scanner";
import { useParams } from "next/navigation";
import { useSession } from 'next-auth/react';

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
    if (!result || !result.data) {
      setScanStatus("Invalid QR");
      setScanResult("");
      resetProcessing();
      return;
    }

    const qrData = result.data;
    const qrParts = qrData.split(",");

    if (qrParts.length !== 2) {
      setScanStatus("Invalid QR");
      setScanResult("");
      resetProcessing();
      return;
    }

    const [eventIdFromQR, studentIdFromQR] = qrParts;

    if (eventIdFromQR !== eventId) {
      setScanStatus("Invalid QR");
      setScanResult("");
      resetProcessing();
      return;
    }

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
    backgroundColor: "#007bff",
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
