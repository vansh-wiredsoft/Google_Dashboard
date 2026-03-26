import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Grid,
  IconButton,
  MenuItem,
  Paper,
  Stack,
  Switch,
  TextField,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { DataGrid } from "@mui/x-data-grid";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import LinkRoundedIcon from "@mui/icons-material/LinkRounded";
import PreviewRoundedIcon from "@mui/icons-material/PreviewRounded";
import PsychologyAltRoundedIcon from "@mui/icons-material/PsychologyAltRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import SpaRoundedIcon from "@mui/icons-material/SpaRounded";
import TipsAndUpdatesRoundedIcon from "@mui/icons-material/TipsAndUpdatesRounded";
import Layout from "../../layouts/commonLayout/Layout";
import {
  clearAdminSuggestionCreateState,
  clearAdminSuggestionDeleteState,
  clearAdminSuggestionDetailState,
  clearAdminSuggestionListState,
  clearAdminSuggestionUpdateState,
  createAdminSuggestion,
  deleteAdminSuggestion,
  fetchAdminSuggestionById,
  fetchAdminSuggestions,
  updateAdminSuggestion,
} from "../../store/adminSuggestionSlice";
import { getRaisedGradient, getSurfaceBackground } from "../../theme";

const suggestionTypeOptions = ["aahar", "vihar", "aushadh"];
const doshaOptions = ["all", "vata", "pitta", "kapha"];
const difficultyOptions = ["easy", "moderate", "advanced"];

const defaultFormValues = {
  suggestion_type: "aahar",
  title: "",
  description: "",
  url: "",
  dosha_type: "all",
  difficulty: "easy",
  duration_mins: "",
  is_active: true,
};

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

const normalizeFormValues = (item) => ({
  suggestion_type: item?.suggestion_type || "aahar",
  title: item?.title || "",
  description: item?.description || "",
  url: item?.url || "",
  dosha_type: item?.dosha_type || "all",
  difficulty: item?.difficulty || "easy",
  duration_mins:
    item?.duration_mins === null || item?.duration_mins === undefined
      ? ""
      : String(item.duration_mins),
  is_active: item?.is_active ?? true,
});

const buildPayload = (values) => ({
  suggestion_type: values.suggestion_type,
  title: values.title.trim(),
  description: values.description.trim(),
  url: values.url.trim(),
  dosha_type: values.dosha_type,
  difficulty: values.difficulty,
  duration_mins: Number(values.duration_mins || 0),
  is_active: Boolean(values.is_active),
});

const validateForm = (values) => {
  if (!values.title.trim()) return "Title is required.";
  if (!values.description.trim()) return "Description is required.";
  if (!values.suggestion_type) return "Suggestion type is required.";
  if (!values.dosha_type) return "Dosha type is required.";
  if (!values.difficulty) return "Difficulty is required.";
  if (values.duration_mins === "") return "Duration is required.";

  const duration = Number(values.duration_mins);
  if (!Number.isFinite(duration) || duration < 0) {
    return "Duration must be 0 or more.";
  }

  return "";
};

function DetailRow({ label, value }) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
        {label}
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: 600, whiteSpace: "pre-wrap" }}>
        {value || "-"}
      </Typography>
    </Box>
  );
}

