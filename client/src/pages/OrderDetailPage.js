import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, Typography, Button, Box } from "@mui/material";
import api from "../api";
import { useAuth } from "../context/AuthContext";

export default function OrderDetailPage() {
  const { id } = useParams(); // order id
  const { user } = useAuth();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data } = await api.get(`/orders/${id}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setOrder(data);
    };
    load();
  }, [id, user]);

  if (!user || !order) return null;

  const title = order.product ? order.product.title : order.customItem;

  const handleClaim = async () => {
    await api.post(
      `/orders/${order._id}/claim`,
      {},
      { headers: { Authorization: `Bearer ${user.token}` } }
    );
    const { data } = await api.get(`/orders/${id}`, {
      headers: { Authorization: `Bearer ${user.token}` },
    });
    setOrder(data);
  };

  const handleChat = async () => {
    const otherId =
      user._id === order.buyer._id ? order.runner._id : order.buyer._id;

    const { data: convo } = await api.post(
      "/chat/conversation",
      { receiverId: otherId, orderId: order._id },
      { headers: { Authorization: `Bearer ${user.token}` } }
    );
    navigate(`/chat/${convo._id}`);
  };

  const handleCancel = async () => {
  await api.delete(`/orders/${order._id}/cancel`, {
    headers: { Authorization: `Bearer ${user.token}` },
  });
  // update local state so UI reflects cancellation
  setOrder((prev) => ({ ...prev, status: "CANCELLED" }));
  // optionally navigate back:
  // navigate(-1);
};


  return (
    <Card sx={{ borderRadius: 3 }}>
      <CardContent>
        <Typography variant="h6">{title}</Typography>
        <Typography variant="body2" sx={{ mt: 1 }}>
          Pickup: {order.pickupLocation}
        </Typography>
        <Typography variant="body2">Drop: {order.dropLocation}</Typography>
        <Typography variant="body2">
          Fee: ₹{order.deliveryFee} · Status: {order.status}
        </Typography>

        <Box sx={{ mt: 2, display: "flex", gap: 1 }}>
          {order.status === "OPEN" && user._id !== order.buyer._id && (
            <Button variant="contained" onClick={handleClaim}>
              Accept delivery
            </Button>
          )}
          {order.status === "ASSIGNED" && (
            <Button variant="outlined" onClick={handleChat}>
              Chat
            </Button>
          )}

          {order.buyer._id === user._id &&
            (order.status === "OPEN" || order.status === "ASSIGNED") && (
            <Button
              variant="contained"
              color="error"
              onClick={handleCancel}
            >
             Cancel order
            </Button>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}
