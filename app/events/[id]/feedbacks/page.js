"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Dropdown } from "react-bootstrap";
import 'bootstrap/dist/css/bootstrap.min.css';

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
  const [eventName, setEventName] = useState("");
  const router = useRouter();
  const [eventsList, setEventsList] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [error, setError] = useState(null);
  const { id } = useParams(); // Event ID from URL parameters

  useEffect(() => {
    const fetchEventData = async () => {
      setError(null); // Clear previous errors before fetching data
      try {
        const response = await fetch(`/api/events/${id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch event data.");
        }
        const event = await response.json();
        setEventName(event.eventName); // Set the event name
      } catch (err) {
        setError(err.message);
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

    if (id) {
      fetchEventData();
      fetchFeedbacks();
    }
  }, [id]);

  useEffect(() => {
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
  
    fetchEventsList();
  }, []);

  const handleEventChange = (id) => {
    router.push(`/events/${id}/feedbacks`);
  };

  return (
    <div style={{ padding: "20px" }}>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <h4 style={{ marginBottom: "20px", fontSize: "2rem" }}>
        Feedbacks for {eventName}
      </h4>
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
    </div>
  );
}