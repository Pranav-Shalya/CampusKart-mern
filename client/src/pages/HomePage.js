import { useEffect, useState } from "react";
import {
  TextField,
  MenuItem,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Typography,
  Box,
  Chip,
  Button,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import api from "../api";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
// import IconButton from "@mui/material/IconButton";
import { useAuth } from "../context/AuthContext";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import { Badge, IconButton } from "@mui/material";
import { useNotifications } from "../context/NotificationContext";
const categories = [
  "All",
  "Books",
  "Electronics",
  "Stationery",
  "Furniture",
  "Others",
];



export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [openOrders, setOpenOrders] = useState([]);
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("All");
  const navigate = useNavigate();
  const { user } = useAuth();
  const [wishlistIds, setWishlistIds] = useState([]);
  const { unreadCount } = useNotifications();
  const fetchProducts = async (params = {}) => {
    const { data } = await api.get("/products", { params });
    setProducts(data);
  };

  const fetchOpenOrders = async () => {
    if (!user) {
      setOpenOrders([]);
      return;
    }
    const { data } = await api.get("/orders/open", {
      headers: { Authorization: `Bearer ${user.token}` },
    });
    setOpenOrders(data);
  };

  const getDeliveryColors = (status) => {
    switch (status) {
      case "COMPLETED":
        return { bg: "#e8f5e9", border: "#4caf50" }; // green
      case "DELIVERED_TO_BUYER":
        return { bg: "#fffde7", border: "#ffb300" }; // yellow
      case "RUNNER_TAKEN":
        return { bg: "#fff3e0", border: "#ffb74d" }; // orange
      case "RUNNER_GOING":
        return { bg: "#e3f2fd", border: "#1976d2" }; // strong blue
      case "SELLER_DELIVERED":
        return { bg: "#fffde7", border: "#ffb300" };
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

  useEffect(() => {
    const load = async () => {
      await fetchProducts();
      await fetchOpenOrders();
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    const fetchWishlist = async () => {
      if (!user) return;
      const { data } = await api.get("/users/wishlist", {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setWishlistIds(data.map((p) => p._id));
    };
    fetchWishlist();
  }, [user]);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = {};
    if (q) params.q = q;
    if (category !== "All") params.category = category;
    fetchProducts(params);
  };

  const handleToggleWishlist = async (productId, e) => {
    e.stopPropagation();
    if (!user) return;

    const { data } = await api.post(
      "/users/wishlist",
      { productId },
      { headers: { Authorization: `Bearer ${user.token}` } }
    );

    setWishlistIds(data.wishlist || []);
  };
  

  // products visible on Home
  const saleProducts = products.filter(
    (p) => p.status !== "ASSIGNED" && !p.isSold
  );

  // SELLER cancels his own listing from Home (kept but unused button commented)
  const handleCancelListing = async (productId, e) => {
    e.stopPropagation();
    if (!user) return;

    await api.delete(`/products/${productId}/cancel`, {
      headers: { Authorization: `Bearer ${user.token}` },
    });

    setProducts((prev) => prev.filter((p) => p._id !== productId));
  };

  // BUYER cancels a delivery request from Home (order card)
  const handleCancelOrder = async (orderId, e) => {
    e.stopPropagation();
    if (!user) return;

    await api.delete(`/orders/${orderId}/cancel`, {
      headers: { Authorization: `Bearer ${user.token}` },
    });

    setOpenOrders((prev) => prev.filter((o) => o._id !== orderId));
  };

  const handleRunnerAccept = async (orderId, e) => {
    e.stopPropagation();
    if (!user) return;

    const { data } = await api.post(
      `/orders/${orderId}/claim`,
      {},
      { headers: { Authorization: `Bearer ${user.token}` } }
    );
    setOpenOrders((prev) =>
      prev.map((o) => (o._id === orderId ? data : o))
    );
  };

  const handleRunnerRequestPickup = async (orderId, e) => {
    e.stopPropagation();
    if (!user) return;

    const { data } = await api.post(
      `/orders/${orderId}/runner-request-pickup`,
      {},
      { headers: { Authorization: `Bearer ${user.token}` } }
    );
    setOpenOrders((prev) =>
      prev.map((o) => (o._id === orderId ? data : o))
    );
  };

  const handleRunnerDeliveredToBuyer = async (orderId, e) => {
    e.stopPropagation();
    if (!user) return;

    const { data } = await api.post(
      `/orders/${orderId}/runner-delivered`,
      {},
      { headers: { Authorization: `Bearer ${user.token}` } }
    );
    setOpenOrders((prev) =>
      prev.map((o) => (o._id === orderId ? data : o))
    );
  };

  return (
    <>
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


      <Box
        component="form"
        onSubmit={handleSearch}
        sx={{ display: "flex", gap: 1 }}
      >
        <TextField
          size="small"
          fullWidth
          placeholder="Search books, electronics..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <TextField
          size="small"
          select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          sx={{ width: 150 }}
        >
          {categories.map((c) => (
            <MenuItem key={c} value={c}>
              {c}
            </MenuItem>
          ))}
        </TextField>
      </Box>

      {/* // inside JSX, below the search form */}
      

      {/* Products for sale */}
      <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
        Items for sale
      </Typography>
      <Grid container spacing={2}>
        {saleProducts.map((p) => (
          <Grid item xs={12} sm={6} key={p._id}>
            <Card
              onClick={() => navigate(`/products/${p._id}`)}
              sx={{ cursor: "pointer", borderRadius: 3, position: "relative" }}
            >
              <CardMedia
                component="img"
                height="150"
                image={p.images?.[0] || "/placeholder.jpg"}
                alt={p.title}
              />
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 0.5,
                  }}
                >
                  <Typography variant="subtitle1" noWrap>
                    {p.title}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={(e) => handleToggleWishlist(p._id, e)}
                  >
                    {wishlistIds.includes(p._id) ? (
                      <FavoriteIcon color="error" fontSize="small" />
                    ) : (
                      <FavoriteBorderIcon fontSize="small" />
                    )}
                  </IconButton>
                </Box>
                <Typography variant="body2" color="primary">
                  ₹{p.price}
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  display="block"
                >
                  {p.category} · {p.seller?.hostel}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Requests to buy & deliver */}
      <Typography variant="subtitle1" sx={{ mt: 3, mb: 1 }}>
        Requests to buy & deliver
      </Typography>
      <Grid container spacing={2}>
        {openOrders.map((o) => {
          const isProductOrder = !!o.product;
          const title = isProductOrder ? o.product.title : o.customItem;
          const price = isProductOrder ? o.product.price : null;
          const { bg, border } = getDeliveryColors(o.status);
          const isCustom = !o.product;
          const isOpen = o.status === "OPEN";
          const isAssigned = o.status === "ASSIGNED";
          const isPickupRequested = o.status === "PICKUP_REQUESTED";
          const isPickedFromSeller = o.status === "PICKED_FROM_SELLER";
          const isRunnerGoing = o.status === "RUNNER_GOING";
          const isRunnerTaken = o.status === "RUNNER_TAKEN";

          return (
            <Grid item xs={12} sm={6} key={o._id}>
              <Card
                sx={{
                  borderRadius: 3,
                  cursor: "pointer",
                  position: "relative",
                  bgcolor: bg,
                  border: `1px solid ${border}`,
                }}
                onClick={() => navigate(`/order/${o._id}`)}
              >
                <CardMedia
                  component="img"
                  height="150"
                  image={
                    isProductOrder
                      ? o.product.images?.[0] || "/placeholder.jpg"
                      : o.image || "/placeholder.jpg"
                  }
                  alt={title}
                />
                <CardContent>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 0.5,
                    }}
                  >
                    <Typography variant="subtitle2" noWrap>
                      {title}
                    </Typography>
                    <Chip
                      size="small"
                      label={o.status}
                      color={isOpen ? "success" : "warning"}
                    />
                  </Box>
                  {price != null && (
                    <Typography variant="body2" color="primary">
                      ₹{price}
                    </Typography>
                  )}
                  {o.pickupLocation && (
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      display="block"
                    >
                      Pickup: {o.pickupLocation}
                    </Typography>
                  )}
                  {o.dropLocation && (
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      display="block"
                    >
                      Drop: {o.dropLocation}
                    </Typography>
                  )}
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    display="block"
                  >
                    Delivery fee: ₹{o.deliveryFee || 0}
                  </Typography>

                  {/* Runner chat if assigned */}
                  {isAssigned && (
                    <Button
                      size="small"
                      sx={{ mt: 1 }}
                      variant="outlined"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/order/${o._id}`);
                      }}
                    >
                      Chat
                    </Button>
                  )}

                  {/* Runner actions for custom requests (no seller) */}
                  {user && o.pickupMode === "DELIVERY" && isCustom && (
                    <>
                      {/* {isOpen && (
                        <Button
                          size="small"
                          sx={{ mt: 1, mr: 1 }}
                          variant="contained"
                          onClick={(e) => handleRunnerAccept(o._id, e)}
                        >
                          Going to take parcel
                        </Button>
                      )} */}

                      {isRunnerGoing &&
                        o.runner &&
                        o.runner._id === user._id && (
                          <Button
                            size="small"
                            sx={{ mt: 1, mr: 1 }}
                            variant="contained"
                            color="secondary"
                            onClick={async (e) => {
                              e.stopPropagation();
                              const { data } = await api.post(
                                `/orders/${o._id}/runner-picked-custom`,
                                {},
                                {
                                  headers: {
                                    Authorization: `Bearer ${user.token}`,
                                  },
                                }
                              );
                              setOpenOrders((prev) =>
                                prev.map((ord) =>
                                  ord._id === o._id ? data : ord
                                )
                              );
                            }}
                          >
                            Parcel taken
                          </Button>
                        )}

                      {isRunnerTaken &&
                        o.runner &&
                        o.runner._id === user._id && (
                          <Button
                            size="small"
                            sx={{ mt: 1, mr: 1 }}
                            variant="contained"
                            color="warning"
                            onClick={(e) =>
                              handleRunnerDeliveredToBuyer(o._id, e)
                            }
                          >
                            Delivered to buyer
                          </Button>
                        )}
                    </>
                  )}

                  {/* Runner actions for item-from-sale (with seller) */}
                  {user && o.pickupMode === "DELIVERY" && isProductOrder && (
                    <>
                      {isAssigned &&
                        o.runner &&
                        o.runner._id === user._id && (
                          <Button
                            size="small"
                            sx={{ mt: 1, mr: 1 }}
                            variant="contained"
                            color="secondary"
                            onClick={(e) =>
                              handleRunnerRequestPickup(o._id, e)
                            }
                          >
                            Ask seller for parcel
                          </Button>
                        )}

                      {isPickedFromSeller &&
                        o.runner &&
                        o.runner._id === user._id && (
                          <Button
                            size="small"
                            sx={{ mt: 1, mr: 1 }}
                            variant="contained"
                            color="warning"
                            onClick={(e) =>
                              handleRunnerDeliveredToBuyer(o._id, e)
                            }
                          >
                            Delivered to buyer
                          </Button>
                        )}
                    </>
                  )}
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </>
  );
}
