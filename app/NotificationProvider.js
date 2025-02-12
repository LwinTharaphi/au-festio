import { createContext, useState, useEffect, useContext } from "react";
import { useSession } from "next-auth/react";

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { data: session, status } = useSession();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (status !== "authenticated" || !session?.user?.id) return;

    const userId = session.user.id;
    const eventSource = new EventSource(`/api/organizers/${userId}/notifications/sse`);

    eventSource.onmessage = (event) => {
      const newNotification = JSON.parse(event.data);
      setNotifications((prev) => {
        if (!prev.some((notif) => notif.notificationId === newNotification.notificationId)) {
          return [newNotification, ...prev];
        }
        return prev;
      });
      console.log("New notification:", newNotification);
    };

    eventSource.onerror = (error) => {
      console.error("EventSource failed:", error);
      if (error instanceof Error) {
        console.error("Error message:", error.message);
      } else {
        console.error("Unknown error:", error);
      }
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [session, status]);

  return (
    <NotificationContext.Provider value={{ notifications, setNotifications }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);