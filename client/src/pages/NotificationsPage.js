import {
  Box,
  Typography,
  List,
  ListItemButton,
  ListItemText,
  Chip,
} from "@mui/material";
import { useNotifications } from "../context/NotificationContext";
import { useAuth } from "../context/AuthContext";
import api from "../api";
import { useNavigate } from "react-router-dom";

export default function NotificationsPage() {
  const { notifications, setNotifications, setUnreadCount } =
    useNotifications();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleRead = async (notif) => {
    if (!user || notif.isRead) {
      if (notif.order) navigate(`/order/${notif.order}`);
      return;
    }

    await api.post(
      `/notifications/${notif._id}/read`,
      {},
      { headers: { Authorization: `Bearer ${user.token}` } }
    );

    setNotifications((prev) =>
      prev.map((n) => (n._id === notif._id ? { ...n, isRead: true } : n))
    );
    setUnreadCount((c) => Math.max(0, c - 1));

    if (notif.order) navigate(`/order/${notif.order}`);
  };

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 1 }}>
        Notifications
      </Typography>

      {notifications.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          No notifications yet.
        </Typography>
      ) : (
        <List>
          {notifications.map((n) => (
            <ListItemButton
              key={n._id}
              onClick={() => handleRead(n)}
              sx={{
                opacity: n.isRead ? 0.6 : 1,
              }}
            >
              <ListItemText
                primary={
                  <>
                    {n.title}{" "}
                    {!n.isRead && (
                      <Chip
                        label="New"
                        size="small"
                        color="primary"
                        sx={{ ml: 1 }}
                      />
                    )}
                  </>
                }
                secondary={n.message}
              />
            </ListItemButton>
          ))}
        </List>
      )}
    </Box>
  );
}
