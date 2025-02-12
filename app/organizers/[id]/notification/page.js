"use client";
import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Container, Row, Col, Table, Button, Spinner } from "react-bootstrap";
import Sidebar from "../../../components/general-sidebar";
import "../../../components/Sidebar.css";
import { useSession } from 'next-auth/react';
import { useNotifications } from "../../../NotificationProvider";

export default function NotificationPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const { id: organizerId } = useParams();
    const [loading, setLoading] = useState(true);
    const { notifications, setNotifications } = useNotifications(); // Get notifications from context

    useEffect(() => {
        if (status === "loading") return;  // Don't redirect while loading
        if (status === 'unauthenticated' || session?.user?.role !== "organizer") {
            router.push('/');
            return;
        }

        if (status === 'authenticated' && session?.user?.role === "organizer") {
            const userId = session.user.id;
            const eventSource = new EventSource(`/api/organizers/${userId}/notifications/sse`);

            eventSource.onmessage = function(event) {
                const notification = JSON.parse(event.data);
                console.log('New notification:', notification);
                setNotifications(prevNotifications => {
                    const isDuplicate = prevNotifications.some(notif => notif.notificationId === notification.notificationId);
                    if (isDuplicate) {
                        return prevNotifications;
                    }
                    return [notification, ...prevNotifications];
                });
            };

            eventSource.onerror = function(error) {
                console.error('EventSource failed:', error);
                eventSource.close();
            };

            const fetchNotifications = async () => {
                try {
                    const response = await fetch(`/api/organizers/${userId}/notifications`);
                    if (!response.ok) {
                        throw new Error("Failed to fetch notifications.");
                    }
                    const data = await response.json();
                    setNotifications(data);
                } catch (error) {
                    console.error("Error fetching notifications:", error);
                } finally {
                    setLoading(false);
                }
            };

            fetchNotifications();

            return () => {
                eventSource.close();
            };
        }
    }, [router, session, status, setNotifications]);

    const handleMarkAsRead = async (notificationId) => {
        const userId = session.user.id;
        if (!userId) return;
        await fetch(`/api/organizers/${userId}/notifications/${notificationId}`, {
            method: 'PATCH', // PATCH request to mark notification as read
        });
        setNotifications((prev) =>
            prev.map((notif) =>
                notif.notificationId === notificationId
                    ? { ...notif, read: true }
                    : notif
            )
        );
    };

    if (loading || status === "loading") {
        return (
            <div
                style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "100vh",
                    flexDirection: "column",
                    backgroundColor: '#F3EFFD'
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

    if (!notifications || notifications.length === 0) {
        return (
            <div>
                <Sidebar />
                <Container>
                    <h2>Notifications</h2>
                    <p>No notifications available.</p>
                </Container>
            </div>
        );
    }

    return (
        <div>
            <Sidebar />
            <Container>
                <h2>Notifications</h2>
                <Row>
                    <Col>
                        <Table striped bordered hover responsive>
                            <thead>
                                <tr>
                                    <th>Title</th>
                                    <th>Body</th>
                                    <th>Time</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {notifications.map((notification, index) => (
                                    <tr key={index}>
                                        <td>{notification.title}</td>
                                        <td>{notification.body}</td>
                                        <td>{new Date(notification.sentAt).toLocaleString()}</td>
                                        <td>
                                            {!notification.read && (
                                                <Button variant="primary" onClick={() => handleMarkAsRead(notification.notificationId)}>
                                                    Mark as Read
                                                </Button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </Col>
                </Row>
            </Container>
        </div>
    );
}