import { createContext, useState, useEffect, useContext } from "react";
import { useSession } from "next-auth/react";

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { data: session, status } = useSession();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (status !== "authenticated" || !session?.user?.id) return;

    const userId = session.user.id;
    const eventSource = new EventSource(`/api/organizers/${userId}/notifications`);

    eventSource.onmessage = (event) => {
      const newNotification = JSON.parse(event.data);
      setNotifications((prev) => [newNotification, ...prev]);
      console.log("New notification:", newNotification);
      alert(`New notification: ${newNotification.title}`);
    };

    eventSource.onerror = (error) => {
      console.error("EventSource failed:", error);
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
