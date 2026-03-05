import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  AppBar,
  Avatar,
  Box,
  Chip,
  Drawer,
  ListItemIcon,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
} from "@mui/material";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import LogoutIcon from "@mui/icons-material/Logout";
import MenuIcon from "@mui/icons-material/Menu";
import KeyboardDoubleArrowLeftIcon from "@mui/icons-material/KeyboardDoubleArrowLeft";
import KeyboardDoubleArrowRightIcon from "@mui/icons-material/KeyboardDoubleArrowRight";
import { useNavigate } from "react-router-dom";
import { clearAuthSession, getUserProfile } from "../../utils/roleHelper";

const drawerWidth = 260;
const collapsedDrawerWidth = 88;

const adminItems = [
  { label: "Dashboard", to: "/admin/dashboard" },
  { label: "Company Data", to: "/admin/company-data" },
  { label: "Company Users", to: "/admin/company-users" },
  { label: "Questions", to: "/admin/questions" },
  { label: "Sessions", to: "/admin/sessions" },
];

const userItems = [{ label: "Dashboard", to: "/user/dashboard" }];

export default function Layout({ children, role = "admin", title }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const profile = getUserProfile();

  const navItems =
    role === "user"
      ? [...userItems, { label: "My Profile", to: "/profile" }]
      : [...adminItems, { label: "My Profile", to: "/profile" }];

  const displayName = profile?.name || "Portal User";
  const displayRole = (profile?.role || role).toUpperCase();

  const handleMenuOpen = (event) => setMenuAnchor(event.currentTarget);
  const handleMenuClose = () => setMenuAnchor(null);

  const handleProfile = () => {
    handleMenuClose();
    navigate("/profile");
  };

  const handleLogout = () => {
    clearAuthSession();
    handleMenuClose();
    navigate("/login", { replace: true });
  };

  const activeDrawerWidth = sidebarCollapsed ? collapsedDrawerWidth : drawerWidth;

  const drawer = (
    <Box sx={{ height: "100%", p: 2.5 }}>
      <Typography variant="h6" sx={{ fontWeight: 800, mb: 2, whiteSpace: "nowrap" }}>
        {sidebarCollapsed ? "JP" : "Job Portal"}
      </Typography>
      {!sidebarCollapsed && (
        <Typography variant="body2" sx={{ color: "text.secondary", mb: 3 }}>
          {role === "admin" ? "Admin Workspace" : "User Workspace"}
        </Typography>
      )}

      <List sx={{ p: 0 }}>
        {navItems.map((item) => {
          const isActive = location.pathname === item.to;
          return (
            <ListItemButton
              key={item.to}
              component={Link}
              to={item.to}
              onClick={() => setMobileOpen(false)}
              sx={{
                mb: 1,
                borderRadius: 2,
                justifyContent: sidebarCollapsed ? "center" : "flex-start",
                px: sidebarCollapsed ? 1 : 2,
                bgcolor: isActive ? "primary.main" : "transparent",
                color: isActive ? "primary.contrastText" : "text.primary",
                "&:hover": {
                  bgcolor: isActive ? "primary.dark" : "action.hover",
                },
              }}
            >
              <ListItemText
                primary={item.label}
                sx={{
                  m: 0,
                  opacity: sidebarCollapsed ? 0 : 1,
                  display: sidebarCollapsed ? "none" : "block",
                }}
              />
            </ListItemButton>
          );
        })}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "transparent" }}>
      <AppBar
        color="transparent"
        elevation={0}
        sx={{
          borderBottom: "1px solid",
          borderColor: "divider",
          backdropFilter: "blur(8px)",
          bgcolor: "rgba(251, 248, 242, 0.8)",
        }}
      >
        <Toolbar sx={{ minHeight: { xs: 64, sm: 72 } }}>
          <IconButton
            color="inherit"
            edge="start"
            onClick={() => setMobileOpen(true)}
            sx={{ mr: 2, display: { md: "none" } }}
          >
            <MenuIcon />
          </IconButton>
          <IconButton
            color="inherit"
            onClick={() => setSidebarCollapsed((prev) => !prev)}
            sx={{ mr: 1.2, display: { xs: "none", md: "inline-flex" } }}
          >
            {sidebarCollapsed ? (
              <KeyboardDoubleArrowRightIcon />
            ) : (
              <KeyboardDoubleArrowLeftIcon />
            )}
          </IconButton>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            {title || "Job Portal"}
          </Typography>

          <Box sx={{ ml: "auto", display: "flex", alignItems: "center", gap: 1.2 }}>
            <Chip
              size="small"
              label={displayRole}
              sx={{
                display: { xs: "none", sm: "inline-flex" },
                bgcolor: "rgba(15,118,110,0.13)",
                color: "primary.dark",
                fontWeight: 700,
              }}
            />
            <IconButton onClick={handleMenuOpen} sx={{ p: 0.4 }}>
              <Avatar sx={{ bgcolor: "primary.main", width: 38, height: 38 }}>
                {displayName.charAt(0).toUpperCase()}
              </Avatar>
            </IconButton>
          </Box>

          <Menu
            anchorEl={menuAnchor}
            open={Boolean(menuAnchor)}
            onClose={handleMenuClose}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
          >
            <Box sx={{ px: 2, py: 1.2 }}>
              <Typography sx={{ fontWeight: 700 }}>{displayName}</Typography>
              <Typography variant="body2" color="text.secondary">
                {profile?.email || "No email"}
              </Typography>
            </Box>
            <MenuItem onClick={handleProfile}>
              <ListItemIcon>
                <PersonOutlineIcon fontSize="small" />
              </ListItemIcon>
              Profile
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Box component="nav" sx={{ width: { md: activeDrawerWidth }, flexShrink: { md: 0 } }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: "block", md: "none" },
            "& .MuiDrawer-paper": { width: drawerWidth, boxSizing: "border-box" },
          }}
        >
          {drawer}
        </Drawer>

        <Drawer
          variant="permanent"
          open
          sx={{
            display: { xs: "none", md: "block" },
            "& .MuiDrawer-paper": {
              width: activeDrawerWidth,
              boxSizing: "border-box",
              borderRight: "1px solid",
              borderColor: "divider",
              bgcolor: "rgba(255,255,255,0.76)",
              backdropFilter: "blur(8px)",
              overflowX: "hidden",
              transition: (theme) =>
                theme.transitions.create("width", {
                  easing: theme.transitions.easing.sharp,
                  duration: theme.transitions.duration.shorter,
                }),
            },
          }}
        >
          {drawer}
        </Drawer>
      </Box>

      <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, sm: 3 }, mt: { xs: 8, sm: 9 } }}>
        {children}
      </Box>
    </Box>
  );
}
