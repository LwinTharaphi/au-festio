'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react'

export default function OrganizerLogin() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      const result = await signIn('credentials',{
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

        if(!session?.user?.id){
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

  return (
    <div className="container">
      <h3>Welcome to Event Organizer</h3>
      <h4>Sign In</h4>

      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          required
        />
        <button type="submit">Sign In</button>
      </form>

      {message && <p className="message success">{message}</p>}
      {error && <p className="message error">{error}</p>}

      <style jsx>{`
        .container {
          max-width: 400px;
          margin: 50px auto;
          text-align: center;
          padding: 20px;
          border: 1px solid #ccc;
          border-radius: 8px;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
        }
        input {
          width: 100%;
          margin: 10px 0;
          padding: 10px;
          font-size: 16px;
        }
        button {
          padding: 10px 20px;
          font-size: 16px;
          cursor: pointer;
          border: none;
          background: #0070f3;
          color: white;
          border-radius: 4px;
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
      `}</style>
    </div>
  );
}
