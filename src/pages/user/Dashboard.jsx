import BedtimeRoundedIcon from "@mui/icons-material/BedtimeRounded";
import BoltRoundedIcon from "@mui/icons-material/BoltRounded";
import DirectionsRunRoundedIcon from "@mui/icons-material/DirectionsRunRounded";
import EmojiEventsRoundedIcon from "@mui/icons-material/EmojiEventsRounded";
import FavoriteRoundedIcon from "@mui/icons-material/FavoriteRounded";
import InsightsRoundedIcon from "@mui/icons-material/InsightsRounded";
import LocalDiningRoundedIcon from "@mui/icons-material/LocalDiningRounded";
import MonitorHeartRoundedIcon from "@mui/icons-material/MonitorHeartRounded";
import PsychologyRoundedIcon from "@mui/icons-material/PsychologyRounded";
import SelfImprovementRoundedIcon from "@mui/icons-material/SelfImprovementRounded";
import SpaRoundedIcon from "@mui/icons-material/SpaRounded";
import StarsRoundedIcon from "@mui/icons-material/StarsRounded";
import WaterDropRoundedIcon from "@mui/icons-material/WaterDropRounded";
import WorkspacePremiumRoundedIcon from "@mui/icons-material/WorkspacePremiumRounded";
import {
  Avatar,
  Box,
  Button,
  Chip,
  Divider,
  Grid,
  LinearProgress,
  Paper,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import {
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import Layout from "../../layouts/commonLayout/Layout";
import { getRaisedGradient, getSurfaceBackground } from "../../theme";

const metrics = [
  {
    label: "Sleep",
    score: 4.5,
    progress: 82,
    change: "+62%",
    color: "#7c3aed",
    icon: <BedtimeRoundedIcon fontSize="small" />,
  },
  {
    label: "Stress",
    score: 5.0,
    progress: 88,
    change: "+47%",
    color: "#ea580c",
    icon: <PsychologyRoundedIcon fontSize="small" />,
  },
  {
    label: "Nutrition",
    score: 4.4,
    progress: 79,
    change: "+41%",
    color: "#16a34a",
    icon: <LocalDiningRoundedIcon fontSize="small" />,
  },
  {
    label: "Hydration",
    score: 4.6,
    progress: 84,
    change: "+55%",
    color: "#0284c7",
    icon: <WaterDropRoundedIcon fontSize="small" />,
  },
  {
    label: "Digestion",
    score: 5.0,
    progress: 91,
    change: "+56%",
    color: "#65a30d",
    icon: <SpaRoundedIcon fontSize="small" />,
  },
  {
    label: "Activity",
    score: 4.5,
    progress: 77,
    change: "+56%",
    color: "#f59e0b",
    icon: <DirectionsRunRoundedIcon fontSize="small" />,
  },
  {
    label: "Pain/Posture",
    score: 4.8,
    progress: 81,
    change: "+45%",
    color: "#c026d3",
    icon: <SelfImprovementRoundedIcon fontSize="small" />,
  },
  {
    label: "Energy",
    score: 4.2,
    progress: 74,
    change: "+35%",
    color: "#ca8a04",
    icon: <BoltRoundedIcon fontSize="small" />,
  },
  {
    label: "Emotional",
    score: 5.0,
    progress: 90,
    change: "+67%",
    color: "#059669",
    icon: <FavoriteRoundedIcon fontSize="small" />,
  },
];

const highlightStats = [
  {
    label: "Wellness score",
    value: "92.5",
    note: "Up from last check-in",
    color: "#0f766e",
    icon: <MonitorHeartRoundedIcon fontSize="small" />,
  },
  {
    label: "XP today",
    value: "340 pts",
    note: "6 of 8 focus steps complete",
    color: "#c2410c",
    icon: <StarsRoundedIcon fontSize="small" />,
  },
  {
    label: "Current level",
    value: "Banyan Sapling",
    note: "3 more days to next milestone",
    color: "#4d7c0f",
    icon: <WorkspacePremiumRoundedIcon fontSize="small" />,
  },
  {
    label: "Active streak",
    value: "7 days",
    note: "Consistency is driving recovery",
    color: "#1d4ed8",
    icon: <EmojiEventsRoundedIcon fontSize="small" />,
  },
];

const trendData = [
  { name: "W1", social: 2.8, hydration: 3.2, energy: 3.4 },
  { name: "W2", social: 3.0, hydration: 3.5, energy: 3.6 },
  { name: "W3", social: 3.2, hydration: 3.7, energy: 3.8 },
  { name: "W4", social: 3.5, hydration: 4.0, energy: 4.0 },
  { name: "W5", social: 3.8, hydration: 4.2, energy: 4.1 },
  { name: "W6", social: 4.0, hydration: 4.4, energy: 4.3 },
  { name: "W7", social: 4.3, hydration: 4.5, energy: 4.4 },
  { name: "W8", social: 4.6, hydration: 4.7, energy: 4.5 },
];

const wellnessIndexData = [
  { name: "Sleep", value: 14, color: "#7c3aed" },
  { name: "Stress", value: 10, color: "#ea580c" },
  { name: "Nutrition", value: 16, color: "#16a34a" },
  { name: "Hydration", value: 12, color: "#0284c7" },
  { name: "Digestion", value: 11, color: "#65a30d" },
  { name: "Activity", value: 13, color: "#f59e0b" },
  { name: "Pain/Posture", value: 9, color: "#c026d3" },
  { name: "Energy", value: 15, color: "#ca8a04" },
];

const doshaData = [
  { name: "Vata", value: 30, color: "#0ea5e9" },
  { name: "Pitta", value: 34, color: "#f97316" },
  { name: "Kapha", value: 36, color: "#22c55e" },
];

const suggestions = [
  {
    title: "Digestion",
    flagged: "T2 - 20 flagged",
    color: "#65a30d",
    items: [
      "Eat lighter dinners and keep a 2-hour gap before sleep.",
      "Add warm water and fiber-rich foods during workdays.",
    ],
  },
  {
    title: "Stress",
    flagged: "T2 - 30 flagged",
    color: "#ea580c",
    items: [
      "Schedule two short breaks between long task blocks.",
      "Reduce late caffeine and add a wind-down routine.",
    ],
  },
  {
    title: "Pain/Posture",
    flagged: "T2 - 19 flagged",
    color: "#c026d3",
    items: [
      "Stand and stretch every 45 minutes during desk work.",
      "Raise laptop height to reduce neck strain.",
    ],
  },
];

const focusActions = [
  {
    title: "Hydration Mission",
    caption: "Progress KPI",
    detail: "Drink 8 glasses today. You're almost there.",
    accent: "#0284c7",
    progress: 75,
    value: "6 / 8",
  },
  {
    title: "Sleep Before 10 PM",
    caption: "Recovery KPI",
    detail: "One focused habit is improving your sleep consistency.",
    accent: "#7c3aed",
    progress: 68,
    value: "Committed",
  },
  {
    title: "Move Your Body",
    caption: "Activity KPI",
    detail: "Add one quick walk or light session before evening.",
    accent: "#f59e0b",
    progress: 52,
    value: "15 min",
  },
];

const leaderboard = [
  { name: "Priya S.", team: "Engineering - Delhi", delta: "+42%" },
  { name: "Rahul M.", team: "Product - Mumbai", delta: "+38%" },
  { name: "Anjali K.", team: "HR - BLR", delta: "+35%" },
  { name: "Amit R.", team: "Finance - Delhi", delta: "+31%", current: true },
  { name: "Sneha P.", team: "Marketing - Pune", delta: "+28%" },
];

function SectionCard({ children, sx }) {
  const theme = useTheme();

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2, sm: 2.5 },
        borderRadius: 3,
        border: "1px solid",
        borderColor: "divider",
        bgcolor: getSurfaceBackground(theme),
        ...sx,
      }}
    >
      {children}
    </Paper>
  );
}

