import { useState, useEffect } from "react";
import {
  Card,
  TextField,
  Button,
  Typography,
  MenuItem,
  Box,
  Grid,
  CardMedia,
  CardContent,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import api from "../api";
import { useAuth } from "../context/AuthContext";

const categories = ["Books", "Electronics", "Stationery", "Furniture", "Others"];

export default function NewListingPage() {
  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    category: "Books",
    imageUrl: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [myProducts, setMyProducts] = useState([]);
  const [loadingMy, setLoadingMy] = useState(true);

  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchMyProducts = async () => {
    if (!user) {
      setLoadingMy(false);
      return;
    }
    setLoadingMy(true);
    try {
      const { data } = await api.get("/products/me", {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setMyProducts(data);
    } finally {
      setLoadingMy(false);
    }
  };

  useEffect(() => {
    fetchMyProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    setError("");
    setLoading(true);

    try {
      const { data } = await api.post(
        "/products",
        {
          title: form.title,
          description: form.description,
          price: form.price,
          category: form.category,
          images: form.imageUrl ? [form.imageUrl] : [],
        },
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );

      setLoading(false);
      fetchMyProducts();
      navigate(`/products/${data._id}`);
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || "Failed to post listing");
    }
  };

// replace your getOrderColors with this
const getListingColors = (status, isSold) => {
  const s = status || (isSold ? "DELIVERED" : "OPEN");

  switch (s) {
    case "COMPLETED":
    case "DELIVERED":
      return { bg: "#e8f5e9", border: "#4caf50" };      // green

    case "SELLER_DELIVERED":
    case "DELIVERED_TO_BUYER":
      return { bg: "#fffde7", border: "#ffb300" };      // yellow

    case "PICKED_FROM_SELLER":
      return { bg: "#fff3e0", border: "#ffb74d" };      // orange

    case "PICKUP_REQUESTED":
      return { bg: "#fce4ec", border: "#f06292" };      // pink

    case "ASSIGNED":
      return { bg: "#e3f2fd", border: "#183750ff" };    // blue (darker)

    case "OPEN":
    default:
      return { bg: "#e3f2fd", border: "#64b5f6" };      // blue (default)
  }
};



  const handleCancelListing = async (productId) => {
    if (!user) return;
    await api.delete(`/products/${productId}/cancel`, {
      headers: { Authorization: `Bearer ${user.token}` },
    });
    setMyProducts((prev) => prev.filter((p) => p._id !== productId));
  };

  const renderMyListings = () => {
    if (loadingMy) return <Typography>Loading...</Typography>;
    if (myProducts.length === 0)
      return (
        <Typography variant="body2" color="text.secondary">
          You haven’t posted anything yet. Your listings will appear here.
        </Typography>
      );

    return (
      <Grid container spacing={2} sx={{ mt: 1 }}>
        {myProducts.map((p) => {
          const { bg, border } = getListingColors(p.status, p.isSold);
          return(
          <Grid item xs={12} sm={6} key={p._id}>
            <Card
              sx={{ borderRadius: 3, cursor: "pointer" , bgcolor: bg,
              border: `1px solid ${border}`, }}
              onClick={() => navigate(`/products/${p._id}`)}
            >
              <CardMedia
                component="img"
                height="120"
                image={p.images?.[0] || "/placeholder.jpg"}
                alt={p.title}
              />
              <CardContent>
                <Typography variant="subtitle2" noWrap>
                  {p.title}
                </Typography>
                <Typography variant="body2" color="primary">
                  ₹{p.price}
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  display="block"
                >
                  {p.category}
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  display="block"
                >
                  Status: {p.status || (p.isSold ? "DELIVERED" : "OPEN")}
                </Typography>

                {/* Only cancel listing here; delivery / pickup flow is handled via orders in Profile page */}
                <Button
                  size="small"
                  sx={{ mt: 1 }}
                  variant="outlined"
                  color="error"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCancelListing(p._id);
                  }}
                >
                  Cancel listing
                </Button>
              </CardContent>
            </Card>
          </Grid>
          );
        })}
      </Grid>
    );
  };

  if (!user) {
    return (
      <Typography sx={{ mt: 2 }}>
        Please log in with your college email to post a listing.
      </Typography>
    );
  }

  return (
    <>
      <Card sx={{ p: 3, borderRadius: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          List a new item
        </Typography>
        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            label="Title"
            name="title"
            fullWidth
            margin="normal"
            value={form.title}
            onChange={handleChange}
          />
          <TextField
            label="Description"
            name="description"
            fullWidth
            margin="normal"
            multiline
            rows={3}
            value={form.description}
            onChange={handleChange}
          />
          <TextField
            label="Price (₹)"
            name="price"
            type="number"
            fullWidth
            margin="normal"
            value={form.price}
            onChange={handleChange}
          />
          <TextField
            label="Image URL (optional)"
            name="imageUrl"
            fullWidth
            margin="normal"
            value={form.imageUrl}
            onChange={handleChange}
          />
          <TextField
            select
            label="Category"
            name="category"
            fullWidth
            margin="normal"
            value={form.category}
            onChange={handleChange}
          >
            {categories.map((c) => (
              <MenuItem key={c} value={c}>
                {c}
              </MenuItem>
            ))}
          </TextField>

          {error && (
            <Typography color="error" variant="body2" sx={{ mt: 1 }}>
              {error}
            </Typography>
          )}

          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{ mt: 3, borderRadius: 999 }}
            disabled={loading}
          >
            {loading ? "Posting..." : "Post listing"}
          </Button>
        </Box>
      </Card>

      <Typography variant="subtitle1" sx={{ mb: 1 }}>
        My Listings
      </Typography>

      {renderMyListings()}
    </>
  );
}
