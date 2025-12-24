import { useEffect, useState } from "react";
import {
  Typography,
  Card,
  CardContent,
  CardMedia,
  Grid,
  Button,
  Box,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import api from "../api";
import { useAuth } from "../context/AuthContext";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import { Badge, IconButton } from "@mui/material";
import { useNotifications } from "../context/NotificationContext";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
export default function ProfilePage() {
  const { user, logout } = useAuth();
  const [myProducts, setMyProducts] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [loadingMy, setLoadingMy] = useState(true);
  const [loadingWish, setLoadingWish] = useState(true);

  const [buyOrders, setBuyOrders] = useState([]);
  const [sellOrders, setSellOrders] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMyProducts = async () => {
      if (!user) {
        setLoadingMy(false);
        return;
      }
      try {
        const { data } = await api.get("/products/me", {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });
        setMyProducts(data);
      } finally {
        setLoadingMy(false);
      }
    };

    const fetchWishlist = async () => {
      if (!user) {
        setLoadingWish(false);
        return;
      }
      try {
        const { data } = await api.get("/users/wishlist", {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });
        setWishlist(data);
      } finally {
        setLoadingWish(false);
      }
    };

    const fetchOrders = async () => {
      if (!user) {
        setLoadingOrders(false);
        return;
      }
      try {
        const [buyRes, sellRes, delRes] = await Promise.all([
          api.get("/orders/buy", {
            headers: { Authorization: `Bearer ${user.token}` },
          }),
          api.get("/orders/sell", {
            headers: { Authorization: `Bearer ${user.token}` },
          }),
          api.get("/orders/deliver", {
            headers: { Authorization: `Bearer ${user.token}` },
          }),
        ]);
        setBuyOrders(buyRes.data);
        setSellOrders(sellRes.data);
        setDeliveries(delRes.data);
      } finally {
        setLoadingOrders(false);
      }
    };

    fetchMyProducts();
    fetchWishlist();
    fetchOrders();
  }, [user]);

  const handleCancel = async (orderId) => {
  await api.delete(`/orders/${orderId}/cancel`, {
    headers: { Authorization: `Bearer ${user.token}` },
  });

  // remove from buyOrders / sellOrders / deliveries locally
  setBuyOrders((prev) => prev.filter((o) => o._id !== orderId));
  setSellOrders((prev) => prev.filter((o) => o._id !== orderId));
  setDeliveries((prev) => prev.filter((o) => o._id !== orderId));
};


//   const handleCancel = async (orderId) => {
//   await api.post(
//     `/orders/${orderId}/cancel`,
//     {},
//     { headers: { Authorization: `Bearer ${user.token}` } }
//   );
//   // refetch buy orders and, ideally, products:
//   fetchBuyOrders(); // in BuyPage
// };


const handleRunnerCancel = async (orderId) => {
  await api.post(
    `/orders/${orderId}/unassign`,
    {},
    { headers: { Authorization: `Bearer ${user.token}` } }
  );

  // remove from my Deliveries only
  setDeliveries((prev) => prev.filter((o) => o._id !== orderId));
};


  if (!user) {
    return (
      <Typography sx={{ mt: 2 }}>
        Please{" "}
        <span
          style={{ color: "#1976d2", cursor: "pointer" }}
          onClick={() => navigate("/login")}
        >
          log in
        </span>{" "}
        to view your profile, listings, and wishlist.
      </Typography>
    );
  }


  const handleSellerDelivered = async (orderId) => {
  await api.post(
    `/orders/${orderId}/seller-delivered`,
    {},
    { headers: { Authorization: `Bearer ${user.token}` } }
  );

  // update sellOrders so status becomes SELLER_DELIVERED
  setSellOrders((prev) =>
    prev.map((o) =>
      o._id === orderId ? { ...o, status: "SELLER_DELIVERED" } : o
    )
  );
};


  const handleCancelListing = async (productId) => {
  await api.delete(`/products/${productId}/cancel`, {
    headers: { Authorization: `Bearer ${user.token}` },
  });

  // remove from myProducts so it disappears everywhere in UI
  setMyProducts((prev) => prev.filter((p) => p._id !== productId));
};


// const handleCancelBuyOrder = async (orderId) => {
//   await api.delete(`/orders/${orderId}/cancel`, {
//     headers: { Authorization: `Bearer ${user.token}` },
//   });

//   setBuyOrders((prev) => prev.filter((o) => o._id !== orderId));
// };
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

const handleMarkDelivered = async (orderId) => {
  await api.post(
    `/orders/${orderId}/complete`,
    {},
    { headers: { Authorization: `Bearer ${user.token}` } }
  );

  // update only buyOrders list; this button is used in the "buy" section
  setBuyOrders((prev) =>
    prev.map((o) =>
      o._id === orderId ? { ...o, status: "COMPLETED" } : o
    )
  );
};




  const renderProductGrid = (items) => (
    <Grid container spacing={2}>
      {items.map((p) => (
        <Grid item xs={12} sm={6} key={p._id}>
          <Card
            sx={{ borderRadius: 3, cursor: "pointer" }}
            onClick={() => navigate(`/products/${p._id}`)}
          >
            <CardMedia
              component="img"
              height="130"
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
              <Typography variant="caption" color="text.secondary">
                {p.category}
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block">
                 Status: {p.status || "OPEN"}
              </Typography>

                 {/* NEW: cancel listing button */}
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
      ))}
    </Grid>
  );

  