function MetricCard({ item }) {
  const theme = useTheme();

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        borderRadius: 3,
        border: "1px solid",
        borderColor: alpha(item.color, 0.22),
        background: getRaisedGradient(theme, item.color),
        height: "100%",
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: 2.5,
            display: "grid",
            placeItems: "center",
            bgcolor: alpha(item.color, 0.12),
            color: item.color,
          }}
        >
          {item.icon}
        </Box>
        <Chip
          label={item.change}
          size="small"
          sx={{
            bgcolor: alpha(item.color, 0.1),
            color: item.color,
            fontWeight: 700,
          }}
        />
      </Stack>

      <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
        {item.label}
      </Typography>
      <Typography
        variant="h4"
        sx={{ mt: 0.5, fontWeight: 800, color: item.color }}
      >
        {item.score}
      </Typography>
      <LinearProgress
        variant="determinate"
        value={item.progress}
        sx={{
          mt: 2,
          height: 8,
          borderRadius: 999,
          bgcolor: alpha(item.color, 0.12),
          "& .MuiLinearProgress-bar": {
            borderRadius: 999,
            bgcolor: item.color,
          },
        }}
      />
    </Paper>
  );
}

function HighlightStat({ item }) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        borderRadius: 3,
        border: "1px solid",
        borderColor: alpha(item.color, 0.18),
        bgcolor: alpha(item.color, 0.04),
        height: "100%",
      }}
    >
      <Stack direction="row" spacing={1.2} alignItems="center">
        <Avatar
          sx={{
            bgcolor: alpha(item.color, 0.14),
            color: item.color,
            width: 36,
            height: 36,
          }}
        >
          {item.icon}
        </Avatar>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="body2" color="text.secondary">
            {item.label}
          </Typography>
          <Typography
            sx={{
              fontWeight: 800,
              color: item.color,
              fontSize: item.value.length > 10 ? 22 : 30,
              lineHeight: 1.15,
            }}
          >
            {item.value}
          </Typography>
        </Box>
      </Stack>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 1.2 }}>
        {item.note}
      </Typography>
    </Paper>
  );
}

