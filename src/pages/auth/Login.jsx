import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import api from "../../services/api";
import { setAuthSession } from "../../utils/roleHelper";

export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("subia");
  const [password, setPassword] = useState("password");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (event) => {
    event.preventDefault();
    setError("");

    if (!username.trim() || !password.trim()) {
      setError("Please enter both username and password.");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post("/authentication/api/v1/auth/login", {
        username: username.trim(),
        password,
      });

      const { access_token: accessToken, user } = response.data || {};
      if (!accessToken || !user) {
        setError("Login response is invalid.");
        return;
      }

      const normalizedRole = String(user.role || "").toLowerCase();
      setAuthSession({
        token: accessToken,
        role: normalizedRole,
        name: user.username,
        email: user.email,
        id: user.id,
      });

      const target = normalizedRole === "admin" ? "/admin/dashboard" : "/user/dashboard";
      navigate(target, { replace: true });
    } catch (requestError) {
      const message =
        requestError?.response?.data?.message ||
        requestError?.response?.data?.detail ||
        "Invalid credentials or server unavailable.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        p: 2,
      }}
    >
      <Paper
        elevation={0}
        sx={{
          width: "100%",
          maxWidth: 460,
          p: { xs: 2.5, sm: 3.5 },
          borderRadius: 4,
          border: "1px solid",
          borderColor: "divider",
          bgcolor: "rgba(255,255,255,0.9)",
        }}
      >
        <Typography variant="h4" sx={{ mb: 1 }}>
          Google Dashboard Login
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          Sign in to continue to your workspace.
        </Typography>

        <Stack component="form" spacing={2} onSubmit={handleLogin}>
          {!!error && <Alert severity="error">{error}</Alert>}

          <TextField
            fullWidth
            label="Username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
          />

          <TextField
            fullWidth
            label="Password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />

          <Button type="submit" variant="contained" size="large" disabled={loading}>
            {loading ? <CircularProgress size={22} color="inherit" /> : "Login"}
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}