const renderOrderGrid = (orders, section) => (
  <Grid container spacing={2}>
    {orders.map((o) => {
      const hasProduct = !!o.product;
      const title = hasProduct ? o.product.title : o.customItem || "Request";
      const price = hasProduct ? o.product.price : null;
      const { bg, border } = getOrderColors(o.status);
      return (
        <Grid item xs={12} sm={6} key={o._id}>
          <Card
            sx={{
              borderRadius: 3,
              bgcolor: bg,
              border: `1px solid ${border}`,
              cursor: hasProduct ? "pointer" : "default",
            }}
            onClick={() =>
              hasProduct && navigate(`/products/${o.product._id}`)
            }
          >
          
              <CardMedia
                component="img"
                height="120"
                image={hasProduct?
                  o.product.images?.[0] || "/placeholder.jpg"
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
                Mode: {o.pickupMode === "DELIVERY" ? "Delivery" : "Self pickup"}
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
              >
                Status: {o.status} · Delivery fee: ₹{o.deliveryFee || 0}
              </Typography>

              {/* Buyer cancel (Buy Requests & Orders) */}
              {section === "buy" &&
                (o.status === "OPEN" || o.status === "ASSIGNED") && (
                  <Button
                    size="small"
                    sx={{ mt: 1 }}
                    variant="outlined"
                    onClick={() => handleCancel(o._id)}
                  >
                    Cancel
                  </Button>
                )}

              {/* Runner cancel (Deliveries) */}
              {section === "deliveries" && o.status === "ASSIGNED" && (
                <Button
                  size="small"
                  sx={{ mt: 1 }}
                  variant="outlined"
                  color="error"
                  onClick={() => handleRunnerCancel(o._id)}
                >
                  Cancel delivery
                </Button>

              )}
              {section === "deliveries" &&
                o.pickupMode === "DELIVERY" &&
                o.runner &&
                o.runner._id === user._id && (
                  <>
                    {/* custom request, step 2+3 */}
                    {!o.product && o.status === "RUNNER_GOING" && (
                      <Button
                        size="small"
                        sx={{ mt: 1, mr: 1 }}
                        variant="contained"
                        color="secondary"
                        onClick={async () => {
                          const { data } = await api.post(
                            `/orders/${o._id}/runner-picked-custom`,
                            {},
                            { headers: { Authorization: `Bearer ${user.token}` } }
                          );
                          setDeliveries((prev) =>
                            prev.map((ord) => (ord._id === o._id ? data : ord))
                          );
                        }}
                      >
                        Parcel taken
                      </Button>
                    )}

                    {!o.product && o.status === "RUNNER_TAKEN" && (
                      <Button
                        size="small"
                        sx={{ mt: 1, mr: 1 }}
                        variant="contained"
                        color="warning"
                        onClick={async () => {
                          const { data } = await api.post(
                            `/orders/${o._id}/runner-delivered`,
                            {},
                            { headers: { Authorization: `Bearer ${user.token}` } }
                          );
                          setDeliveries((prev) =>
                            prev.map((ord) => (ord._id === o._id ? data : ord))
                          );
                        }}
                      >
                        Delivering / delivered
                      </Button>
                    )}
                    </>
                )}

   


              {/* Buyer: mark as received for self pickup */}
              {section === "buy" &&
                o.pickupMode === "SELF" &&
                o.status === "SELLER_DELIVERED" && (
                  <Button
                    size="small"
                    sx={{ mt: 1 }}
                    variant="contained"
                    color="success"
                    onClick={async () => {
                      await api.post(
                        `/orders/${o._id}/complete`,
                        {},
                        { headers: { Authorization: `Bearer ${user.token}` } }
                      );
                      setBuyOrders((prev) =>
                        prev.map((ord) =>
                          ord._id === o._id ? { ...ord, status: "COMPLETED" } : ord
                        )
                      );
                    }}
                  >
                    Mark as received
                  </Button>
                )}

                {/* Buyer: mark as received (delivery) */}
                {section === "buy" &&
                  o.pickupMode === "DELIVERY" &&
                  o.status === "DELIVERED_TO_BUYER" && (
                    <Button
                      size="small"
                      sx={{ mt: 1 }}
                      variant="contained"
                      color="success"
                      onClick={async () => {
                        const { data } = await api.post(
                          `/orders/${o._id}/complete`,
                          {},
                          { headers: { Authorization: `Bearer ${user.token}` } }
                        );
                        setBuyOrders((prev) =>
                          prev.map((ord) => (ord._id === o._id ? data : ord))
                        );
                      }}
                    >
                      Mark as received
                    </Button>
                  )}

                  
              {/* Runner: ask seller / delivered to buyer (delivery mode) */}
              {section === "deliveries" &&
                o.pickupMode === "DELIVERY" &&
                o.runner &&
                o.runner._id === user._id && (
                  <>
                    {o.status === "ASSIGNED" && (
                      <Button
                        size="small"
                        sx={{ mt: 1, mr: 1 }}
                        variant="contained"
                        color="secondary"
                        onClick={async () => {
                          const { data } = await api.post(
                            `/orders/${o._id}/runner-request-pickup`,
                            {},
                            { headers: { Authorization: `Bearer ${user.token}` } }
                          );
                          setDeliveries((prev) =>
                            prev.map((ord) => (ord._id === o._id ? data : ord))
                          );
                        }}
                      >
                        Ask seller for parcel
                      </Button>
                    )}

                    {o.status === "PICKED_FROM_SELLER" && (
                      <Button
                        size="small"
                        sx={{ mt: 1, mr: 1 }}
                        variant="contained"
                        color="warning"
                        onClick={async () => {
                          const { data } = await api.post(
                            `/orders/${o._id}/runner-delivered`,
                            {},
                            { headers: { Authorization: `Bearer ${user.token}` } }
                          );
                          setDeliveries((prev) =>
                            prev.map((ord) => (ord._id === o._id ? data : ord))
                          );
                        }}
                      >
                        Delivered to buyer
                      </Button>
                    )}
                  </>
                )}


              {/* Seller: mark delivered for self pickup */}
              {section === "sell" &&
                o.pickupMode === "SELF" &&
                (o.status === "OPEN" || o.status === "ASSIGNED") && (
                  <Button
                    size="small"
                    sx={{ mt: 1, ml: 1 }}
                    variant="contained"
                    color="warning"
                    onClick={() => handleSellerDelivered(o._id)}
                  >
                    Mark delivered for pickup
                  </Button>
                )}

                {/* Seller: for delivery mode, confirm parcel given */}
                {section === "sell" &&
                  o.pickupMode === "DELIVERY" &&
                  o.status === "PICKUP_REQUESTED" && (
                    <Button
                      size="small"
                      sx={{ mt: 1, ml: 1 }}
                      variant="contained"
                      color="warning"
                      onClick={async () => {
                        await api.post(
                          `/orders/${o._id}/seller-given`,
                          {},
                          { headers: { Authorization: `Bearer ${user.token}` } }
                        );
                        setSellOrders((prev) =>
                          prev.map((ord) =>
                            ord._id === o._id ? { ...ord, status: "PICKED_FROM_SELLER" } : ord
                          )
                        );
                      }}
                    >
                      Given to delivery person
                    </Button>
                  )}

            </CardContent>
          </Card>
        </Grid>
      );
    })}
  </Grid>
);

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
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <div>
          <Typography variant="h6">{user.name}</Typography>
          <Typography variant="body2" color="text.secondary">
            {user.email}
          </Typography>
        </div>
        <Button variant="outlined" size="small" onClick={logout}>
          Logout
        </Button>
      </Box>

      {/* My Listings section: SELL tab uses this, Profile groups it under "Sell" */}
      <Typography variant="subtitle1" sx={{ mb: 1 }}>
        My Listings (Sell)
      </Typography>

      {loadingMy ? (
        <Typography>Loading...</Typography>
      ) : myProducts.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          You haven’t posted anything yet. Use the Sell tab to add your first
          listing.
        </Typography>
      ) : (
        <Box sx={{ mb: 3 }}>{renderProductGrid(myProducts)}</Box>
      )}

      {/* Wishlist */}
      <Typography variant="subtitle1" sx={{ mb: 1 }}>
        My Listings (Wishlist)
      </Typography>

      {loadingWish ? (
        <Typography>Loading...</Typography>
      ) : wishlist.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          No items in your wishlist yet. Tap the heart icon on listings to save
          them here.
        </Typography>
      ) : (
        renderProductGrid(wishlist)
      )}

      {/* Sell Orders */}
      <Typography variant="subtitle1" sx={{ mt: 3, mb: 1 }}>
        My Listings (Buy side orders for my products)
      </Typography>
      {loadingOrders ? (
        <Typography>Loading...</Typography>
      ) : sellOrders.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          No orders yet for your listings.
        </Typography>
      ) : (
        renderOrderGrid(sellOrders,"sell")
      )}

      {/* Buy Orders */}
      <Typography variant="subtitle1" sx={{ mt: 3, mb: 1 }}>
        Buy Requests & Orders
      </Typography>
      {loadingOrders ? (
        <Typography>Loading...</Typography>
      ) : buyOrders.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          You haven’t ordered anything yet.
        </Typography>
      ) : (
        renderOrderGrid(buyOrders,"buy")
      )}

      {/* Deliveries */}
      <Typography variant="subtitle1" sx={{ mt: 3, mb: 1 }}>
        Deliveries
      </Typography>
     
      {loadingOrders ? (
        <Typography>Loading...</Typography>
      ) : deliveries.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          You’re not delivering any orders yet.
        </Typography>
      ) : (
        renderOrderGrid(deliveries,"deliveries")
      )}
    </>
  );
}
