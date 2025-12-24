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

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    college: "",
    department: "",
    hostel: ""
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const { data } = await api.post("/auth/register", form);
      login(data);
      navigate("/");
    } catch (err) {
      const msg =
          err.response?.data?.message ||
          err.response?.data?.error ||
         "Registration failed";
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
      <Card sx={{ p: 3, width: "100%", maxWidth: 420 }}>
        <Typography variant="h5" gutterBottom>
          Join CampusKart
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Buy & sell within your campus community.
        </Typography>

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <TextField
            label="Full Name"
            name="name"
            fullWidth
            margin="normal"
            value={form.name}
            onChange={handleChange}
          />
          <TextField
            label="College Email"
            name="email"
            fullWidth
            margin="normal"
            value={form.email}
            onChange={handleChange}
          />
          <TextField
            label="Password"
            name="password"
            type="password"
            fullWidth
            margin="normal"
            value={form.password}
            onChange={handleChange}
          />
          <TextField
            label="College"
            name="college"
            fullWidth
            margin="normal"
            value={form.college}
            onChange={handleChange}
          />
          <TextField
            label="Department"
            name="department"
            fullWidth
            margin="normal"
            value={form.department}
            onChange={handleChange}
          />
          <TextField
            label="Hostel"
            name="hostel"
            fullWidth
            margin="normal"
            value={form.hostel}
            onChange={handleChange}
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
            Create account
          </Button>
        </Box>

        <Typography variant="body2" sx={{ mt: 2, textAlign: "center" }}>
          Already have an account?{" "}
          <Link component={RouterLink} to="/login">
            Login
          </Link>
        </Typography>
      </Card>
    </Box>
  );
}
