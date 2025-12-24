import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Grid,
  CardMedia,
  Box,
} from "@mui/material";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import api from "../api";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import { Badge, IconButton } from "@mui/material";
import { useNotifications } from "../context/NotificationContext";

export default function BuyPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // form state
  const [item, setItem] = useState("");
  const [pickup, setPickup] = useState("");
  const [drop, setDrop] = useState("");
  const [fee, setFee] = useState("");
  const [imageUrl, setImageUrl] = useState("");        // NEW
  const [message, setMessage] = useState("");
  const { unreadCount } = useNotifications();
  const [buyOrders, setBuyOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBuyOrders = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    try {
      const { data } = await api.get("/orders/buy", {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setBuyOrders(data.filter((o) => o.status !== "CANCELLED"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBuyOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  if (!user) {
    return (
      <Typography sx={{ mt: 2 }}>
        Please log in to create buy requests and view your orders.
      </Typography>
    );
  }

  const handleCreateRequest = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      const { data } = await api.post(
        "/orders",
        {
          customItem: item,
          pickupLocation: pickup,
          dropLocation: drop,
          deliveryFee: fee,
          pickupMode: "DELIVERY",
          image: imageUrl || null,          // NEW: send to backend
        },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setMessage("Request posted.");
      setItem("");
      setPickup("");
      setDrop("");
      setFee("");
      setImageUrl("");                      // NEW: reset
      setBuyOrders((prev) => [data, ...prev]);
    } catch (err) {
      setMessage(
        err.response?.data?.message || "Could not create request. Try again."
      );
    }
  };

  const handleMarkDelivered = async (orderId) => {
    try {
      await api.post(
        `/orders/${orderId}/complete`,
        {},
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setBuyOrders((prev) =>
        prev.map((o) =>
          o._id === orderId ? { ...o, status: "COMPLETED" } : o
        )
      );
    } catch {
      // ignore for now
    }
  };

  const handleCancel = async (orderId) => {
    await api.delete(`/orders/${orderId}/cancel`, {
      headers: { Authorization: `Bearer ${user.token}` },
    });
    setBuyOrders((prev) => prev.filter((o) => o._id !== orderId));
  };

const getOrderColors = (status) => {
  switch (status) {
    case "COMPLETED":
      return { bg: "#e8f5e9", border: "#4caf50" }; // green

    case "DELIVERED_TO_BUYER":
      return { bg: "#fffde7", border: "#ffb300" }; // yellow

    case "RUNNER_TAKEN":
      return { bg: "#fff3e0", border: "#ffb74d" }; // orange

    case "RUNNER_GOING":
      return { bg: "#e3f2fd", border: "#1976d2" }; // blue strong

    case "SELLER_DELIVERED":
      return { bg: "#fffde7", border: "#ffb300" }; // your existing
    case "PICKED_FROM_SELLER":
      return { bg: "#fff3e0", border: "#ffb74d" };
    case "PICKUP_REQUESTED":
      return { bg: "#fce4ec", border: "#f06292" };
    case "ASSIGNED":
      return { bg: "#e3f2fd", border: "#0786edff" };

    default:
      return { bg: "#e3f2fd", border: "#64b5f6" }; // OPEN
  }
};

  const renderBuyOrderCard = (o) => {
    const isProductOrder = !!o.product;
    const title = isProductOrder ? o.product.title : o.customItem;
    const price = isProductOrder ? o.product.price : null;
    const { bg, border } = getOrderColors(o.status);
    const isCompleted = o.status === "COMPLETED";

    return (
      <Card
          key={o._id}
          sx={{
          borderRadius: 3,
          bgcolor: bg,
          border: `1px solid ${border}`,
          }}
      >
        
          <CardMedia
            component="img"
            height="120"
            image={isProductOrder
                ? o.product?.images?.[0] || "/placeholder.jpg"
                : o.image || "/placeholder.jpg"
          }
            alt={title}
          />
        

        <CardContent>
          <Typography variant="subtitle2" noWrap>
            {title}
          </Typography>
          {price != null && (
            <Typography variant="body2" color="primary">
              ₹{price}
            </Typography>
          )}
          {o.pickupLocation && (
            <Typography
              variant="caption"
              display="block"
              color="text.secondary"
            >
              Pickup: {o.pickupLocation}
            </Typography>
          )}
          {o.dropLocation && (
            <Typography
              variant="caption"
              display="block"
              color="text.secondary"
            >
              Drop: {o.dropLocation}
            </Typography>
          )}
          <Typography
            variant="caption"
            display="block"
            color="text.secondary"
          >
            Status: {o.status} · Delivery fee: ₹{o.deliveryFee || 0}
          </Typography>

          {o.runner && (
            <Button
              size="small"
              sx={{ mt: 1, mr: 1 }}
              variant="outlined"
              onClick={() => navigate(`/order/${o._id}`)}
            >
              Chat
            </Button>
          )}

          {/* Buyer receive button for self pickup */}
          {o.pickupMode === "SELF" && o.status === "SELLER_DELIVERED" && (
            <Button
              size="small"
              sx={{ mt: 1 }}
              variant="contained"
              color="success"
              onClick={() => handleMarkDelivered(o._id)}   // /complete
            >
            Mark as received
            </Button>
          )}

          {/* Buyer receive for delivery mode */}
          {o.pickupMode === "DELIVERY" && o.status === "DELIVERED_TO_BUYER" && (
            <Button
              size="small"
              sx={{ mt: 1 }}
              variant="contained"
              color="success"
              onClick={() => handleMarkDelivered(o._id)}
            >
              Mark as received
            </Button>
          )}

         
          {(o.status === "OPEN" || o.status === "ASSIGNED") && (
            <Button
              size="small"
              sx={{ mt: 1, ml: 1 }}
              variant="outlined"
              onClick={() => handleCancel(o._id)}
            >
              Cancel
            </Button>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <Box>
      {/* top bar: help + bell */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mt: 1,
          mb: 1.5,
        }}
      >
        <Box
          sx={{
            display: "inline-flex",
            alignItems: "center",
            px: 1.5,
            py: 0.5,
            borderRadius: 999,
            bgcolor: "#e3f2fd",
            color: "#0d47a1",
            cursor: "pointer",
            fontSize: 12,
            fontWeight: 500,
            boxShadow: "0 0 0 1px rgba(25, 118, 210, 0.3)",
            "&:hover": {
              bgcolor: "#bbdefb",
              boxShadow: "0 0 0 1px rgba(25, 118, 210, 0.6)",
            },
          }}
          onClick={() => navigate("/how-it-works")}
        >
          <InfoOutlinedIcon sx={{ fontSize: 16, mr: 0.5 }} />
          How does delivery work?
        </Box>

        <IconButton onClick={() => navigate("/notifications")}>
          <Badge
            color="error"
            badgeContent={unreadCount}
            invisible={unreadCount === 0}
          >
            <NotificationsNoneIcon />
          </Badge>
        </IconButton>
      </Box>

      {/* Create generic buy request */}
      <Card sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Request from khokha / city
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Describe what you want so someone else can bring it for you.
        </Typography>
        <Box component="form" onSubmit={handleCreateRequest} sx={{ mt: 1 }}>
          <TextField
            label="Item you want"
            fullWidth
            margin="normal"
            value={item}
            onChange={(e) => setItem(e.target.value)}
          />
          <TextField
            label="Pickup location (shop/area)"
            fullWidth
            margin="normal"
            value={pickup}
            onChange={(e) => setPickup(e.target.value)}
          />
          <TextField
            label="Deliver to (hostel/room)"
            fullWidth
            margin="normal"
            value={drop}
            onChange={(e) => setDrop(e.target.value)}
          />
          <TextField
            label="Delivery fee you're offering (₹)"
            type="number"
            fullWidth
            margin="normal"
            value={fee}
            onChange={(e) => setFee(e.target.value)}
          />

          {/* NEW: optional image URL for custom request */}
          <TextField
            label="Image URL (optional)"
            fullWidth
            margin="normal"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
          />

          {message && (
            <Typography variant="body2" color="primary" sx={{ mt: 1 }}>
              {message}
            </Typography>
          )}
          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{ mt: 2, borderRadius: 999 }}
          >
            Post request
          </Button>
        </Box>
      </Card>

      {/* My buy orders + requests */}
      <Typography variant="subtitle1" sx={{ mb: 1 }}>
        My Buy Requests & Orders
      </Typography>
      {loading ? (
        <Typography>Loading...</Typography>
      ) : buyOrders.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          You haven’t created any buy requests or orders yet.
        </Typography>
      ) : (
        <Grid container spacing={2}>
          {buyOrders.map((o) => (
            <Grid item xs={12} sm={6} key={o._id}>
              {renderBuyOrderCard(o)}
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
