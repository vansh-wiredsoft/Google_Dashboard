import { useMemo, useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Chip,
  Grid,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { DataGrid } from "@mui/x-data-grid";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import LinkRoundedIcon from "@mui/icons-material/LinkRounded";
import PsychologyAltRoundedIcon from "@mui/icons-material/PsychologyAltRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import SpaRoundedIcon from "@mui/icons-material/SpaRounded";
import TipsAndUpdatesRoundedIcon from "@mui/icons-material/TipsAndUpdatesRounded";
import Layout from "../../layouts/commonLayout/Layout";
import { getRaisedGradient, getSurfaceBackground } from "../../theme";

const suggestionRows = [
  {
    id: 1,
    suggestion_type: "aahar",
    title: "Warm turmeric milk at bedtime",
    description:
      "A calming bedtime drink that supports recovery, digestion, and evening wind-down.",
    url: "https://ayumonk.app/guides/turmeric-milk",
    dosha_type: "vata",
    difficulty: "easy",
    duration_mins: 10,
    is_active: true,
    created_at: "2026-03-21T18:10:00Z",
  },
  {
    id: 2,
    suggestion_type: "vihar",
    title: "Sunrise walk with nasal breathing",
    description:
      "Low-intensity movement in natural light to improve rhythm, breath awareness, and mood.",
    url: "https://ayumonk.app/guides/sunrise-walk",
    dosha_type: "kapha",
    difficulty: "easy",
    duration_mins: 20,
    is_active: true,
    created_at: "2026-03-20T07:30:00Z",
  },
  {
    id: 3,
    suggestion_type: "aushadh",
    title: "Triphala support after dinner",
    description:
      "Traditional digestive support suggestion to be used with practitioner guidance.",
    url: "https://ayumonk.app/guides/triphala-support",
    dosha_type: "all",
    difficulty: "moderate",
    duration_mins: 5,
    is_active: true,
    created_at: "2026-03-18T12:00:00Z",
  },
  {
    id: 4,
    suggestion_type: "vihar",
    title: "Evening digital sunset routine",
    description:
      "Reduce stimulating screen exposure before sleep and replace it with quiet rituals.",
    url: "https://ayumonk.app/guides/digital-sunset",
    dosha_type: "pitta",
    difficulty: "moderate",
    duration_mins: 30,
    is_active: true,
    created_at: "2026-03-15T16:45:00Z",
  },
  {
    id: 5,
    suggestion_type: "aahar",
    title: "Midday cumin-coriander-fennel water",
    description:
      "Light herbal hydration pattern to support digestion and reduce heat build-up.",
    url: "https://ayumonk.app/guides/ccf-water",
    dosha_type: "pitta",
    difficulty: "easy",
    duration_mins: 15,
    is_active: false,
    created_at: "2026-03-14T09:20:00Z",
  },
  {
    id: 6,
    suggestion_type: "aushadh",
    title: "Advanced abhyanga recovery protocol",
    description:
      "A more involved self-oil massage and recovery practice for high-stress fatigue patterns.",
    url: "https://ayumonk.app/guides/abhyanga-recovery",
    dosha_type: "vata",
    difficulty: "advanced",
    duration_mins: 40,
    is_active: true,
    created_at: "2026-03-12T05:55:00Z",
  },
];

const schemaRows = [
  ["id", "SERIAL PRIMARY KEY", "-"],
  ["suggestion_type", "VARCHAR(10) NOT NULL", "aahar / vihar / aushadh"],
  ["title", "VARCHAR(200) NOT NULL", "Suggestion headline"],
  ["description", "TEXT", "Full explanation with rationale"],
  ["url", "VARCHAR(500)", "Guide, recipe, or video link"],
  ["dosha_type", "VARCHAR(10) DEFAULT 'all'", "vata / pitta / kapha / all"],
  ["difficulty", "VARCHAR(10) DEFAULT 'easy'", "easy / moderate / advanced"],
  ["duration_mins", "SMALLINT", "How long the practice takes"],
  ["is_active", "BOOLEAN DEFAULT TRUE", "Visibility control"],
  ["created_at", "TIMESTAMPTZ DEFAULT NOW()", "Audit timestamp"],
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

function MetricCard({ label, value, note, color, icon }) {
  const theme = useTheme();

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        borderRadius: 3,
        border: "1px solid",
        borderColor: alpha(color, 0.18),
        background: getRaisedGradient(theme, color),
        height: "100%",
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Avatar
          sx={{
            bgcolor: alpha(color, 0.14),
            color,
            width: 42,
            height: 42,
          }}
        >
          {icon}
        </Avatar>
        <Chip
          label={note}
          size="small"
          sx={{
            bgcolor: alpha(color, 0.1),
            color,
            fontWeight: 700,
          }}
        />
      </Stack>
      <Typography color="text.secondary" sx={{ mt: 1.5 }}>
        {label}
      </Typography>
      <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.4, color }}>
        {value}
      </Typography>
    </Paper>
  );
}

