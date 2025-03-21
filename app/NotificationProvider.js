import { createContext, useState, useEffect, useContext } from "react";
import { useSession } from "next-auth/react";
import { ToastContainer, Toast } from "react-bootstrap";

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { data: session, status } = useSession();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch unread notifications from database when the user logs in
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        if (status === "loading") return;  // Don't redirect while loading
        if (status === 'unauthenticated' || session?.user?.role !== "organizer") {
          router.push('/')
          return;
        }

        if (status === "authenticated" && session.user.role === "organizer") {
          const res = await fetch(`/api/organizers/${session.user.id}/notifications`);
          if (!res.ok) throw new Error("Failed to fetch notifications");
          const data = await res.json();
          setNotifications(data);
          setUnreadCount(data.length);
        }
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    fetchNotifications();
  }, [session, status]);

  // Real-time notifications using SSE
  useEffect(() => {
    if (status !== "authenticated" || !session?.user?.id) return;

    const userId = session.user.id;
    const notifications = () => {
      try {
        if (status === "loading") return;  // Don't redirect while loading
        if (status === 'unauthenticated' || session?.user?.role !== "organizer") {
          router.push('/')
          return;
        }

        if (status === "authenticated" && session.user.role === "organizer") {
          const eventSource = new EventSource(`/api/organizers/${userId}/notifications/sse`);

          eventSource.onmessage = (event) => {
            const newNotification = JSON.parse(event.data);
            setNotifications((prev) => {
              if (!prev.some((notif) => notif.notificationId === newNotification.notificationId)) {
                setUnreadCount((prevCount) => prevCount + 1);
                return [newNotification, ...prev];
              }
              return prev;
            });
          };
          console.log("Notification", eventSource);
      
          eventSource.onerror = () => {
            console.error("SSE connection lost, attempting to reconnect...");
            eventSource.close();
          };

          return () => {
            eventSource.close();
          };
        }
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };
    notifications();
  }, [session, status]);

  // Mark notification as read and remove it from the UI
  const removeNotification = async (notificationId) => {
    setNotifications((prev) => prev.filter((notif) => notif.notificationId !== notificationId));
    setUnreadCount((prevCount) => prevCount - 1);

    try {
      await fetch(`/api/organizers/${session?.user?.id}/notifications/${notificationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ read: true }),
      });
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  return (
    <NotificationContext.Provider value={{ notifications, setNotifications, unreadCount }}>
      {children}
      {status === "authenticated" && session.user.role === "organizer" && notifications.length>0 &&(
        <ToastContainer position="bottom-end" className="p-3" style={{ position: 'fixed', bottom: 0, right: 0, zIndex: 1050 }}>
          {notifications.map((notification) => (
            <Toast key={notification.notificationId} onClose={() => removeNotification(notification.notificationId)} autohide delay={5000}>
              <Toast.Header closeButton={true}>
                <strong className="me-auto">{notification.title}</strong>
                <small>{new Date(notification.sentAt).toLocaleString()}</small>
              </Toast.Header>
              <Toast.Body>{notification.body}</Toast.Body>
            </Toast>
          ))}
        </ToastContainer>
      )}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
