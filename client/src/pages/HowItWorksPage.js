import { Box, Typography, Card, CardContent, Chip, Stack } from "@mui/material";

const statusChip = (label, color, bg) => (
  <Chip
    label={label}
    sx={{
      bgcolor: bg,
      borderColor: color,
      color,
      borderWidth: 1,
      borderStyle: "solid",
      fontSize: 12,
    }}
    variant="outlined"
    size="small"
  />
);

export default function HowItWorksPage() {
  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        How delivery works
      </Typography>

      {/* Custom buy request flow */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            Buy requests (from Buy tab)
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            These are requests created on the Buy page when there is no fixed seller.
          </Typography>

          <Stack spacing={1}>
            <Typography variant="body2">
              1. Buyer posts a request → status{" "}
              {statusChip("OPEN", "#64b5f6", "#e3f2fd")} (anyone can accept).
            </Typography>
            <Typography variant="body2">
              2. Delivery person accepts →{" "}
              {statusChip("RUNNER_GOING", "#1976d2", "#e3f2fd")} (going for pickup).
            </Typography>
            <Typography variant="body2">
              3. Delivery person takes parcel →{" "}
              {statusChip("RUNNER_TAKEN", "#ffb74d", "#fff3e0")} (parcel taken).
            </Typography>
            <Typography variant="body2">
              4. Delivery person delivers →{" "}
              {statusChip("DELIVERED_TO_BUYER", "#ffb300", "#fffde7")} (reached buyer).
            </Typography>
            <Typography variant="body2">
              5. Buyer taps “Mark as received” →{" "}
              {statusChip("COMPLETED", "#4caf50", "#e8f5e9")} (order finished).
            </Typography>
          </Stack>
        </CardContent>
      </Card>

      {/* Item for sale (with seller) */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
            Items for sale (with seller)
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
            These are normal product orders from the Home / product pages.
            </Typography>

            {/* Delivery mode steps */}
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
            Delivery mode
            </Typography>
            <Typography variant="body2" sx={{ mb: 0.3 }}>
            1. Buyer places order → status{" "}
            {statusChip("OPEN", "#64b5f6", "#e3f2fd")} (waiting for a runner).
            </Typography>
            <Typography variant="body2" sx={{ mb: 0.3 }}>
            2. Delivery person accepts →{" "}
            {statusChip("ASSIGNED", "#0786ed", "#e3f2fd")} (runner assigned).
            </Typography>
            <Typography variant="body2" sx={{ mb: 0.3 }}>
            3. Runner taps “Ask seller for parcel” →{" "}
            {statusChip("PICKUP_REQUESTED", "#f06292", "#fce4ec")} (seller is notified).
            </Typography>
            <Typography variant="body2" sx={{ mb: 0.3 }}>
            4. Seller gives parcel to runner →{" "}
            {statusChip("PICKED_FROM_SELLER", "#ffb74d", "#fff3e0")} (with runner).
            </Typography>
            <Typography variant="body2" sx={{ mb: 0.3 }}>
            5. Runner taps “Delivered to buyer” →{" "}
            {statusChip("DELIVERED_TO_BUYER", "#ffb300", "#fffde7")} (reached buyer).
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
            6. Buyer taps “Mark as received” →{" "}
            {statusChip("COMPLETED", "#4caf50", "#e8f5e9")} (order finished).
            </Typography>

            {/* Self‑pickup mode steps */}
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
            Self pickup mode
            </Typography>
            <Typography variant="body2" sx={{ mb: 0.3 }}>
            1. Buyer places order → status{" "}
            {statusChip("OPEN", "#64b5f6", "#e3f2fd")} (waiting for seller).
            </Typography>
            <Typography variant="body2" sx={{ mb: 0.3 }}>
            2. Seller prepares item and taps “Mark delivered for pickup” →{" "}
            {statusChip("SELLER_DELIVERED", "#ffb300", "#fffde7")} (ready with seller).
            </Typography>
            <Typography variant="body2">
            3. Buyer meets seller and taps “Mark as received” →{" "}
            {statusChip("COMPLETED", "#4caf50", "#e8f5e9")} (deal completed).
            </Typography>
        </CardContent>
        </Card>


      {/* Color legend */}
      <Card>
        <CardContent>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            Color legend
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap">
            {statusChip("In progress (blue)", "#1976d2", "#e3f2fd")}
            {statusChip("Waiting at seller (pink)", "#f06292", "#fce4ec")}
            {statusChip("Picked up (orange)", "#ffb74d", "#fff3e0")}
            {statusChip("With buyer (yellow)", "#ffb300", "#fffde7")}
            {statusChip("Completed (green)", "#4caf50", "#e8f5e9")}
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
