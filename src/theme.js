import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#0f766e",
      dark: "#115e59",
      light: "#14b8a6",
      contrastText: "#ffffff",
    },
    background: {
      default: "#f7f2e9",
      paper: "#ffffff",
    },
    text: {
      primary: "#1f2937",
      secondary: "#5f6672",
    },
  },
  typography: {
    fontFamily: "'Space Grotesk', 'Poppins', 'Segoe UI', sans-serif",
    h4: { fontWeight: 800 },
    h5: { fontWeight: 750 },
  },
  shape: {
    borderRadius: 12,
  },
});

export default theme;
