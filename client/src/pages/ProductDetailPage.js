import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  Button,
  CircularProgress,
  Box,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import api from "../api";
import { useAuth } from "../context/AuthContext";

export default function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { user } = useAuth();
  const [orderError, setOrderError] = useState("");
  const [ordering, setOrdering] = useState(false);
  const [pickupMode, setPickupMode] = useState("SELF");

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await api.get(`/products/${id}`);
        setProduct(data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load product");
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !product) {
    return (
      <Typography color="error" sx={{ mt: 2 }}>
        {error || "Product not found"}
      </Typography>
    );
  }

  // NEW: check if current user is the seller
  const isOwnProduct =
    user && product.seller && product.seller._id === user._id;

  const handleOrder = async () => {
    if (!user) {
      navigate("/login");
      return;
    }
    if (isOwnProduct) {
      setOrderError("You cannot place an order on your own listing.");
      return;
    }

    setOrdering(true);
    setOrderError("");
    try {
      await api.post(
        "/orders",
        {
          productId: product._id,
          pickupLocation: product.hostel || product.seller?.hostel,
          dropLocation: user.hostel || "Hostel",
          deliveryFee: pickupMode === "DELIVERY" ? 20 : 0,
          pickupMode,
        },
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      );
      setOrdering(false);
      alert("Order placed!");
    } catch (err) {
      setOrdering(false);
      setOrderError(err.response?.data?.message || "Could not place order");
    }
  };

  const handleChat = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    const { data: convo } = await api.post(
      "/chat/conversation",
      { receiverId: product.seller._id, productId: product._id },
      {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      }
    );

    navigate(`/chat/${convo._id}`);
  };

  const isSeller =
  user && product?.seller && product.seller._id === user._id;

const handleCancelListing = async () => {
  await api.delete(`/products/${product._id}/cancel`, {
    headers: { Authorization: `Bearer ${user.token}` },
  });
  // optional: redirect to home
  navigate("/");
};

  return (
    <Card sx={{ borderRadius: 3 }}>
      <CardMedia
        component="img"
        height="260"
        image={product.images?.[0] || "/placeholder.jpg"}
        alt={product.title}
      />
      <CardContent>
        <Typography variant="h5">{product.title}</Typography>
        <Typography variant="h6" color="primary" sx={{ mt: 1 }}>
          ₹{product.price}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mt: 1, whiteSpace: "pre-line" }}
        >
          {product.description}
        </Typography>

        <Typography variant="body2" sx={{ mt: 2 }}>
          Category: {product.category}
        </Typography>
        <Typography variant="body2">
          Seller: {product.seller?.name} ({product.seller?.hostel},{" "}
          {product.seller?.department})
        </Typography>

        {/* pickup mode selector */}
        {!isOwnProduct && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" sx={{ mb: 1 }}>
              How will you get it?
            </Typography>
            <ToggleButtonGroup
              exclusive
              size="small"
              color="primary"
              value={pickupMode}
              onChange={(_, val) => val && setPickupMode(val)}
            >
              <ToggleButton value="SELF">I will pick up</ToggleButton>
              <ToggleButton value="DELIVERY">Someone will deliver</ToggleButton>
            </ToggleButtonGroup>
          </Box>
        )}

        <Box sx={{ mt: 3, display: "flex", gap: 1 }}>
          <Button variant="contained" onClick={handleChat} fullWidth>
            Chat with seller
          </Button>

          {isSeller && (
           <Button
             variant="outlined"
             color="error"
             fullWidth
             onClick={handleCancelListing}
           >
            Cancel listing
           </Button>
          )}

          {!isOwnProduct && (
            <Button
              variant="outlined"
              onClick={handleOrder}
              fullWidth
              disabled={ordering}
            >
              {ordering ? "Placing..." : "Place order"}
            </Button>
          )}
        </Box>

        {isOwnProduct && (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ mt: 1, display: "block" }}
          >
            You are the seller of this item, so you cannot place an order.
          </Typography>
        )}

        {orderError && (
          <Typography color="error" sx={{ mt: 1 }}>
            {orderError}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}
