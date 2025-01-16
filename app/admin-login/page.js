"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

export default function AdminLogin() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const router = useRouter();

    const handleLogin = async (e) => {
        e.preventDefault();

        const result = await signIn("credentials", {
            redirect: false,
            username,
            password,
            role: "admin",
        });

        if (result.error) {
            setError(result.error);
        } else {
            router.push("/admin-dashboard");
        }
    };

    return (
        <div style={styles.pageContainer}>
            {/* Left Column */}
            <div style={styles.leftColumn}>
            <div style={styles.logoContainer}>
                    <img
                        src="/logo.png"  // Replace with the correct path to your logo
                        alt="AU Festio Logo"
                        style={{
                            width: '180px',  // Adjust width as needed
                            height: 'auto',  // Maintain aspect ratio
                            marginBottom: '20px',  // Optional: space between logo and text
                            marginLeft: '90px',  // Optional: space to the left side
                            borderRadius: '15px',  // Adjust the value to make the corners more or less rounded
                        }}
                    />
                <h1 style={styles.brandText}>Welcome Back, Admin</h1>
                <p style={styles.subText}>
                    Manage your platform efficiently and securely.
                </p>
            </div>
            </div>

            {/* Right Column */}
            <div style={styles.rightColumn}>
                <div style={styles.cardContainer}>
                    <h1 style={styles.heading}>Admin Login</h1>
                    <form onSubmit={handleLogin} style={styles.form}>
                        <input
                            type="text"
                            placeholder="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            style={styles.input}
                        />
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={styles.input}
                        />
                        <button type="submit" style={styles.button}>
                            Login
                        </button>
                        {error && <p style={styles.error}>{error}</p>}
                    </form>
                </div>
            </div>
        </div>
    );
}

const styles = {
    pageContainer: {
        display: "flex",
        flexDirection: "row",
        height: "100vh",
        backgroundColor: "#f0f2f5",
    },
    leftColumn: {
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(to bottom, #A67EEC, #005bb5)",
        color: "#fff",
        padding: "20px",
        textAlign: "center",
    },
    rightColumn: {
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
    },
    cardContainer: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#fff",
        borderRadius: "15px",
        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
        padding: "30px",
        maxWidth: "400px",
        width: "100%",
        textAlign: "center",
    },
    brandText: {
        fontSize: "32px",
        fontWeight: "bold",
        marginBottom: "10px",
    },
    subText: {
        fontSize: "18px",
        marginBottom: "20px",
    },
    heading: {
        marginBottom: "20px",
        fontSize: "24px",
        fontWeight: "bold",
        color: "#333",
    },
    form: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: "100%",
    },
    input: {
        width: "100%",
        padding: "10px",
        marginBottom: "15px",
        border: "1px solid #ccc",
        borderRadius: "5px",
        fontSize: "16px",
    },
    button: {
        width: "100%",
        padding: "10px",
        fontSize: "16px",
        color: "#fff",
        backgroundColor: "#007bff",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
        transition: "transform 0.2s, background-color 0.3s",
    },
    buttonHover: {
        backgroundColor: "#0056b3",
        transform: "scale(1.05)",
    },
    error: {
        marginTop: "15px",
        color: "red",
        fontSize: "14px",
    },
};
