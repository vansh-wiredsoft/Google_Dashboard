import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Chip,
  Paper,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import Layout from "../../layouts/commonLayout/Layout";
import {
  clearKpiSuggestionMappingDetailState,
  fetchKpiSuggestionMappingById,
} from "../../store/kpiSuggestionMappingSlice";
import { getSurfaceBackground } from "../../theme";

export default function KpiSuggestionMappingView() {
  const theme = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const { selectedMapping, detailLoading, detailError } = useSelector(
    (state) => state.kpiSuggestionMapping,
  );

  useEffect(() => {
    if (id) {
      dispatch(fetchKpiSuggestionMappingById(id));
    }

    return () => {
      dispatch(clearKpiSuggestionMappingDetailState());
    };
  }, [dispatch, id]);

  if (detailLoading) {
    return (
      <Layout role="superadmin" title="View KPI Suggestion Mapping">
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
          <Typography>Loading mapping...</Typography>
        </Paper>
      </Layout>
    );
  }

  return (
    <Layout role="superadmin" title="View KPI Suggestion Mapping">
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
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          spacing={2}
          sx={{ mb: 3 }}
        >
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 750 }}>
              KPI Suggestion Mapping Details
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 0.75 }}>
              Review the full mapping rule before making changes.
            </Typography>
          </Box>
          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
            <Button
              startIcon={<ArrowBackRoundedIcon />}
              onClick={() => navigate("/super-admin/kpi-suggestion-mapping")}
            >
              Back to list
            </Button>
            <Button
              variant="contained"
              startIcon={<EditRoundedIcon />}
              onClick={() => navigate(`/super-admin/kpi-suggestion-mapping/${id}/edit`)}
            >
              Edit
            </Button>
          </Stack>
        </Stack>

        {detailError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {detailError}
          </Alert>
        )}

        {selectedMapping && !detailError && (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" },
              gap: 2,
            }}
          >
            {[
              ["KPI Key", selectedMapping.kpi_key],
              ["Trigger Mode", selectedMapping.trigger_mode],
              ["Risk Level", selectedMapping.risk_level || "-"],
              ["Question Key", selectedMapping.question_key || "-"],
              [
                "Score Threshold Below",
                selectedMapping.score_threshold_below ?? "-",
              ],
              [
                "Score Threshold Above",
                selectedMapping.score_threshold_above ?? "-",
              ],
              ["KPI Score Below", selectedMapping.kpi_score_below ?? "-"],
              ["Suggestion ID", selectedMapping.suggestion_id],
              ["Priority", selectedMapping.priority],
              [
                "Created At",
                selectedMapping.created_at
                  ? new Date(selectedMapping.created_at).toLocaleString()
                  : "-",
              ],
              [
                "Updated At",
                selectedMapping.updated_at
                  ? new Date(selectedMapping.updated_at).toLocaleString()
                  : "-",
              ],
            ].map(([label, value]) => (
              <Paper key={label} variant="outlined" sx={{ p: 2, borderRadius: 2.5 }}>
                <Typography variant="caption" color="text.secondary">
                  {label}
                </Typography>
                <Typography sx={{ mt: 0.8, fontWeight: 600, wordBreak: "break-word" }}>
                  {value || "-"}
                </Typography>
              </Paper>
            ))}
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2.5 }}>
              <Typography variant="caption" color="text.secondary">
                Status
              </Typography>
              <Box sx={{ mt: 1 }}>
                <Chip
                  size="small"
                  label={selectedMapping.is_active ? "Active" : "Inactive"}
                  color={selectedMapping.is_active ? "success" : "default"}
                  variant={selectedMapping.is_active ? "filled" : "outlined"}
                />
              </Box>
            </Paper>
          </Box>
        )}
      </Paper>
    </Layout>
  );
}
