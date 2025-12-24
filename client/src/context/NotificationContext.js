import { createContext, useContext, useEffect, useState } from "react";
import api from "../api";
import { useAuth } from "./AuthContext";

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    const fetchNotifs = async () => {
      try {
        const { data } = await api.get("/notifications", {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setNotifications(data);
        setUnreadCount(data.filter((n) => !n.isRead).length);
      } catch {
        // ignore for now
      }
    };

    fetchNotifs();
    const id = setInterval(fetchNotifs, 20000); // 20s poll
    return () => clearInterval(id);
  }, [user]);

  return (
    <NotificationContext.Provider
      value={{ notifications, unreadCount, setNotifications, setUnreadCount }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotifications = () => useContext(NotificationContext);
