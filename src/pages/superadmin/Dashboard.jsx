import {
  Avatar,
  Box,
  Chip,
  Grid,
  LinearProgress,
  Paper,
  Stack,
  Typography,
  useTheme,
  Divider,
} from "@mui/material";
import ApartmentRoundedIcon from "@mui/icons-material/ApartmentRounded";
import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
import HubRoundedIcon from "@mui/icons-material/HubRounded";
import InsightsRoundedIcon from "@mui/icons-material/InsightsRounded";
import PublicRoundedIcon from "@mui/icons-material/PublicRounded";
import SecurityRoundedIcon from "@mui/icons-material/SecurityRounded";
import StarsRoundedIcon from "@mui/icons-material/StarsRounded";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import { alpha } from "@mui/material/styles";
import Layout from "../../layouts/commonLayout/Layout";
import { getRaisedGradient, getSurfaceBackground } from "../../theme";

const heroStats = [
  {
    label: "Enterprise Accounts",
    value: "128",
    note: "+12 this quarter",
    color: "#0f766e",
    icon: <ApartmentRoundedIcon fontSize="small" />,
  },
  {
    label: "Active Employees",
    value: "48.2K",
    note: "Across all tenants",
    color: "#1d4ed8",
    icon: <GroupsRoundedIcon fontSize="small" />,
  },
  {
    label: "Live Sessions",
    value: "312",
    note: "24 publishing today",
    color: "#c2410c",
    icon: <HubRoundedIcon fontSize="small" />,
  },
  {
    label: "Platform Health",
    value: "99.94%",
    note: "Last 30 days uptime",
    color: "#15803d",
    icon: <SecurityRoundedIcon fontSize="small" />,
  },
];

const networkCards = [
  {
    title: "North America",
    tenants: 34,
    employees: "12.4K",
    progress: 72,
    color: "#0284c7",
  },
  {
    title: "India",
    tenants: 49,
    employees: "21.8K",
    progress: 88,
    color: "#7c3aed",
  },
  {
    title: "Middle East",
    tenants: 18,
    employees: "6.1K",
    progress: 54,
    color: "#ea580c",
  },
  {
    title: "Europe",
    tenants: 27,
    employees: "7.9K",
    progress: 63,
    color: "#16a34a",
  },
];

const governanceItems = [
  {
    title: "Tenant Onboarding",
    metric: "14 pending reviews",
    detail: "5 enterprise contracts are blocked on data policy verification.",
    accent: "#1d4ed8",
  },
  {
    title: "Content Governance",
    metric: "92.8% approved",
    detail:
      "Question, KPI, and challenge content approval is stable across regions.",
    accent: "#0f766e",
  },
  {
    title: "Security Compliance",
    metric: "3 follow-ups",
    detail:
      "Two orgs need renewed SSO certificates and one needs IP allow-list refresh.",
    accent: "#b45309",
  },
];

const growthSignals = [
  { label: "New tenants", value: "18", tone: "#0f766e" },
  { label: "Renewals due", value: "9", tone: "#c2410c" },
  { label: "Expansion opportunities", value: "22", tone: "#7c3aed" },
  { label: "Avg adoption", value: "76%", tone: "#15803d" },
];

const leaderRegions = [
  {
    name: "India Enterprise Cluster",
    score: "84.2",
    note: "Best participation momentum",
  },
  {
    name: "US Health Network",
    score: "81.7",
    note: "Strong challenge completion rate",
  },
  {
    name: "Middle East Retail Group",
    score: "78.9",
    note: "Fastest onboarding cycle improvement",
  },
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

function StatCard({ item }) {
  const theme = useTheme();

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        borderRadius: 3,
        border: "1px solid",
        borderColor: alpha(item.color, 0.2),
        background: getRaisedGradient(theme, item.color),
        height: "100%",
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Avatar
          sx={{
            bgcolor: alpha(item.color, 0.14),
            color: item.color,
            width: 42,
            height: 42,
          }}
        >
          {item.icon}
        </Avatar>
        <Chip
          label={item.note}
          size="small"
          sx={{
            bgcolor: alpha(item.color, 0.1),
            color: item.color,
            fontWeight: 700,
          }}
        />
      </Stack>

      <Typography color="text.secondary" sx={{ mt: 1.5 }}>
        {item.label}
      </Typography>
      <Typography
        variant="h4"
        sx={{ fontWeight: 800, mt: 0.4, color: item.color }}
      >
        {item.value}
      </Typography>
    </Paper>
  );
}

