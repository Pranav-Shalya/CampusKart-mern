import { useState } from "react";
import {
  Card,
  TextField,
  Button,
  Typography,
  Box,
  Link
} from "@mui/material";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import api from "../api";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError("");
//     try {
//       const { data } = await api.post("/auth/login", { email, password });
//       login(data);
//       navigate("/");
//     } catch (err) {
//       setError(err.response?.data?.message || "Login failed");
//     }
//   };
const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");
  try {
    const { data } = await api.post("/auth/login", { email, password });
    login(data);
    navigate("/");
  } catch (err) {
    const msg =
      err.response?.data?.message || "Login failed";
    setError(msg);
  }
};


  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "#f5f7fb"
      }}
    >
      <Card sx={{ p: 3, width: "100%", maxWidth: 400 }}>
        <Typography variant="h5" gutterBottom>
          CampusKart Login
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Use your college email to sign in.
        </Typography>

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <TextField
            label="College Email"
            fullWidth
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            label="Password"
            type="password"
            fullWidth
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && (
            <Typography color="error" variant="body2" sx={{ mt: 1 }}>
              {error}
            </Typography>
          )}
          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{ mt: 2, borderRadius: 999 }}
          >
            Login
          </Button>
        </Box>

        <Typography variant="body2" sx={{ mt: 2, textAlign: "center" }}>
          New here?{" "}
          <Link component={RouterLink} to="/register">
            Create an account
          </Link>
        </Typography>
      </Card>
    </Box>
  );
}