export default function SuggestionMaster() {
  const theme = useTheme();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [doshaFilter, setDoshaFilter] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("active");

  const filteredRows = useMemo(() => {
    const term = search.trim().toLowerCase();

    return suggestionRows.filter((item) => {
      const matchesSearch =
        !term ||
        [item.title, item.description, item.suggestion_type, item.dosha_type]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(term));
      const matchesType = !typeFilter || item.suggestion_type === typeFilter;
      const matchesDosha = !doshaFilter || item.dosha_type === doshaFilter;
      const matchesDifficulty =
        !difficultyFilter || item.difficulty === difficultyFilter;
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" ? item.is_active : !item.is_active);

      return (
        matchesSearch &&
        matchesType &&
        matchesDosha &&
        matchesDifficulty &&
        matchesStatus
      );
    });
  }, [difficultyFilter, doshaFilter, search, statusFilter, typeFilter]);

  const metrics = useMemo(() => {
    const activeCount = suggestionRows.filter((item) => item.is_active).length;
    const advancedCount = suggestionRows.filter(
      (item) => item.difficulty === "advanced",
    ).length;
    const avgDuration = Math.round(
      suggestionRows.reduce((total, item) => total + item.duration_mins, 0) /
        suggestionRows.length,
    );

    return [
      {
        label: "Suggestions",
        value: suggestionRows.length,
        note: "Content library",
        color: "#1d4ed8",
        icon: <TipsAndUpdatesRoundedIcon fontSize="small" />,
      },
      {
        label: "Active",
        value: activeCount,
        note: "Live to users",
        color: "#15803d",
        icon: <SpaRoundedIcon fontSize="small" />,
      },
      {
        label: "Advanced",
        value: advancedCount,
        note: "High guidance needed",
        color: "#c2410c",
        icon: <PsychologyAltRoundedIcon fontSize="small" />,
      },
      {
        label: "Avg Duration",
        value: `${avgDuration}m`,
        note: "Per practice",
        color: "#7c3aed",
        icon: <AutoAwesomeRoundedIcon fontSize="small" />,
      },
    ];
  }, []);

  const columns = useMemo(
    () => [
      {
        field: "suggestion_type",
        headerName: "Type",
        minWidth: 130,
        renderCell: ({ value }) => (
          <Chip
            size="small"
            label={value}
            sx={{
              textTransform: "capitalize",
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              color: "primary.main",
              fontWeight: 700,
            }}
          />
        ),
      },
      {
        field: "title",
        headerName: "Title",
        flex: 1.2,
        minWidth: 240,
      },
      {
        field: "description",
        headerName: "Description",
        flex: 1.6,
        minWidth: 320,
      },
      {
        field: "dosha_type",
        headerName: "Dosha",
        minWidth: 120,
        renderCell: ({ value }) => (
          <Chip
            size="small"
            label={value}
            variant="outlined"
            sx={{ textTransform: "capitalize", fontWeight: 700 }}
          />
        ),
      },
      {
        field: "difficulty",
        headerName: "Difficulty",
        minWidth: 130,
        renderCell: ({ value }) => (
          <Chip
            size="small"
            label={value}
            color={
              value === "easy"
                ? "success"
                : value === "moderate"
                  ? "warning"
                  : "error"
            }
            variant="outlined"
            sx={{ textTransform: "capitalize", fontWeight: 700 }}
          />
        ),
      },
      {
        field: "duration_mins",
        headerName: "Duration",
        minWidth: 120,
        valueGetter: (_, row) => `${row.duration_mins} mins`,
      },
      {
        field: "url",
        headerName: "URL",
        flex: 1,
        minWidth: 260,
        renderCell: ({ value }) => (
          <Stack direction="row" spacing={0.8} alignItems="center">
            <LinkRoundedIcon sx={{ fontSize: 16, color: "text.secondary" }} />
            <Typography variant="body2" noWrap>
              {value}
            </Typography>
          </Stack>
        ),
      },
      {
        field: "is_active",
        headerName: "Status",
        minWidth: 120,
        renderCell: ({ value }) => (
          <Chip
            size="small"
            label={value ? "Active" : "Inactive"}
            color={value ? "success" : "default"}
            variant={value ? "filled" : "outlined"}
          />
        ),
      },
      {
        field: "created_at",
        headerName: "Created At",
        flex: 1,
        minWidth: 190,
        valueFormatter: (value) =>
          value ? new Date(value).toLocaleString() : "-",
      },
    ],
    [theme.palette.primary.main],
  );

  return (
    <Layout role="superadmin" title="Suggestion Master">
      <Stack spacing={2.5}>
        <SectionCard
          sx={{
            overflow: "hidden",
            position: "relative",
            background: `linear-gradient(135deg, ${alpha("#166534", theme.palette.mode === "dark" ? 0.24 : 0.12)} 0%, ${getSurfaceBackground(theme, theme.palette.mode === "dark" ? 0.98 : 0.94)} 52%, ${alpha("#65a30d", theme.palette.mode === "dark" ? 0.18 : 0.1)} 100%)`,
          }}
        >
          <Box
            sx={{
              position: "absolute",
              right: -40,
              top: -40,
              width: 220,
              height: 220,
              borderRadius: "50%",
              background: `radial-gradient(circle, ${alpha("#166534", theme.palette.mode === "dark" ? 0.18 : 0.1)}, transparent 70%)`,
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
                sx={{ color: "#166534", fontWeight: 800, letterSpacing: 1 }}
              >
                Layer 6  Suggestion Engine
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, mt: 0.6 }}>
                Suggestion Master
              </Typography>
              <Typography color="text.secondary" sx={{ mt: 1 }}>
                The central super admin library for Ayurvedic wellness
                recommendations. Each row represents one suggestion that can be
                targeted by type, dosha, difficulty, and activation state.
              </Typography>
            </Box>

            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
              <Button variant="contained">Add Suggestion</Button>
              <Button variant="outlined" startIcon={<RefreshRoundedIcon />}>
                Refresh
              </Button>
            </Stack>
          </Stack>
        </SectionCard>

        <Grid container spacing={2}>
          {metrics.map((item) => (
            <Grid key={item.label} size={{ xs: 12, sm: 6, xl: 3 }}>
              <MetricCard {...item} />
            </Grid>
          ))}
        </Grid>

        <Grid container spacing={2.5}>
          <Grid size={{ xs: 12, xl: 8 }}>
            <SectionCard>
              <Stack
                direction={{ xs: "column", lg: "row" }}
                justifyContent="space-between"
                spacing={2}
                sx={{ mb: 2.5 }}
              >
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Suggestion Library
                  </Typography>
                  <Typography color="text.secondary" variant="body2">
                    Search and review the mock content set for the new super admin
                    master screen.
                  </Typography>
                </Box>
                <Chip
                  label={`${filteredRows.length} visible rows`}
                  color="primary"
                  variant="outlined"
                />
              </Stack>

              <Box
                sx={{
                  display: "grid",
                  gap: 1.5,
                  mb: 2,
                  gridTemplateColumns: {
                    xs: "1fr",
                    sm: "repeat(2, minmax(0, 1fr))",
                    lg: "repeat(5, minmax(0, 1fr))",
                  },
                }}
              >
                <TextField
                  label="Search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  fullWidth
                />
                <TextField
                  label="Type"
                  select
                  value={typeFilter}
                  onChange={(event) => setTypeFilter(event.target.value)}
                  fullWidth
                >
                  <MenuItem value="">All Types</MenuItem>
                  <MenuItem value="aahar">aahar</MenuItem>
                  <MenuItem value="vihar">vihar</MenuItem>
                  <MenuItem value="aushadh">aushadh</MenuItem>
                </TextField>
                <TextField
                  label="Dosha"
                  select
                  value={doshaFilter}
                  onChange={(event) => setDoshaFilter(event.target.value)}
                  fullWidth
                >
                  <MenuItem value="">All Dosha</MenuItem>
                  <MenuItem value="vata">vata</MenuItem>
                  <MenuItem value="pitta">pitta</MenuItem>
                  <MenuItem value="kapha">kapha</MenuItem>
                  <MenuItem value="all">all</MenuItem>
                </TextField>
                <TextField
                  label="Difficulty"
                  select
                  value={difficultyFilter}
                  onChange={(event) => setDifficultyFilter(event.target.value)}
                  fullWidth
                >
                  <MenuItem value="">All Levels</MenuItem>
                  <MenuItem value="easy">easy</MenuItem>
                  <MenuItem value="moderate">moderate</MenuItem>
                  <MenuItem value="advanced">advanced</MenuItem>
                </TextField>
                <TextField
                  label="Status"
                  select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                  fullWidth
                >
                  <MenuItem value="all">all</MenuItem>
                  <MenuItem value="active">active</MenuItem>
                  <MenuItem value="inactive">inactive</MenuItem>
                </TextField>
              </Box>

              <Box sx={{ width: "100%", overflowX: "auto" }}>
                <Box sx={{ height: 560, width: "max-content", minWidth: "100%" }}>
                  <DataGrid
                    rows={filteredRows}
                    columns={columns}
                    disableRowSelectionOnClick
                    pageSizeOptions={[10, 25, 50]}
                    initialState={{
                      pagination: {
                        paginationModel: { pageSize: 10, page: 0 },
                      },
                    }}
                  />
                </Box>
              </Box>
            </SectionCard>
          </Grid>

          <Grid size={{ xs: 12, xl: 4 }}>
            <Stack spacing={2.5}>
              <SectionCard>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5 }}>
                  Table Schema
                </Typography>
                <Stack spacing={1}>
                  {schemaRows.map(([column, type, note]) => (
                    <Paper
                      key={column}
                      variant="outlined"
                      sx={{ p: 1.5, borderRadius: 2.5 }}
                    >
                      <Typography sx={{ fontWeight: 700 }}>{column}</Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.4 }}>
                        {type}
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 0.8 }}>
                        {note}
                      </Typography>
                    </Paper>
                  ))}
                </Stack>
              </SectionCard>

              <SectionCard>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5 }}>
                  Content Rules
                </Typography>
                <Stack spacing={1.25}>
                  <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2.5 }}>
                    <Typography sx={{ fontWeight: 700 }}>Title Quality</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.6 }}>
                      Keep titles action-oriented and human. They should read like a
                      recommendation, not a database key.
                    </Typography>
                  </Paper>
                  <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2.5 }}>
                    <Typography sx={{ fontWeight: 700 }}>Personalisation</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.6 }}>
                      Dosha, difficulty, and duration should help downstream matching
                      logic deliver the right suggestion to the right user.
                    </Typography>
                  </Paper>
                  <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2.5 }}>
                    <Typography sx={{ fontWeight: 700 }}>Activation</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.6 }}>
                      Use `is_active` to soft-control visibility without deleting
                      historical content entries.
                    </Typography>
                  </Paper>
                </Stack>
              </SectionCard>
            </Stack>
          </Grid>
        </Grid>
      </Stack>
    </Layout>
  );
}