export default function Dashboard() {
  const theme = useTheme();

  return (
    <Layout role="superadmin" title="Super Admin Dashboard">
      <Stack spacing={2.5}>
        <SectionCard
          sx={{
            overflow: "hidden",
            position: "relative",
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, theme.palette.mode === "dark" ? 0.24 : 0.1)} 0%, ${getSurfaceBackground(theme, theme.palette.mode === "dark" ? 0.98 : 0.94)} 55%, ${alpha("#f59e0b", theme.palette.mode === "dark" ? 0.14 : 0.08)} 100%)`,
          }}
        >
          <Box
            sx={{
              position: "absolute",
              right: -30,
              top: -28,
              width: 220,
              height: 220,
              borderRadius: "50%",
              background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, theme.palette.mode === "dark" ? 0.18 : 0.1)}, transparent 70%)`,
            }}
          />

          <Stack
            direction={{ xs: "column", lg: "row" }}
            justifyContent="space-between"
            spacing={2}
            sx={{ position: "relative" }}
          >
            <Box sx={{ maxWidth: 820 }}>
              <Typography
                variant="overline"
                sx={{ color: "primary.main", fontWeight: 700 }}
              >
                Global Platform Command
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.5 }}>
                Super Admin Control Center
              </Typography>
              <Typography color="text.secondary" sx={{ mt: 1 }}>
                Static executive dashboard for platform-wide oversight across
                tenants, adoption, governance, and operational health.
              </Typography>
            </Box>

            <Stack
              direction={{ xs: "row", sm: "row" }}
              spacing={1}
              flexWrap="wrap"
              useFlexGap
            >
              <Chip label="Tenants" color="primary" sx={{ fontWeight: 700 }} />
              <Chip
                label="Governance"
                variant="outlined"
                sx={{ fontWeight: 700 }}
              />
              <Chip
                label="Growth"
                variant="outlined"
                sx={{ fontWeight: 700 }}
              />
            </Stack>
          </Stack>
        </SectionCard>

        <Grid container spacing={2}>
          {heroStats.map((item) => (
            <Grid key={item.label} size={{ xs: 12, sm: 6, xl: 3 }}>
              <StatCard item={item} />
            </Grid>
          ))}
        </Grid>

        <Grid container spacing={2.5}>
          <Grid size={{ xs: 12, lg: 7.5 }}>
            <SectionCard>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                justifyContent="space-between"
                spacing={1}
                sx={{ mb: 2 }}
              >
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Regional Adoption Network
                  </Typography>
                  <Typography color="text.secondary" variant="body2">
                    Static tenant and employee distribution snapshot by region.
                  </Typography>
                </Box>
                <Chip
                  label="Updated just now"
                  icon={<PublicRoundedIcon />}
                  variant="outlined"
                />
              </Stack>

              <Grid container spacing={2}>
                {networkCards.map((item) => (
                  <Grid key={item.title} size={{ xs: 12, md: 6 }}>
                    <Paper
                      variant="outlined"
                      sx={{
                        p: 2,
                        borderRadius: 3,
                        borderColor: alpha(item.color, 0.22),
                        height: "100%",
                      }}
                    >
                      <Stack spacing={1.25}>
                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          alignItems="center"
                        >
                          <Typography sx={{ fontWeight: 700 }}>
                            {item.title}
                          </Typography>
                          <Chip
                            label={`${item.tenants} tenants`}
                            size="small"
                            sx={{
                              bgcolor: alpha(item.color, 0.1),
                              color: item.color,
                              fontWeight: 700,
                            }}
                          />
                        </Stack>
                        <Typography variant="body2" color="text.secondary">
                          Active employees: {item.employees}
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={item.progress}
                          sx={{
                            height: 8,
                            borderRadius: 999,
                            bgcolor: alpha(item.color, 0.12),
                            "& .MuiLinearProgress-bar": {
                              bgcolor: item.color,
                              borderRadius: 999,
                            },
                          }}
                        />
                        <Typography variant="body2" color="text.secondary">
                          Adoption maturity: {item.progress}%
                        </Typography>
                      </Stack>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </SectionCard>
          </Grid>

          <Grid size={{ xs: 12, lg: 4.5 }}>
            <SectionCard sx={{ height: "100%" }}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                sx={{ mb: 2 }}
              >
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Growth Signals
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Static operating indicators
                  </Typography>
                </Box>
                <TrendingUpRoundedIcon color="primary" />
              </Stack>

              <Stack spacing={1.25}>
                {growthSignals.map((item) => (
                  <Paper
                    key={item.label}
                    variant="outlined"
                    sx={{ p: 1.5, borderRadius: 2.5 }}
                  >
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Typography color="text.secondary">
                        {item.label}
                      </Typography>
                      <Typography sx={{ fontWeight: 800, color: item.tone }}>
                        {item.value}
                      </Typography>
                    </Stack>
                  </Paper>
                ))}
              </Stack>

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.2 }}>
                Leading Regions
              </Typography>
              <Stack spacing={1.2}>
                {leaderRegions.map((item, index) => (
                  <Stack
                    key={item.name}
                    direction="row"
                    spacing={1.2}
                    alignItems="flex-start"
                  >
                    <Avatar
                      sx={{
                        width: 30,
                        height: 30,
                        fontSize: 14,
                        bgcolor: alpha(theme.palette.primary.main, 0.12),
                        color: "primary.main",
                      }}
                    >
                      {index + 1}
                    </Avatar>
                    <Box>
                      <Typography sx={{ fontWeight: 700 }}>
                        {item.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {item.note}
                      </Typography>
                      <Typography
                        sx={{ mt: 0.5, color: "primary.main", fontWeight: 700 }}
                      >
                        Score: {item.score}
                      </Typography>
                    </Box>
                  </Stack>
                ))}
              </Stack>
            </SectionCard>
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
                Governance Watchlist
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Static oversight items for policy, onboarding, and compliance
                review.
              </Typography>
            </Box>
            <Chip
              label="Executive Summary"
              icon={<StarsRoundedIcon />}
              color="primary"
              variant="outlined"
            />
          </Stack>

          <Grid container spacing={2}>
            {governanceItems.map((item) => (
              <Grid key={item.title} size={{ xs: 12, md: 4 }}>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
                    borderRadius: 3,
                    borderTop: `4px solid ${item.accent}`,
                    height: "100%",
                  }}
                >
                  <Typography sx={{ fontWeight: 800, color: item.accent }}>
                    {item.title}
                  </Typography>
                  <Typography sx={{ mt: 0.8, fontWeight: 700 }}>
                    {item.metric}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 1 }}
                  >
                    {item.detail}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </SectionCard>
      </Stack>
    </Layout>
  );
}
