import { useEffect, useRef, useState } from "react";
import BrushRoundedIcon from "@mui/icons-material/BrushRounded";
import AutoFixOffRoundedIcon from "@mui/icons-material/AutoFixOffRounded";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import UndoRoundedIcon from "@mui/icons-material/UndoRounded";
import DeleteSweepRoundedIcon from "@mui/icons-material/DeleteSweepRounded";
import PaletteRoundedIcon from "@mui/icons-material/PaletteRounded";
import {
  Box,
  Button,
  Chip,
  Paper,
  Slider,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  useTheme,
} from "@mui/material";
import { alpha } from "@mui/material/styles";

const hiddenPath = "/vault/ink-room-7f3a";
const presetColors = [
  "#f8fafc",
  "#38bdf8",
  "#2dd4bf",
  "#f59e0b",
  "#f97316",
  "#f43f5e",
  "#8b5cf6",
  "#0f172a",
];

export const SKETCH_LAB_PATH = hiddenPath;

export default function SketchLab() {
  const theme = useTheme();
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const snapshotRef = useRef([]);
  const drawingRef = useRef(false);
  const lastPointRef = useRef(null);
  const [tool, setTool] = useState("brush");
  const [brushColor, setBrushColor] = useState("#38bdf8");
  const [brushSize, setBrushSize] = useState(6);
  const [canvasReady, setCanvasReady] = useState(false);

  const surfaceColor =
    theme.palette.mode === "dark"
      ? alpha(theme.palette.background.paper, 0.88)
      : alpha("#ffffff", 0.88);

  const getContext = () => {
    const canvas = canvasRef.current;
    return canvas ? canvas.getContext("2d") : null;
  };

  const configureCanvas = (preserveDrawing = true) => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const existing = preserveDrawing ? canvas.toDataURL("image/png") : null;
    const rect = container.getBoundingClientRect();
    const ratio = window.devicePixelRatio || 1;

    canvas.width = Math.floor(rect.width * ratio);
    canvas.height = Math.floor(Math.max(520, window.innerHeight - 220) * ratio);
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${Math.max(520, window.innerHeight - 220)}px`;

    const context = canvas.getContext("2d");
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    context.lineCap = "round";
    context.lineJoin = "round";

    context.fillStyle = theme.palette.mode === "dark" ? "#071412" : "#f8fafc";
    context.fillRect(0, 0, rect.width, Math.max(520, window.innerHeight - 220));

    if (existing) {
      const image = new Image();
      image.onload = () => {
        context.drawImage(image, 0, 0, rect.width, Math.max(520, window.innerHeight - 220));
      };
      image.src = existing;
    }

    setCanvasReady(true);
  };

  useEffect(() => {
    configureCanvas(false);

    const handleResize = () => configureCanvas(true);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [theme.palette.mode]);

  const saveSnapshot = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    snapshotRef.current = [...snapshotRef.current.slice(-14), canvas.toDataURL("image/png")];
  };

  const getPoint = (event) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  };

  const drawLine = (start, end) => {
    const context = getContext();
    if (!context || !start || !end) return;

    context.beginPath();
    context.strokeStyle =
      tool === "eraser"
        ? theme.palette.mode === "dark"
          ? "#071412"
          : "#f8fafc"
        : brushColor;
    context.lineWidth = brushSize;
    context.moveTo(start.x, start.y);
    context.lineTo(end.x, end.y);
    context.stroke();
  };

  const handlePointerDown = (event) => {
    if (!canvasReady) return;
    saveSnapshot();
    drawingRef.current = true;
    const point = getPoint(event);
    lastPointRef.current = point;
    drawLine(point, point);
  };

  const handlePointerMove = (event) => {
    if (!drawingRef.current) return;
    const point = getPoint(event);
    drawLine(lastPointRef.current, point);
    lastPointRef.current = point;
  };

  const stopDrawing = () => {
    drawingRef.current = false;
    lastPointRef.current = null;
  };

  const handleUndo = () => {
    const previous = snapshotRef.current.at(-1);
    if (!previous) return;

    snapshotRef.current = snapshotRef.current.slice(0, -1);
    const canvas = canvasRef.current;
    const context = getContext();
    if (!canvas || !context) return;

    const image = new Image();
    image.onload = () => {
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.fillStyle = theme.palette.mode === "dark" ? "#071412" : "#f8fafc";
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(
        image,
        0,
        0,
        parseFloat(canvas.style.width),
        parseFloat(canvas.style.height),
      );
    };
    image.src = previous;
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    const context = getContext();
    if (!canvas || !context) return;

    saveSnapshot();
    context.fillStyle = theme.palette.mode === "dark" ? "#071412" : "#f8fafc";
    context.fillRect(0, 0, parseFloat(canvas.style.width), parseFloat(canvas.style.height));
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement("a");
    link.download = "sketch-lab-export.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        px: { xs: 2, md: 3 },
        py: { xs: 2, md: 3 },
        background:
          theme.palette.mode === "dark"
            ? "radial-gradient(circle at top left, rgba(45,212,191,0.16), transparent 28%), linear-gradient(180deg, #03110f 0%, #071412 100%)"
            : "radial-gradient(circle at top left, rgba(14,165,233,0.12), transparent 28%), linear-gradient(180deg, #f8fafc 0%, #eef6ff 100%)",
      }}
    >
      <Stack spacing={2.5}>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2, md: 2.5 },
            borderRadius: 4,
            border: "1px solid",
            borderColor: alpha(theme.palette.divider, 1),
            bgcolor: surfaceColor,
            backdropFilter: "blur(14px)",
          }}
        >
          <Stack spacing={2}>
            <Stack
              direction={{ xs: "column", lg: "row" }}
              justifyContent="space-between"
              spacing={2}
            >
              <Box>
                <Typography variant="overline" sx={{ color: "primary.main", fontWeight: 800 }}>
                  Hidden Workspace
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 900, letterSpacing: "-0.04em" }}>
                  Sketch Lab
                </Typography>
                <Typography color="text.secondary" sx={{ mt: 0.8, maxWidth: 780 }}>
                  A private drawing board hidden behind a direct route. Use brush,
                  eraser, undo, clear, and export just like a lightweight design tool.
                </Typography>
              </Box>
              <Chip
                label={hiddenPath}
                sx={{
                  alignSelf: "flex-start",
                  fontWeight: 700,
                  bgcolor: alpha(theme.palette.primary.main, 0.12),
                  color: "primary.main",
                }}
              />
            </Stack>

            <Stack
              direction={{ xs: "column", xl: "row" }}
              spacing={2}
              alignItems={{ xl: "center" }}
              justifyContent="space-between"
            >
              <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} useFlexGap flexWrap="wrap">
                <ToggleButtonGroup
                  value={tool}
                  exclusive
                  onChange={(_, nextValue) => nextValue && setTool(nextValue)}
                  color="primary"
                >
                  <ToggleButton value="brush">
                    <BrushRoundedIcon sx={{ mr: 1 }} />
                    Brush
                  </ToggleButton>
                  <ToggleButton value="eraser">
                    <AutoFixOffRoundedIcon sx={{ mr: 1 }} />
                    Eraser
                  </ToggleButton>
                </ToggleButtonGroup>

                <Paper
                  elevation={0}
                  sx={{
                    px: 1.5,
                    py: 1,
                    borderRadius: 3,
                    border: "1px solid",
                    borderColor: "divider",
                    bgcolor: alpha(theme.palette.background.paper, 0.5),
                  }}
                >
                  <Stack direction="row" spacing={1} alignItems="center">
                    <PaletteRoundedIcon color="primary" />
                    <Stack direction="row" spacing={1}>
                      {presetColors.map((color) => (
                        <Box
                          key={color}
                          onClick={() => setBrushColor(color)}
                          sx={{
                            width: 26,
                            height: 26,
                            borderRadius: "50%",
                            bgcolor: color,
                            border: brushColor === color ? "3px solid" : "2px solid",
                            borderColor:
                              brushColor === color ? "primary.main" : alpha("#ffffff", 0.5),
                            cursor: "pointer",
                          }}
                        />
                      ))}
                    </Stack>
                  </Stack>
                </Paper>

                <Paper
                  elevation={0}
                  sx={{
                    px: 1.75,
                    py: 1,
                    borderRadius: 3,
                    border: "1px solid",
                    borderColor: "divider",
                    minWidth: 190,
                  }}
                >
                  <Typography variant="caption" color="text.secondary">
                    Brush Size
                  </Typography>
                  <Slider
                    value={brushSize}
                    min={2}
                    max={30}
                    onChange={(_, value) => setBrushSize(value)}
                    sx={{ mt: 0.8 }}
                  />
                </Paper>
              </Stack>

              <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                <Button variant="outlined" startIcon={<UndoRoundedIcon />} onClick={handleUndo}>
                  Undo
                </Button>
                <Button variant="outlined" color="warning" startIcon={<DeleteSweepRoundedIcon />} onClick={handleClear}>
                  Clear
                </Button>
                <Button variant="contained" startIcon={<DownloadRoundedIcon />} onClick={handleDownload}>
                  Export PNG
                </Button>
              </Stack>
            </Stack>
          </Stack>
        </Paper>

        <Paper
          ref={containerRef}
          elevation={0}
          sx={{
            p: 1.25,
            borderRadius: 4,
            border: "1px solid",
            borderColor: alpha(theme.palette.primary.main, 0.18),
            bgcolor: surfaceColor,
            boxShadow:
              theme.palette.mode === "dark"
                ? "0 28px 70px rgba(0, 0, 0, 0.34)"
                : "0 28px 70px rgba(15, 23, 42, 0.08)",
          }}
        >
          <Box
            component="canvas"
            ref={canvasRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={stopDrawing}
            onPointerLeave={stopDrawing}
            sx={{
              display: "block",
              width: "100%",
              borderRadius: 3,
              cursor: tool === "eraser" ? "cell" : "crosshair",
              touchAction: "none",
              backgroundColor: theme.palette.mode === "dark" ? "#071412" : "#f8fafc",
              backgroundImage:
                theme.palette.mode === "dark"
                  ? "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)"
                  : "linear-gradient(rgba(15,23,42,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,42,0.05) 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
          />
        </Paper>
      </Stack>
    </Box>
  );
}
