"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Spinner } from "react-bootstrap";
import Sidebar from "../../../components/general-sidebar";

export default function NotificationsPage() {
  const { data: session, status } = useSession();
  const userId = session?.user?.id;
  const router = useRouter();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    const fetchNotifications = async () => {
      try {
        if (status === "loading") return;  // Don't redirect while loading
        if (status === 'unauthenticated' || session?.user?.role !== "organizer") {
          router.push('/')
        }
        if ( status === 'authenticated' && session?.user?.role === "organizer") {
            setLoading(true);
            const res = await fetch(`/api/organizers/${session.user.id}/notifications/bulk`);
            if (!res.ok) throw new Error("Failed to fetch notifications");
            const data = await res.json();
            setNotifications(data);
        }
      } catch (error) {
        console.error("Error fetching notifications:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [session, status, router]);

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

  if (status === "authenticated" && session.user.role === "organizer") {
    return (
        <div style={{ backgroundColor: '#F3EFFD' }}>
            <Sidebar />
            <div className="container" style={{ backgroundColor: '#F3EFFD' }}>
                <h3 className="mb-4 mt-4">Notification</h3>
                {notifications.length === 0 ? (
                    <p className="text-gray-600">No notifications found.</p>
                ) : (
                    <div className="bg-white shadow-md rounded-lg p-4">
                    <ul className="divide-y divide-gray-200">
                        {notifications.map((notification) => (
                        <li
                            key={notification.notificationId}
                            className={`py-4 flex justify-between items-center ${!notification.read ? 'bg-yellow-100' : ''}`}
                        >
                            <div>
                            <h2 className="text-lg font-semibold text-gray-800">{notification.title}</h2>
                            <p className="text-gray-600 mt-1">{notification.body}</p>
                            <small className="text-gray-500 block mt-1">
                                {new Date(notification.sentAt).toLocaleString()}
                            </small>
                            </div>
                            {!notification.read && (
                            <span className="text-sm text-red-500 font-medium">Unread</span>
                            )}
                        </li>
                        ))}
                    </ul>
                    </div>
                )}
        </div>
      </div>
    );
  }
  return null;
}
