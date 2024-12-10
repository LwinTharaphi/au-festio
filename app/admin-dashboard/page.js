"use client";
import { useRouter } from 'next/navigation';
import Sidebar from '../components/admin_sidebar';
import { signOut } from "next-auth/react";
import { useEffect } from 'react';
import { useSession } from 'next-auth/react'
import { Spinner } from 'react-bootstrap';

export default function AdminDashboard() {
    const {data: session, status} = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === "loading") return;  // Don't redirect while loading
        if (status === 'unauthenticated' || session?.user?.role !== "admin"){
          router.push('/')
        }
    });

    const handleLogout = () => {
        signOut() // Redirect to the main page
    };

    if (status === 'loading'){
        return (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100vh",
              flexDirection: "column",
            }}
          >
            <Spinner animation="border" variant="primary" role="status" style={{ width: "2rem", height: "2rem" }}>
              <span className="visually-hidden">Loading...</span>
            </Spinner>
            <p style={{ marginTop: "1rem", fontSize: "1.2rem", fontWeight: "500", color: "#007bff" }}>
              Loading...
            </p>
          </div>
        );
      }
    
    if(status === 'authenticated' && session.user.role === "admin"){
        return (
            <div style={styles.container}>
                {/* Sidebar */}
                <div>
                    <Sidebar />
                </div>
    
                {/* Main Content */}
                <div style={styles.mainContent}>
                    <h1 style={styles.heading}>Admin Dashboard</h1>
                    <button style={styles.button} onClick={handleLogout}>
                        Logout
                    </button>
                </div>
            </div>
        );
    }
    return null;

}

const styles = {
    container: {
        display: 'flex',
        height: '100vh',
        backgroundColor: '#f4f4f9',
    },
    mainContent: {
        flex: 1, // Main content takes the remaining space
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
    },
    heading: {
        marginBottom: '20px',
        fontSize: '24px',
        fontWeight: 'bold',
        color: '#333',
    },
    button: {
        padding: '10px 20px',
        fontSize: '16px',
        color: '#fff',
        backgroundColor: '#007bff',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
    },
};
