import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Alert,
  Box,
  Button,
  Chip,
  IconButton,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import PreviewRoundedIcon from "@mui/icons-material/PreviewRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import Layout from "../../layouts/commonLayout/Layout";
import {
  clearChallengeDeleteState,
  clearChallengeListError,
  deleteChallenge,
  fetchChallenges,
} from "../../store/challengeSlice";
import { fetchKpis } from "../../store/kpiSlice";
import { getSurfaceBackground } from "../../theme";

export default function Challenges() {
  const theme = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const feedback = location.state?.feedback;
  const { items: kpiItems } = useSelector((state) => state.kpi);
  const {
    items,
    total,
    listLoading,
    listError,
    deleteLoading,
    deleteError,
    deleteMessage,
  } = useSelector((state) => state.challenge);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("active");
  const [filters, setFilters] = useState({
    kpiKey: "",
    startDate: "",
    endDate: "",
  });

  const isActive =
    statusFilter === "all" ? undefined : statusFilter === "active";

  const challengeQuery = useMemo(
    () => ({
      isActive,
      kpiKey: filters.kpiKey,
      startDate: filters.startDate,
      endDate: filters.endDate,
    }),
    [filters.endDate, filters.kpiKey, filters.startDate, isActive],
  );

  useEffect(() => {
    dispatch(fetchKpis({ isActive: true }));
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchChallenges(challengeQuery));
  }, [challengeQuery, dispatch]);

  useEffect(() => {
    return () => {
      dispatch(clearChallengeListError());
      dispatch(clearChallengeDeleteState());
    };
  }, [dispatch]);

  const filteredItems = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) {
      return items;
    }

    return items.filter((item) =>
      [item.name, item.description]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(term)),
    );
  }, [items, search]);

  const handleRefresh = () => {
    dispatch(fetchChallenges(challengeQuery));
  };

  const handleDelete = async (challengeKey) => {
    try {
      await dispatch(deleteChallenge(challengeKey)).unwrap();
      dispatch(fetchChallenges(challengeQuery));
    } catch {
      // Error is already handled in redux state.
    }
  };

  const handleResetFilters = () => {
    setFilters({
      kpiKey: "",
      startDate: "",
      endDate: "",
    });
  };

  const columns = useMemo(
    () => [
      {
        field: "name",
        headerName: "Challenge Name",
        flex: 1.2,
        minWidth: 220,
      },
      {
        field: "description",
        headerName: "Description",
        flex: 1.6,
        minWidth: 260,
        valueGetter: (_, row) => row.description || "-",
      },
      {
        field: "challenge_type",
        headerName: "Type",
        minWidth: 150,
        valueGetter: (_, row) => row.challenge_type || "-",
      },
      {
        field: "target_value",
        headerName: "Target",
        minWidth: 110,
        valueGetter: (_, row) => row.target_value ?? "-",
      },
      {
        field: "xp_reward",
        headerName: "XP Reward",
        minWidth: 110,
        valueGetter: (_, row) => row.xp_reward ?? "-",
      },
      {
        field: "is_daily",
        headerName: "Daily",
        minWidth: 100,
        renderCell: ({ value }) => (
          <Chip
            size="small"
            label={value ? "Yes" : "No"}
            color={value ? "primary" : "default"}
            variant={value ? "filled" : "outlined"}
          />
        ),
      },
      {
        field: "is_active",
        headerName: "Status",
        minWidth: 130,
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
        field: "updated_at",
        headerName: "Updated At",
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
        minWidth: 170,
        renderCell: ({ row }) => (
          <Stack direction="row" spacing={0.5}>
            <Tooltip title="View">
              <IconButton
                size="small"
                onClick={() =>
                  navigate(`/admin/challenges/${row.challenge_key}`)
                }
              >
                <PreviewRoundedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Edit">
              <IconButton
                size="small"
                onClick={() =>
                  navigate(`/admin/challenges/${row.challenge_key}/edit`)
                }
              >
                <EditRoundedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete">
              <span>
                <IconButton
                  size="small"
                  color="error"
                  disabled={deleteLoading}
                  onClick={() => handleDelete(row.challenge_key)}
                >
                  <DeleteOutlineRoundedIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
          </Stack>
        ),
      },
    ],
    [deleteLoading, navigate],
  );

  return (
    <Layout role="admin" title="Challenges">
      <Stack spacing={2}>
        {feedback && (
          <Alert severity={feedback.severity}>{feedback.message}</Alert>
        )}
        {listError && <Alert severity="error">{listError}</Alert>}
        {deleteError && <Alert severity="error">{deleteError}</Alert>}
        {deleteMessage && <Alert severity="success">{deleteMessage}</Alert>}

        <Paper
          elevation={0}
          sx={{
            p: { xs: 2, sm: 3 },
            borderRadius: 3,
            border: "1px solid",
            borderColor: "divider",
            bgcolor: getSurfaceBackground(theme),
          }}
        >
          <Stack
            direction={{ xs: "column", lg: "row" }}
            justifyContent="space-between"
            spacing={2}
            sx={{ mb: 2.5 }}
          >
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 750 }}>
                Challenge Master
              </Typography>
              <Typography
                color="text.secondary"
                sx={{ mt: 0.75, maxWidth: 720 }}
              >
                Create, review, update, and deactivate challenges with KPI
                mappings.
              </Typography>
            </Box>

            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
              <Button
                variant="contained"
                startIcon={<AddRoundedIcon />}
                onClick={() => navigate("/admin/challenges/add")}
              >
                Add Challenge
              </Button>
              <Button
                variant="outlined"
                startIcon={<RefreshRoundedIcon />}
                onClick={handleRefresh}
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
                lg: "1.15fr 1fr 1fr 1.6fr auto auto",
              },
              alignItems: { lg: "end" },
            }}
          >
            <TextField
              label="KPI"
              select
              value={filters.kpiKey}
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  kpiKey: event.target.value,
                }))
              }
              fullWidth
            >
              <MenuItem value="">All KPI</MenuItem>
              {kpiItems.map((kpi) => (
                <MenuItem key={kpi.kpi_key} value={kpi.kpi_key}>
                  {kpi.display_name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Start Date"
              type="date"
              value={filters.startDate}
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  startDate: event.target.value,
                }))
              }
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
            <TextField
              label="End Date"
              type="date"
              value={filters.endDate}
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  endDate: event.target.value,
                }))
              }
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
            <TextField
              label="Search Challenge"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              fullWidth
            />
            <Select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              fullWidth
              displayEmpty
            >
              <MenuItem value="all">All Status</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
            </Select>
            <Button
              variant="outlined"
              onClick={handleResetFilters}
              sx={{ minHeight: 56, px: 3, whiteSpace: "nowrap" }}
            >
              Reset Filters
            </Button>
          </Box>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Showing {filteredItems.length} of {total} challenges
          </Typography>

          <Box sx={{ width: "100%", overflowX: "auto" }}>
            <Box sx={{ height: 560, width: "max-content", minWidth: "100%" }}>
              <DataGrid
                rows={filteredItems}
                columns={columns}
                loading={listLoading}
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
        </Paper>
      </Stack>
    </Layout>
  );
}
