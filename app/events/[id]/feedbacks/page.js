"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";

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

  return (
    <div style={{ padding: "20px" }}>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <h4 style={{ marginBottom: "20px", fontSize: "2rem" }}>
        Feedbacks for {eventName}
      </h4>
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
