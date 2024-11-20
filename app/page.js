"use client";
import { useRouter } from 'next/navigation';

export default function Home() {
    const router = useRouter();

    return (
        <div style={styles.pageContainer}>
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
    );
}

const styles = {
    pageContainer: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        backgroundColor: '#f0f2f5',
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
    buttonHover: {
        backgroundColor: '#0056b3',
        transform: 'scale(1.05)',
    },
};
