"use client";
import { useRouter } from 'next/navigation';
import Sidebar from '../components/admin_sidebar';

export default function AdminDashboard() {
    const router = useRouter();

    const handleLogout = () => {
        router.push('/'); // Redirect to the main page
    };

    return (
        <div style={styles.container}>
            {/* Sidebar */}
            <div style={styles.sidebar}>
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

const styles = {
    container: {
        display: 'flex',
        height: '100vh',
        backgroundColor: '#f4f4f9',
    },
    sidebar: {
        width: '250px', // Fixed width for the sidebar
        backgroundColor: '#ffffff',
        boxShadow: '2px 0 5px rgba(0,0,0,0.1)',
        padding: '20px',
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
