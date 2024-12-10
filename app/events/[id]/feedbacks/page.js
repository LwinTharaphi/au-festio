"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Dropdown, Spinner } from "react-bootstrap";
import 'bootstrap/dist/css/bootstrap.min.css';
import { useSession } from 'next-auth/react';

// Function to render stars
const renderStars = (rating) => {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    stars.push(
      <span
        key={i}
        style={{
          color: i <= rating ? "gold" : "gray",
          fontSize: "1.5rem",
        }}
      >
        ★
      </span>
    );
  }
  return stars;
};

export default function FeedbackPage() {
  const {data: session, status} = useSession();
  const [eventName, setEventName] = useState("");
  const router = useRouter();
  const [eventsList, setEventsList] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { id } = useParams(); // Event ID from URL parameters

  useEffect(() => {
    if (status === "loading") return;  // Don't redirect while loading
    if (status === 'unauthenticated' || session?.user?.role !== "organizer"){
      router.push('/')
    }
    if (status === 'authenticated' && session?.user && session.user.role === "organizer"){
      const userId = session.user.id
      if(userId){
        const fetchEventData = async () => {
          setError(null); // Clear previous errors before fetching data
          try {
            setLoading(true);
            const response = await fetch(`/api/events/${id}`);
            if (!response.ok) {
              throw new Error("Failed to fetch event data.");
            }
            const event = await response.json();
            setEventName(event.eventName); // Set the event name
          } catch (err) {
            setError(err.message);
          } finally {
            setLoading(false);
          }
        };
    
        const fetchFeedbacks = async () => {
          try {
            const response = await fetch(`/api/events/${id}/feedbacks`);
            if (!response.ok) {
              throw new Error("Failed to fetch feedbacks.");
            }
            const feedbackData = await response.json();
            setFeedbacks(feedbackData); // Set the fetched feedbacks
          } catch (err) {
            setError(err.message);
          }
        };
        const fetchEventsList = async () => {
          try {
            const response = await fetch("/api/events");
            if (!response.ok) {
              throw new Error("Failed to fetch events list.");
            }
            const data = await response.json();
            setEventsList(data);
            console.log("Fetched events:", data); // Log the fetched events
          } catch (err) {
            setError(err.message);
          }
        };
    
        if (id) {
          fetchEventData();
          fetchFeedbacks();
        }
        fetchEventsList();
      }
    }
  }, [id,router,session,status]);

  const handleEventChange = (id) => {
    router.push(`/events/${id}/feedbacks`);
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

  if (status === 'authenticated' && session.user.role === "organizer"){
    return (
      <div style={{ padding: "20px" }}>
        {error && <p style={{ color: "red" }}>{error}</p>}
        <button
          onClick={() => router.back()}
          style={{
            marginBottom: "20px",
            padding: "10px 20px",
            fontSize: "1rem",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Back To the {eventName}
        </button>
        <h4 style={{ marginBottom: "20px", fontSize: "2rem" }}>
          Feedbacks for {eventName}
        </h4>
        {loading ? (
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
            ) : (
              <>
        <Dropdown className="mb-4" style={{ textAlign: "right" }}>
          <Dropdown.Toggle variant="secondary" id="dropdown-basic">
            Select Event
          </Dropdown.Toggle>
          <Dropdown.Menu>
            {eventsList.length > 0 ? (
              eventsList.map((event) => (
                <Dropdown.Item key={event._id} onClick={() => handleEventChange(event._id)}>
                  {event.eventName}
                </Dropdown.Item>
              ))
            ) : (
              <Dropdown.Item disabled>No events found</Dropdown.Item>
            )}
          </Dropdown.Menu>
        </Dropdown>
        {feedbacks.length > 0 ? (
          feedbacks.map((feedback) => (
            <div
              key={feedback._id}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                border: "1px solid #ccc",
                borderRadius: "8px",
                padding: "15px",
                marginBottom: "10px",
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
              }}
            >
              <div>
                <h4 style={{ margin: 0 }}>Feedback</h4>
                <p style={{ margin: "5px 0", color: "#555" }}>
                  {feedback.suggestion}
                </p>
              </div>
              <div style={{ textAlign: "right" }}>
                <div>{renderStars(feedback.stars)}</div>
              </div>
            </div>
          ))
        ) : (
          <p>No feedbacks available for this event.</p>
        )}
        </>
       )}
      </div>
    );

  }
  return null;
}