export default function Dashboard() {
  const theme = useTheme();
  const navigate = useNavigate();
  const chartTooltipStyles = {
    contentStyle: {
      backgroundColor: getSurfaceBackground(theme, 0.98),
      border: `1px solid ${alpha(theme.palette.divider, 1)}`,
      borderRadius: 12,
      boxShadow: theme.shadows[8],
    },
    labelStyle: {
      color: theme.palette.text.secondary,
      fontWeight: 700,
    },
    itemStyle: {
      color: theme.palette.text.primary,
    },
  };

  return (
    <Layout role="user" title="Wellness Dashboard">
      <Stack spacing={2.5}>
        <SectionCard
          sx={{
            overflow: "hidden",
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, theme.palette.mode === "dark" ? 0.24 : 0.12)} 0%, ${getSurfaceBackground(theme, theme.palette.mode === "dark" ? 0.96 : 0.92)} 52%, ${alpha("#f59e0b", theme.palette.mode === "dark" ? 0.18 : 0.1)} 100%)`,
            position: "relative",
          }}
        >
          <Box
            sx={{
              position: "absolute",
              top: -40,
              right: -30,
              width: 220,
              height: 220,
              borderRadius: "50%",
              background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, theme.palette.mode === "dark" ? 0.22 : 0.12)}, transparent 68%)`,
            }}
          />
          <Stack
            direction={{ xs: "column", lg: "row" }}
            justifyContent="space-between"
            spacing={2}
            alignItems={{ lg: "center" }}
            sx={{ position: "relative" }}
          >
            <Box>
              <Typography
                variant="overline"
                sx={{ color: "primary.main", fontWeight: 700 }}
              >
                Personal Wellness Journey
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5 }}>
                Welcome back, Ayumonk User
              </Typography>
              <Typography color="text.secondary" sx={{ mt: 1, maxWidth: 760 }}>
                Your dashboard now blends the wellness overview with progress,
                streak, and performance-style cards inspired by the other
                product tabs.
              </Typography>
            </Box>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
              <Chip
                label="My Wellness"
                color="primary"
                sx={{ fontWeight: 700 }}
              />
              <Chip
                label="Challenges"
                variant="outlined"
                sx={{ fontWeight: 700 }}
              />
              <Chip
                label="HR Analytics"
                variant="outlined"
                sx={{ fontWeight: 700 }}
              />
              <Button
                variant="contained"
                onClick={() => navigate("/user/my-responses")}
              >
                View Responses
              </Button>
            </Stack>
          </Stack>
        </SectionCard>

        <Grid container spacing={2}>
          {highlightStats.map((item) => (
            <Grid key={item.label} size={{ xs: 12, sm: 6, xl: 3 }}>
              <HighlightStat item={item} />
            </Grid>
          ))}
        </Grid>

        <Grid container spacing={2}>
          {metrics.map((item) => (
            <Grid
              key={item.label}
              size={{ xs: 12, sm: 4, md: 2, lg: 7 / 4, xl: 4 / 3 }}
            >
              <MetricCard item={item} />
            </Grid>
          ))}
        </Grid>

        <Grid container spacing={2.5}>
          <Grid size={{ xs: 12, lg: 8.2 }}>
            <Grid container spacing={2.5}>
              <Grid size={{ xs: 12, lg: 4.4 }}>
                <SectionCard sx={{ height: "100%" }}>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Wellness Index
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2 }}
                  >
                    Overall score based on your key wellness factors
                  </Typography>

                  <Box sx={{ position: "relative", height: 230 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={wellnessIndexData}
                          dataKey="value"
                          innerRadius={62}
                          outerRadius={90}
                          paddingAngle={2}
                          stroke="none"
                        >
                          {wellnessIndexData.map((entry) => (
                            <Cell key={entry.name} fill={entry.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    <Box
                      sx={{
                        position: "absolute",
                        inset: 0,
                        display: "grid",
                        placeItems: "center",
                        textAlign: "center",
                      }}
                    >
                      <Box>
                        <Typography variant="h3" sx={{ fontWeight: 800 }}>
                          92.5
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          / 100
                        </Typography>
                      </Box>
                    </Box>
                  </Box>

                  <Stack
                    direction="row"
                    flexWrap="wrap"
                    useFlexGap
                    spacing={1}
                    sx={{ rowGap: 1, mt: 1 }}
                  >
                    {wellnessIndexData.map((item) => (
                      <Stack
                        key={item.name}
                        direction="row"
                        spacing={0.8}
                        alignItems="center"
                      >
                        <Box
                          sx={{
                            width: 10,
                            height: 10,
                            borderRadius: "50%",
                            bgcolor: item.color,
                          }}
                        />
                        <Typography variant="caption" color="text.secondary">
                          {item.name}
                        </Typography>
                      </Stack>
                    ))}
                  </Stack>

                  <Chip
                    label="43% improvement from baseline"
                    sx={{
                      mt: 2,
                      bgcolor: alpha("#16a34a", 0.1),
                      color: "#15803d",
                      fontWeight: 700,
                    }}
                  />
                </SectionCard>
              </Grid>

              <Grid size={{ xs: 12, lg: 7.6 }}>
                <SectionCard sx={{ height: "100%" }}>
                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    justifyContent="space-between"
                    alignItems={{ sm: "center" }}
                    spacing={1.5}
                    sx={{ mb: 2 }}
                  >
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        Wellness Trends
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Weekly movement across your strongest improvement areas
                      </Typography>
                    </Box>
                    <Stack direction="row" spacing={1}>
                      <Chip label="Daily" size="small" variant="outlined" />
                      <Chip label="Weekly" size="small" color="primary" />
                      <Chip label="Monthly" size="small" variant="outlined" />
                    </Stack>
                  </Stack>

                  <ResponsiveContainer width="100%" height={290}>
                    <LineChart data={trendData}>
                      <XAxis dataKey="name" />
                      <YAxis domain={[2, 5]} />
                      <Tooltip {...chartTooltipStyles} />
                      <Line
                        type="monotone"
                        dataKey="social"
                        stroke="#d946ef"
                        strokeWidth={3}
                        dot={false}
                      />
                      <Line
                        type="monotone"
                        dataKey="hydration"
                        stroke="#0284c7"
                        strokeWidth={3}
                        dot={false}
                      />
                      <Line
                        type="monotone"
                        dataKey="energy"
                        stroke="#ca8a04"
                        strokeWidth={3}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>

                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={1}
                    sx={{ mt: 1.5 }}
                  >
                    <Chip
                      label="Social +17%"
                      sx={{
                        bgcolor: alpha("#d946ef", 0.1),
                        color: "#a21caf",
                        fontWeight: 700,
                      }}
                    />
                    <Chip
                      label="Hydration +15%"
                      sx={{
                        bgcolor: alpha("#0284c7", 0.1),
                        color: "#0369a1",
                        fontWeight: 700,
                      }}
                    />
                    <Typography variant="body2" color="text.secondary">
                      Most stable gains are showing up in hydration and
                      recovery.
                    </Typography>
                  </Stack>
                </SectionCard>
              </Grid>

              <Grid size={12}>
                <SectionCard>
                  <Stack
                    direction={{ xs: "column", md: "row" }}
                    justifyContent="space-between"
                    spacing={1}
                    sx={{ mb: 2 }}
                  >
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        Daily Focus Programs
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Borrowed from the challenge screens to make your next
                        actions clearer
                      </Typography>
                    </Box>
                    <Stack direction="row" spacing={1}>
                      <Chip label="3 active" size="small" color="primary" />
                      <Chip
                        label="1 upcoming"
                        size="small"
                        variant="outlined"
                      />
                    </Stack>
                  </Stack>

                  <Grid container spacing={2}>
                    {focusActions.map((item) => (
                      <Grid key={item.title} size={{ xs: 12, md: 4 }}>
                        <Paper
                          variant="outlined"
                          sx={{
                            p: 2,
                            borderRadius: 3,
                            borderColor: alpha(item.accent, 0.22),
                            background: `linear-gradient(180deg, ${alpha(item.accent, theme.palette.mode === "dark" ? 0.14 : 0.05)} 0%, ${getSurfaceBackground(theme, theme.palette.mode === "dark" ? 0.98 : 0.92)} 100%)`,
                            height: "100%",
                          }}
                        >
                          <Stack
                            direction="row"
                            justifyContent="space-between"
                            alignItems="flex-start"
                          >
                            <Box>
                              <Typography sx={{ fontWeight: 800 }}>
                                {item.title}
                              </Typography>
                              <Typography
                                variant="caption"
                                sx={{ color: item.accent, fontWeight: 700 }}
                              >
                                {item.caption}
                              </Typography>
                            </Box>
                            <Chip
                              label={item.value}
                              size="small"
                              sx={{
                                bgcolor: alpha(item.accent, 0.1),
                                color: item.accent,
                                fontWeight: 700,
                              }}
                            />
                          </Stack>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mt: 1.2, mb: 1.5 }}
                          >
                            {item.detail}
                          </Typography>
                          <LinearProgress
                            variant="determinate"
                            value={item.progress}
                            sx={{
                              height: 8,
                              borderRadius: 999,
                              bgcolor: alpha(item.accent, 0.12),
                              "& .MuiLinearProgress-bar": {
                                bgcolor: item.accent,
                                borderRadius: 999,
                              },
                            }}
                          />
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                </SectionCard>
              </Grid>
            </Grid>
          </Grid>

          <Grid size={{ xs: 12, lg: 3.8 }}>
            <Stack spacing={2.5}>
              <SectionCard>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Dosha Profile
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 2 }}
                >
                  Balanced composition based on the latest assessment
                </Typography>

                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={doshaData}
                      dataKey="value"
                      innerRadius={48}
                      outerRadius={82}
                      stroke="none"
                    >
                      {doshaData.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>

                <Stack spacing={1.2}>
                  {doshaData.map((item) => (
                    <Stack
                      key={item.name}
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Box
                          sx={{
                            width: 10,
                            height: 10,
                            borderRadius: "50%",
                            bgcolor: item.color,
                          }}
                        />
                        <Typography variant="body2">{item.name}</Typography>
                      </Stack>
                      <Typography sx={{ fontWeight: 700, color: item.color }}>
                        {item.value}%
                      </Typography>
                    </Stack>
                  ))}
                </Stack>

                <Divider sx={{ my: 2 }} />

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 1 }}
                >
                  Today&apos;s Mood Check
                </Typography>
                <Stack
                  direction="row"
                  spacing={1}
                  justifyContent="space-between"
                >
                  {["Sad", "Low", "Okay", "Good", "Great"].map(
                    (label, index) => (
                      <Chip
                        key={label}
                        label={label}
                        color={index === 3 ? "primary" : "default"}
                        variant={index === 3 ? "filled" : "outlined"}
                        sx={{ minWidth: 0 }}
                      />
                    ),
                  )}
                </Stack>
              </SectionCard>

              <SectionCard>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  sx={{ mb: 1.5 }}
                >
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      Weekly Leaderboard
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Friendly benchmark from your peer wellness cohort
                    </Typography>
                  </Box>
                  <InsightsRoundedIcon color="primary" />
                </Stack>

                <Stack spacing={1.2}>
                  {leaderboard.map((item, index) => (
                    <Paper
                      key={item.name}
                      variant="outlined"
                      sx={{
                        p: 1.4,
                        borderRadius: 2.5,
                        borderColor: item.current
                          ? alpha("#0f766e", 0.3)
                          : "divider",
                        bgcolor: item.current
                          ? alpha("#0f766e", 0.06)
                          : "transparent",
                      }}
                    >
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                      >
                        <Stack
                          direction="row"
                          spacing={1.2}
                          alignItems="center"
                        >
                          <Typography
                            sx={{
                              width: 24,
                              fontWeight: 800,
                              color: index < 3 ? "#c2410c" : "text.secondary",
                            }}
                          >
                            {index + 1}
                          </Typography>
                          <Box>
                            <Typography
                              sx={{ fontWeight: item.current ? 800 : 700 }}
                            >
                              {item.current
                                ? `4th - You (${item.name})`
                                : item.name}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {item.team}
                            </Typography>
                          </Box>
                        </Stack>
                        <Typography
                          sx={{
                            fontWeight: 800,
                            color: item.current ? "#15803d" : "#0f766e",
                          }}
                        >
                          {item.delta}
                        </Typography>
                      </Stack>
                    </Paper>
                  ))}
                </Stack>
              </SectionCard>
            </Stack>
          </Grid>
        </Grid>

        <SectionCard>
          <Stack
            direction={{ xs: "column", md: "row" }}
            justifyContent="space-between"
            spacing={1}
            sx={{ mb: 2 }}
          >
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Lifestyle Suggestions
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Focus areas this week using static wellness signals
              </Typography>
            </Box>
            <Stack direction="row" spacing={1}>
              <Chip
                label="Tier 1 - KPI risk"
                size="small"
                sx={{ fontWeight: 700 }}
              />
              <Chip
                label="Tier 2 - Question score"
                size="small"
                variant="outlined"
                sx={{ fontWeight: 700 }}
              />
            </Stack>
          </Stack>

          <Grid container spacing={2}>
            {suggestions.map((item) => (
              <Grid key={item.title} size={{ xs: 12, md: 4 }}>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
                    borderRadius: 3,
                    borderLeft: `4px solid ${item.color}`,
                    height: "100%",
                  }}
                >
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{ mb: 1.5 }}
                  >
                    <Typography sx={{ fontWeight: 800, color: item.color }}>
                      {item.title}
                    </Typography>
                    <Chip
                      label={item.flagged}
                      size="small"
                      sx={{
                        bgcolor: alpha(item.color, 0.1),
                        color: item.color,
                        fontWeight: 700,
                      }}
                    />
                  </Stack>
                  <Stack spacing={1}>
                    {item.items.map((text) => (
                      <Box
                        key={text}
                        sx={{
                          p: 1.2,
                          borderRadius: 2,
                          bgcolor: alpha(item.color, 0.06),
                        }}
                      >
                        <Typography variant="body2" color="text.secondary">
                          {text}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </SectionCard>
      </Stack>
    </Layout>
  );
}
