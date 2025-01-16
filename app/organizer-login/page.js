'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { text } from '@fortawesome/fontawesome-svg-core';

export default function OrganizerLogin() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const [otpEmail, setOtpEmail] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordChangeMessage, setPasswordChangeMessage] = useState('');
  const [passwordReset, setPasswordReset] = useState(false);


  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        role: "organizer",
        redirect: false,
      });

      if (result.error) {
        setError(result.error || 'Something went wrong');
        setMessage('');
        return;
      } else {
        const response = await fetch('/api/auth/session');
        const session = await response.json();
        if (!session?.user?.id) {
          setError('Unable to retrieve user information');
          return;
        }
        setMessage("Login successful! Redirecting...");
        router.push(`/organizers/${session.user.id}/general-dashboard`);
      }
    } catch (err) {
      setError('An unexpected error occurred');
    }
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!otpEmail) {
      setError('Please enter your email to send OTP');
      return;
    }

    try {
      const response = await fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: otpEmail }),
      });

      const data = await response.json();

      if (response.ok) {
        setOtpSent(true);
        setMessage('OTP sent successfully to your email.');
      } else {
        setError(data.message || 'Failed to send OTP.');
      }
    } catch (err) {
      setError('An unexpected error occurred while sending OTP.');
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!otp) {
      setError('Please enter the OTP');
      return;
    }

    try {
      const response = await fetch('/api/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: otpEmail, otp }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('OTP verified! You can now reset your password.');
        setPasswordReset(true);
      } else {
        setError(data.message || 'Invalid OTP. Please try again.');
      }
    } catch (err) {
      setError('An unexpected error occurred while verifying OTP.');
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();

    if (!newPassword || !confirmPassword) {
      setPasswordChangeMessage("Please fill in both password fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordChangeMessage("New password and confirmation do not match.");
      return;
    }

    try {
      const response = await fetch(`/api/event-organizers/reset-password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          'otp-email': otpEmail,
        },
        body: JSON.stringify({

          isOtpVerified: true,
          newPassword,
          confirmPassword,
        }), // sending only the new password
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('Error:', error.error);
        return;
      }
      else {
        const loginResult = await signIn("credentials", {
          email: otpEmail,
          password: newPassword,
          role: "organizer",
          redirect: false, // Prevent automatic redirection
        });
        console.log(otpEmail)
        console.log(newPassword)

        if (loginResult.error) {
          setError(loginResult.error || "Failed to log in after password reset");
          return;
        }

        // Refresh session to ensure the user data is updated
        const updatedSession = await fetch("/api/auth/session");
        const session = await updatedSession.json();
        if (!session?.user?.id) {
          setError('Unable to retrieve user information');
          return;
        }
        setMessage("Password reset successful! Redirecting...");
        router.push(`/organizers/${session.user.id}/general-dashboard`);
      }
    } catch (error) {
      console.error('Error:', error.message);
    }
  };

  return (
    <div className="page">
      <div className="left-section">
        <div style={styles.logoContainer}>
          <img
            src="/logo.png"  // Replace with the correct path to your logo
            alt="AU Festio Logo"
            style={{
              width: '180px',  // Adjust width as needed
              height: 'auto',  // Maintain aspect ratio
              marginBottom: '20px',  // Optional: space between logo and text
              marginLeft: '130px',  // Optional: space to the left side
              borderRadius: '15px',  // Adjust the value to make the corners more or less rounded
            }}
          />
          <h1 style={styles.welcomeHeading}>Welcome to AU Festio</h1>
          <p style={styles.description}>Your one-stop solution for managing events effortlessly.</p>
        </div>
      </div>
      <div className="right-section">
        {!showForgotPassword ? (
          <div style={styles.pageContainer}>
            <div style={styles.cardContainer}>
              <h3 style={styles.heading}>Sign In</h3>
              <form onSubmit={handleSubmit}>
                <div style={styles.inputGroup}>
                  <input
                    type="email"
                    style={styles.input}
                    placeholder="Email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
                <div style={styles.inputGroup}>
                  <input
                    type="password"
                    style={styles.input}
                    placeholder="Password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                  />
                </div>
                <button type="submit" style={styles.button}>
                  Sign In
                </button>
                <p
                  style={styles.forgotPassword}
                  onClick={() => setShowForgotPassword(true)}
                >
                  Forgot password?
                </p>
              </form>
              {message && <p style={styles.successMessage}>{message}</p>}
              {error && <p style={styles.errorMessage}>{error}</p>}
            </div>
          </div>
        ) : (
          <div style={styles.pageContainer}>
            <div style={styles.cardContainer}>
              <h3 style={styles.heading}>Forgot Password</h3>
              {!otpSent ? (
                <form onSubmit={handleSendOtp}>
                  <div style={styles.inputGroup}>
                    <input
                      type="email"
                      style={styles.input}
                      placeholder="Enter your email"
                      value={otpEmail}
                      onChange={(e) => setOtpEmail(e.target.value)}
                      required
                    />
                  </div>
                  <button type="submit" style={styles.button}>
                    Send OTP
                  </button>
                </form>
              ) : !passwordReset ? (
                <form onSubmit={handleOtpSubmit}>
                  <div style={styles.inputGroup}>
                    <input
                      type="text"
                      style={styles.input}
                      placeholder="Enter OTP"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      required
                    />
                  </div>
                  <button type="submit" style={styles.button}>
                    Verify OTP
                  </button>
                </form>
              ) : (
                <form onSubmit={handlePasswordReset}>
                  <div style={styles.inputGroup}>
                    <input
                      type="password"
                      style={styles.input}
                      placeholder="New Password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                  </div>
                  <div style={styles.inputGroup}>
                    <input
                      type="password"
                      style={styles.input}
                      placeholder="Confirm New Password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                  <button type="submit" style={styles.button}>
                    Reset Password
                  </button>
                </form>
              )}
              {message && <p style={styles.successMessage}>{message}</p>}
              {error && <p style={styles.errorMessage}>{error}</p>}
            </div>
          </div>
        )}
      </div>
      <style jsx>{`
        .page {
          display: flex;
          height: 100vh;
        }
        .left-section {
          flex: 1;
          background: linear-gradient(to bottom,#A67EEC, #005bb5);
          color: white;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          padding: 20px;
        }
        .left-section h2 {
          font-size: 2rem;
          margin-bottom: 10px;
        }
        .right-section {
          flex: 1;
          padding: 40px;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        form {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }
        .input-group {
          display: flex;
          flex-direction: column;
        }
        input {
          padding: 10px;
          font-size: 16px;
          border: 1px solid #ccc;
          border-radius: 4px;
        }
        button {
          padding: 10px 20px;
          font-size: 16px;
          cursor: pointer;
          background: #0070f3;
          color: white;
          border: none;
          border-radius: 4px;
        }
        .forgot-password {
          margin-top: 10px;
          color: #0070f3;
          cursor: pointer;
          text-align: right;
        }
        .forgot-password:hover {
          text-decoration: underline;
        }
        .message {
          margin-top: 15px;
        }
        .message.success {
          color: green;
        }
        .message.error {
          color: red;
        }
        .otp-message {
          margin-top: 10px;
          font-size: 14px;
          color: #555;
        }
      `}</style>
    </div>
  );

}

const styles = {
  pageContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  cardContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: '15px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    padding: '30px',
    maxWidth: '400px',
    width: '100%',
    textAlign: 'center',
  },
  welcomeHeading: {
    fontSize: '32px',
    fontWeight: 'bold',
    marginBottom: '15px',
    textAlign: 'center',
  },
  description: {
    fontSize: '18px',
    lineHeight: '1.5',
  },
  heading: {
    marginBottom: '20px',
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#333',
  },
  inputGroup: {
    marginBottom: '5px',
  },
  input: {
    width: '100%',
    padding: '10px',
    fontSize: '16px',
    border: '1px solid #ccc',
    borderRadius: '10px',
  },
  button: {
    width: '100%',
    padding: '10px',
    fontSize: '16px',
    color: '#fff',
    backgroundColor: '#007bff',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
  },
  forgotPassword: {
    marginTop: '15px',
    fontSize: '14px',
    color: '#007bff',
    cursor: 'pointer',
  },
  successMessage: {
    marginTop: '10px',
    color: '#28a745',
  },
  errorMessage: {
    marginTop: '10px',
    color: '#dc3545',
  },
};