export default function SuggestionMaster() {
  const theme = useTheme();
  const dispatch = useDispatch();
  const {
    items,
    total,
    listLoading,
    detailLoading,
    createLoading,
    updateLoading,
    deleteLoading,
    listError,
    detailError,
    createError,
    updateError,
    deleteError,
    createMessage,
    updateMessage,
    deleteMessage,
    selectedSuggestion,
  } = useSelector((state) => state.adminSuggestion);

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [doshaFilter, setDoshaFilter] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dialogMode, setDialogMode] = useState("create");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeSuggestionId, setActiveSuggestionId] = useState("");
  const [formValues, setFormValues] = useState(defaultFormValues);
  const [formError, setFormError] = useState("");

  const isSubmitting = createLoading || updateLoading;
  const isReadOnly = dialogMode === "view";

  const fetchList = () => {
    const params = {
      skip: 0,
      limit: 50,
    };

    if (search.trim()) {
      params.search = search.trim();
    }

    if (typeFilter) {
      params.suggestion_type = typeFilter;
    }

    if (statusFilter !== "all") {
      params.is_active = statusFilter === "active";
    }

    dispatch(fetchAdminSuggestions(params));
  };

  useEffect(() => {
    fetchList();
  }, []);

  useEffect(() => {
    return () => {
      dispatch(clearAdminSuggestionListState());
      dispatch(clearAdminSuggestionCreateState());
      dispatch(clearAdminSuggestionUpdateState());
      dispatch(clearAdminSuggestionDeleteState());
      dispatch(clearAdminSuggestionDetailState());
    };
  }, [dispatch]);

  useEffect(() => {
    if ((dialogMode === "edit" || dialogMode === "view") && selectedSuggestion) {
      setFormValues(normalizeFormValues(selectedSuggestion));
    }
  }, [dialogMode, selectedSuggestion]);

  const filteredRows = useMemo(() => {
    const term = search.trim().toLowerCase();

    return items.filter((item) => {
      const matchesSearch =
        !term ||
        [item.title, item.description, item.suggestion_type, item.dosha_type, item.url]
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
  }, [difficultyFilter, doshaFilter, items, search, statusFilter, typeFilter]);

  const metrics = useMemo(() => {
    const activeCount = items.filter((item) => item.is_active).length;
    const inactiveCount = items.length - activeCount;
    const avgDuration =
      items.length > 0
        ? Math.round(
            items.reduce(
              (sum, item) => sum + Number(item.duration_mins || 0),
              0,
            ) / items.length,
          )
        : 0;

    return { activeCount, inactiveCount, avgDuration };
  }, [items]);

  const openCreateDialog = () => {
    setDialogMode("create");
    setActiveSuggestionId("");
    setFormValues(defaultFormValues);
    setFormError("");
    setDialogOpen(true);
    dispatch(clearAdminSuggestionCreateState());
    dispatch(clearAdminSuggestionUpdateState());
    dispatch(clearAdminSuggestionDetailState());
  };

  const openSuggestionDialog = async (mode, suggestionId) => {
    setDialogMode(mode);
    setActiveSuggestionId(suggestionId);
    setFormValues(defaultFormValues);
    setFormError("");
    setDialogOpen(true);
    dispatch(clearAdminSuggestionDetailState());
    dispatch(clearAdminSuggestionCreateState());
    dispatch(clearAdminSuggestionUpdateState());

    try {
      await dispatch(fetchAdminSuggestionById(suggestionId)).unwrap();
    } catch {
      // Error state is shown from redux.
    }
  };

  const closeDialog = () => {
    if (isSubmitting) return;
    setDialogOpen(false);
    setActiveSuggestionId("");
    setFormError("");
    dispatch(clearAdminSuggestionDetailState());
  };

  const handleFormChange = (field, value) => {
    setFormValues((current) => ({
      ...current,
      [field]: value,
    }));
    setFormError("");
  };

  const handleSubmit = async () => {
    const errorMessage = validateForm(formValues);
    if (errorMessage) {
      setFormError(errorMessage);
      return;
    }

    const payload = buildPayload(formValues);

    try {
      if (dialogMode === "edit" && activeSuggestionId) {
        await dispatch(
          updateAdminSuggestion({
            suggestionId: activeSuggestionId,
            suggestion: payload,
          }),
        ).unwrap();
      } else {
        await dispatch(createAdminSuggestion(payload)).unwrap();
      }
      setDialogOpen(false);
      setActiveSuggestionId("");
      setFormError("");
    } catch {
      // Error state is shown from redux.
    }
  };

  const handleDelete = async (suggestionId, title) => {
    if (!window.confirm(`Delete suggestion "${title}"?`)) return;

    try {
      await dispatch(deleteAdminSuggestion(suggestionId)).unwrap();
    } catch {
      // Error state is shown from redux.
    }
  };

  const resetFilters = () => {
    setSearch("");
    setTypeFilter("");
    setDoshaFilter("");
    setDifficultyFilter("");
    setStatusFilter("all");
    dispatch(
      fetchAdminSuggestions({
        skip: 0,
        limit: 50,
      }),
    );
  };

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
        flex: 1.1,
        minWidth: 220,
      },
      {
        field: "description",
        headerName: "Description",
        flex: 1.4,
        minWidth: 280,
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
        valueGetter: (_, row) => `${Number(row.duration_mins || 0)} mins`,
      },
      {
        field: "url",
        headerName: "URL",
        flex: 1,
        minWidth: 220,
        renderCell: ({ value }) => (
          <Stack direction="row" spacing={0.8} alignItems="center" sx={{ minWidth: 0 }}>
            <LinkRoundedIcon sx={{ fontSize: 16, color: "text.secondary" }} />
            <Typography variant="body2" noWrap>
              {value || "-"}
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
      {
        field: "actions",
        headerName: "Actions",
        sortable: false,
        filterable: false,
        minWidth: 160,
        renderCell: ({ row }) => (
          <Stack direction="row" spacing={0.5}>
            <Tooltip title="View">
              <IconButton size="small" onClick={() => openSuggestionDialog("view", row.id)}>
                <PreviewRoundedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Edit">
              <IconButton size="small" onClick={() => openSuggestionDialog("edit", row.id)}>
                <EditRoundedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete">
              <span>
                <IconButton
                  size="small"
                  color="error"
                  disabled={deleteLoading}
                  onClick={() => handleDelete(row.id, row.title)}
                >
                  <DeleteOutlineRoundedIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
          </Stack>
        ),
      },
    ],
    [deleteLoading, theme.palette.primary.main],
  );

  const dialogTitle =
    dialogMode === "create"
      ? "Add Suggestion"
      : dialogMode === "edit"
        ? "Edit Suggestion"
        : "Suggestion Details";

  return (
    <Layout role="superadmin" title="Suggestion Master">
      <Stack spacing={2.5}>
        {(listError || detailError || createError || updateError || deleteError) && (
          <Stack spacing={1.25}>
            {listError && <Alert severity="error">{listError}</Alert>}
            {detailError && <Alert severity="error">{detailError}</Alert>}
            {createError && <Alert severity="error">{createError}</Alert>}
            {updateError && <Alert severity="error">{updateError}</Alert>}
            {deleteError && <Alert severity="error">{deleteError}</Alert>}
          </Stack>
        )}
        {(createMessage || updateMessage || deleteMessage) && (
          <Stack spacing={1.25}>
            {createMessage && <Alert severity="success">{createMessage}</Alert>}
            {updateMessage && <Alert severity="success">{updateMessage}</Alert>}
            {deleteMessage && <Alert severity="success">{deleteMessage}</Alert>}
          </Stack>
        )}

        <Grid container spacing={2.5}>
          <Grid size={{ xs: 12, md: 4 }}>
            <MetricCard
              label="Total Suggestions"
              value={total || items.length}
              note="Catalog"
              color={theme.palette.primary.main}
              icon={<TipsAndUpdatesRoundedIcon />}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <MetricCard
              label="Active Entries"
              value={metrics.activeCount}
              note="Live"
              color={theme.palette.success.main}
              icon={<AutoAwesomeRoundedIcon />}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <MetricCard
              label="Avg Duration"
              value={`${metrics.avgDuration} mins`}
              note={`${metrics.inactiveCount} inactive`}
              color={theme.palette.warning.main}
              icon={<PsychologyAltRoundedIcon />}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
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
                    Live suggestion records from the admin APIs with create, view,
                    update, and delete controls.
                  </Typography>
                </Box>
                <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                  <Button
                    variant="contained"
                    startIcon={<AddRoundedIcon />}
                    onClick={openCreateDialog}
                  >
                    Add Suggestion
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<RefreshRoundedIcon />}
                    onClick={fetchList}
                    disabled={listLoading}
                  >
                    Refresh
                  </Button>
                </Stack>
              </Stack>

              <Box
                sx={{
                  display: "grid",
                  gap: 1.5,
                  mb: 2,
                  gridTemplateColumns: {
                    xs: "1fr",
                    sm: "repeat(2, minmax(0, 1fr))",
                    lg: "repeat(3, minmax(0, 1fr))",
                    xl: "1.4fr 1fr 1fr 1fr 1fr auto auto",
                  },
                  alignItems: { xl: "end" },
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
                  {suggestionTypeOptions.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  label="Dosha"
                  select
                  value={doshaFilter}
                  onChange={(event) => setDoshaFilter(event.target.value)}
                  fullWidth
                >
                  <MenuItem value="">All Dosha</MenuItem>
                  {doshaOptions.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  label="Difficulty"
                  select
                  value={difficultyFilter}
                  onChange={(event) => setDifficultyFilter(event.target.value)}
                  fullWidth
                >
                  <MenuItem value="">All Levels</MenuItem>
                  {difficultyOptions.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  label="Status"
                  select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                  fullWidth
                >
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                </TextField>
                <Button
                  variant="outlined"
                  onClick={fetchList}
                  disabled={listLoading}
                  sx={{ minHeight: 56, px: 3, whiteSpace: "nowrap" }}
                >
                  Apply Filters
                </Button>
                <Button
                  variant="text"
                  onClick={resetFilters}
                  sx={{ minHeight: 56, px: 2, whiteSpace: "nowrap" }}
                >
                  Reset
                </Button>
              </Box>

              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Showing {filteredRows.length} suggestions
              </Typography>

              <Box sx={{ width: "100%", overflowX: "auto" }}>
                <Box sx={{ height: 560, width: "max-content", minWidth: "100%" }}>
                  <DataGrid
                    rows={filteredRows}
                    columns={columns}
                    loading={listLoading}
                    disableRowSelectionOnClick
                    pageSizeOptions={[10, 25, 50]}
                    initialState={{
                      pagination: {
                        paginationModel: { pageSize: 10, page: 0 },
                      },
                      sorting: {
                        sortModel: [{ field: "created_at", sort: "desc" }],
                      },
                    }}
                  />
                </Box>
              </Box>
            </SectionCard>
          </Grid>
        </Grid>
      </Stack>

      <Dialog
        open={dialogOpen}
        onClose={closeDialog}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>{dialogTitle}</DialogTitle>
        <DialogContent dividers>
          {(detailLoading && isReadOnly) || (detailLoading && dialogMode === "edit") ? (
            <Stack alignItems="center" justifyContent="center" sx={{ py: 6 }}>
              <CircularProgress size={28} />
            </Stack>
          ) : isReadOnly ? (
            <Stack spacing={2} sx={{ pt: 1 }}>
              <DetailRow label="Suggestion Type" value={selectedSuggestion?.suggestion_type} />
              <DetailRow label="Title" value={selectedSuggestion?.title} />
              <DetailRow label="Description" value={selectedSuggestion?.description} />
              <DetailRow label="URL" value={selectedSuggestion?.url} />
              <DetailRow label="Dosha Type" value={selectedSuggestion?.dosha_type} />
              <DetailRow label="Difficulty" value={selectedSuggestion?.difficulty} />
              <DetailRow
                label="Duration"
                value={
                  selectedSuggestion?.duration_mins !== undefined
                    ? `${selectedSuggestion?.duration_mins} mins`
                    : "-"
                }
              />
              <DetailRow
                label="Status"
                value={selectedSuggestion?.is_active ? "Active" : "Inactive"}
              />
              <DetailRow
                label="Created At"
                value={
                  selectedSuggestion?.created_at
                    ? new Date(selectedSuggestion.created_at).toLocaleString()
                    : "-"
                }
              />
              <DetailRow
                label="Updated At"
                value={
                  selectedSuggestion?.updated_at
                    ? new Date(selectedSuggestion.updated_at).toLocaleString()
                    : "-"
                }
              />
            </Stack>
          ) : (
            <Stack spacing={2} sx={{ pt: 1 }}>
              {formError && <Alert severity="error">{formError}</Alert>}
              <Box
                sx={{
                  display: "grid",
                  gap: 2,
                  gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" },
                }}
              >
                <TextField
                  label="Suggestion Type"
                  select
                  value={formValues.suggestion_type}
                  onChange={(event) =>
                    handleFormChange("suggestion_type", event.target.value)
                  }
                  fullWidth
                >
                  {suggestionTypeOptions.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  label="Title"
                  value={formValues.title}
                  onChange={(event) => handleFormChange("title", event.target.value)}
                  fullWidth
                />
                <TextField
                  label="Dosha Type"
                  select
                  value={formValues.dosha_type}
                  onChange={(event) => handleFormChange("dosha_type", event.target.value)}
                  fullWidth
                >
                  {doshaOptions.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  label="Difficulty"
                  select
                  value={formValues.difficulty}
                  onChange={(event) => handleFormChange("difficulty", event.target.value)}
                  fullWidth
                >
                  {difficultyOptions.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  label="Duration (mins)"
                  type="number"
                  value={formValues.duration_mins}
                  onChange={(event) => handleFormChange("duration_mins", event.target.value)}
                  fullWidth
                  inputProps={{ min: 0 }}
                />
                <TextField
                  label="URL"
                  value={formValues.url}
                  onChange={(event) => handleFormChange("url", event.target.value)}
                  fullWidth
                />
              </Box>
              <TextField
                label="Description"
                value={formValues.description}
                onChange={(event) => handleFormChange("description", event.target.value)}
                fullWidth
                multiline
                minRows={4}
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={formValues.is_active}
                    onChange={(event) =>
                      handleFormChange("is_active", event.target.checked)
                    }
                  />
                }
                label="Active"
              />
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog} disabled={isSubmitting}>
            {isReadOnly ? "Close" : "Cancel"}
          </Button>
          {!isReadOnly && (
            <Button onClick={handleSubmit} variant="contained" disabled={isSubmitting || detailLoading}>
              {isSubmitting
                ? dialogMode === "edit"
                  ? "Saving..."
                  : "Creating..."
                : dialogMode === "edit"
                  ? "Save Changes"
                  : "Create Suggestion"}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Layout>
  );
}
