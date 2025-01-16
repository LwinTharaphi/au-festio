"use client";
import { useRouter } from 'next/navigation';

export default function Home() {
    const router = useRouter();

    return (
        <div style={styles.pageContainer}>
            <div style={styles.leftColumn}>
                <div style={styles.logoContainer}>
                    <img
                        src="/logo.png"  // Replace with the correct path to your logo
                        alt="AU Festio Logo"
                        style={{
                            width: '180px',  // Adjust width as needed
                            height: 'auto',  // Maintain aspect ratio
                            marginBottom: '20px',  // Optional: space between logo and text
                            marginLeft: '80px',  // Optional: space to the left side
                            borderRadius: '15px',  // Adjust the value to make the corners more or less rounded
                        }}
                    />
                    <h1 style={styles.welcomeHeading}>Welcome to AU Festio</h1>
                    <p style={styles.description}>
                        Please choose your role to proceed.
                    </p>
                </div>
            </div>
            <div style={styles.rightColumn}>
                <div style={styles.cardContainer}>
                    <h1 style={styles.heading}>Choose Login Role</h1>
                    <div style={styles.buttonGroup}>
                        <button
                            style={styles.button}
                            onClick={() => router.push('/admin-login')}
                        >
                            Login as Admin
                        </button>
                        <button
                            style={styles.button}
                            onClick={() => router.push('/organizer-login')}
                        >
                            Login as Organizer
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

const styles = {
    pageContainer: {
        display: 'flex',
        flexDirection: 'row',
        height: '100vh',
        backgroundColor: '#f0f2f5',
    },
    leftColumn: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        background: 'linear-gradient(to bottom, #A67EEC, #005bb5)', // Fixed syntax
        color: '#fff',
        textAlign: 'center',
    },
    welcomeHeading: {
        fontSize: '32px',
        fontWeight: 'bold',
        marginBottom: '15px',
    },
    description: {
        fontSize: '18px',
        lineHeight: '1.5',
    },
    rightColumn: {
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
    },
    cardContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
        borderRadius: '15px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        padding: '30px',
        maxWidth: '400px',
        width: '100%',
        textAlign: 'center',
    },
    heading: {
        marginBottom: '20px',
        fontSize: '24px',
        fontWeight: 'bold',
        color: '#333',
    },
    buttonGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '15px',
        width: '100%',
    },
    button: {
        width: '100%',
        padding: '10px 15px',
        fontSize: '16px',
        color: '#fff',
        backgroundColor: '#007bff',
        border: 'none',
        borderRadius: '10px',
        cursor: 'pointer',
        transition: 'transform 0.2s, background-color 0.3s',
    },
};
