import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { setAuthSession } from "../../utils/roleHelper";

export default function Login() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("admin");
  const [error, setError] = useState("");

  const handleLogin = (event) => {
    event.preventDefault();
    if (!name.trim() || !email.trim()) {
      setError("Please enter both name and email.");
      return;
    }

    setAuthSession({
      role,
      name: name.trim(),
      email: email.trim(),
    });

    if (role === "admin") {
      navigate("/admin/dashboard", { replace: true });
      return;
    }
    navigate("/user/dashboard", { replace: true });
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
            label="Full Name"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />

          <TextField
            fullWidth
            label="Email Address"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />

          <Select value={role} onChange={(event) => setRole(event.target.value)} fullWidth>
            <MenuItem value="admin">Admin</MenuItem>
            <MenuItem value="user">User</MenuItem>
          </Select>

          <Button type="submit" variant="contained" size="large">
            Login
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}
