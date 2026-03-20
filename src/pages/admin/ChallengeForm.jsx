import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Alert,
  Box,
  Button,
  FormControlLabel,
  IconButton,
  MenuItem,
  Paper,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import Layout from "../../layouts/commonLayout/Layout";
import { fetchKpis } from "../../store/kpiSlice";
import {
  addChallengeKpiMapping,
  clearChallengeCreateState,
  clearChallengeDetailState,
  clearChallengeMappingState,
  clearChallengeUpdateState,
  createChallenge,
  fetchChallengeById,
  updateChallenge,
} from "../../store/challengeSlice";

const today = new Date().toISOString().slice(0, 10);

const defaultMapping = () => ({
  localId: `${Date.now()}-${Math.random()}`,
  kpiKey: "",
  startDate: today,
  endDate: today,
});

export default function ChallengeForm({ mode }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const { items: kpiItems } = useSelector((state) => state.kpi);
  const {
    selectedChallenge,
    createLoading,
    createError,
    detailLoading,
    detailError,
    updateLoading,
    updateError,
    mappingLoading,
    mappingError,
    mappingMessage,
  } = useSelector((state) => state.challenge);
  const [form, setForm] = useState({
    name: "",
    description: "",
    isActive: true,
  });
  const [mappings, setMappings] = useState([defaultMapping()]);
  const [newMapping, setNewMapping] = useState({
    kpiKey: "",
    startDate: today,
    endDate: today,
  });
  const [formError, setFormError] = useState("");
  const [mappingFormError, setMappingFormError] = useState("");

  useEffect(() => {
    dispatch(fetchKpis({ isActive: true }));
    if (mode === "edit" && id) {
      dispatch(fetchChallengeById(id));
    }
  }, [dispatch, id, mode]);

  useEffect(() => {
    if (mode === "edit" && selectedChallenge) {
      setForm({
        name: selectedChallenge.name || "",
        description: selectedChallenge.description || "",
        isActive: Boolean(selectedChallenge.is_active),
      });
    }
  }, [mode, selectedChallenge]);

  useEffect(() => {
    return () => {
      dispatch(clearChallengeCreateState());
      dispatch(clearChallengeUpdateState());
      dispatch(clearChallengeDetailState());
      dispatch(clearChallengeMappingState());
    };
  }, [dispatch]);

  const pageTitle = useMemo(
    () => (mode === "edit" ? "Edit Challenge" : "Add Challenge"),
    [mode],
  );

  const validateDateRange = (startDate, endDate) =>
    Boolean(startDate) && Boolean(endDate) && startDate <= endDate;

  const handleSave = async () => {
    if (!form.name.trim() || !form.description.trim()) {
      setFormError("Challenge name and description are required.");
      return;
    }

    if (mode === "add") {
      if (!mappings.length) {
        setFormError("Add at least one KPI mapping.");
        return;
      }

      const hasInvalidMapping = mappings.some(
        (mapping) =>
          !mapping.kpiKey ||
          !validateDateRange(mapping.startDate, mapping.endDate),
      );

      if (hasInvalidMapping) {
        setFormError(
          "Each KPI mapping needs a KPI, start date, and an end date on or after the start date.",
        );
        return;
      }
    }

    setFormError("");

    try {
      if (mode === "edit") {
        await dispatch(
          updateChallenge({
            challengeKey: id,
            name: form.name.trim(),
            description: form.description.trim(),
            isActive: form.isActive,
          }),
        ).unwrap();
        navigate("/admin/challenges", {
          replace: true,
          state: {
            feedback: {
              severity: "success",
              message: "Challenge updated successfully.",
            },
          },
        });
        return;
      }

      await dispatch(
        createChallenge({
          name: form.name.trim(),
          description: form.description.trim(),
          kpiMappings: mappings.map((mapping) => ({
            kpi_key: mapping.kpiKey,
            start_date: mapping.startDate,
            end_date: mapping.endDate,
          })),
        }),
      ).unwrap();
      navigate("/admin/challenges", {
        replace: true,
        state: {
          feedback: {
            severity: "success",
            message: "Challenge added successfully.",
          },
        },
      });
    } catch {
      // Error is already handled in redux state.
    }
  };

  const handleAddMappingRow = () => {
    setMappings((current) => [...current, defaultMapping()]);
  };

  const handleRemoveMappingRow = (localId) => {
    setMappings((current) =>
      current.length === 1 ? current : current.filter((item) => item.localId !== localId),
    );
  };

  const handleExistingMappingAdd = async () => {
    if (
      !newMapping.kpiKey ||
      !validateDateRange(newMapping.startDate, newMapping.endDate)
    ) {
      setMappingFormError(
        "Select a KPI and provide a valid start and end date before adding the mapping.",
      );
      return;
    }

    setMappingFormError("");

    try {
      await dispatch(
        addChallengeKpiMapping({
          challengeKey: id,
          kpiKey: newMapping.kpiKey,
          startDate: newMapping.startDate,
          endDate: newMapping.endDate,
        }),
      ).unwrap();

      setNewMapping({
        kpiKey: "",
        startDate: today,
        endDate: today,
      });
    } catch {
      // Error is already handled in redux state.
    }
  };

  if (mode === "edit" && detailLoading) {
    return (
      <Layout role="admin" title={pageTitle}>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2, sm: 3 },
            borderRadius: 3,
            border: "1px solid",
            borderColor: "divider",
            bgcolor: "rgba(255,255,255,0.86)",
          }}
        >
          <Typography>Loading challenge...</Typography>
        </Paper>
      </Layout>
    );
  }

  return (
    <Layout role="admin" title={pageTitle}>
      <Stack spacing={2.5}>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2, sm: 3 },
            borderRadius: 3,
            border: "1px solid",
            borderColor: "divider",
            bgcolor: "rgba(255,255,255,0.86)",
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
                {pageTitle}
              </Typography>
              <Typography color="text.secondary" sx={{ mt: 0.75 }}>
                {mode === "edit"
                  ? "Update the challenge details below."
                  : "Create a challenge and assign one or more KPI mappings."}
              </Typography>
            </Box>
            <Button
              startIcon={<ArrowBackRoundedIcon />}
              onClick={() => navigate("/admin/challenges")}
            >
              Back to list
            </Button>
          </Stack>

          {(formError || createError || updateError || detailError) && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {formError || createError || updateError || detailError}
            </Alert>
          )}

          <Stack spacing={2}>
            <TextField
              label="Challenge Name"
              value={form.name}
              onChange={(event) => {
                setFormError("");
                setForm((current) => ({ ...current, name: event.target.value }));
              }}
              fullWidth
            />
            <TextField
              label="Description"
              value={form.description}
              onChange={(event) => {
                setFormError("");
                setForm((current) => ({
                  ...current,
                  description: event.target.value,
                }));
              }}
              multiline
              minRows={4}
              fullWidth
            />

            {mode === "edit" && (
              <FormControlLabel
                control={
                  <Switch
                    checked={form.isActive}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        isActive: event.target.checked,
                      }))
                    }
                  />
                }
                label="Active"
              />
            )}
          </Stack>

          {mode === "add" && (
            <Stack spacing={2} sx={{ mt: 3 }}>
              <Stack direction="row" justifyContent="space-between" spacing={2}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    KPI Mappings
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    Each mapping links one KPI to this challenge for a specific date range.
                  </Typography>
                </Box>
                <Button startIcon={<AddRoundedIcon />} onClick={handleAddMappingRow}>
                  Add Mapping
                </Button>
              </Stack>

              {mappings.map((mapping, index) => (
                <Paper key={mapping.localId} variant="outlined" sx={{ p: 2, borderRadius: 2.5 }}>
                  <Stack spacing={2}>
                    <Stack
                      direction={{ xs: "column", sm: "row" }}
                      justifyContent="space-between"
                      alignItems={{ xs: "flex-start", sm: "center" }}
                      spacing={1}
                    >
                      <Typography sx={{ fontWeight: 600 }}>
                        Mapping {index + 1}
                      </Typography>
                      <IconButton
                        color="error"
                        onClick={() => handleRemoveMappingRow(mapping.localId)}
                        disabled={mappings.length === 1}
                      >
                        <DeleteOutlineRoundedIcon />
                      </IconButton>
                    </Stack>

                    <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                      <TextField
                        label="KPI"
                        select
                        value={mapping.kpiKey}
                        onChange={(event) =>
                          setMappings((current) =>
                            current.map((item) =>
                              item.localId === mapping.localId
                                ? { ...item, kpiKey: event.target.value }
                                : item,
                            ),
                          )
                        }
                        fullWidth
                      >
                        <MenuItem value="">Select KPI</MenuItem>
                        {kpiItems.map((kpi) => (
                          <MenuItem key={kpi.kpi_key} value={kpi.kpi_key}>
                            {kpi.display_name}
                          </MenuItem>
                        ))}
                      </TextField>
                      <TextField
                        label="Start Date"
                        type="date"
                        value={mapping.startDate}
                        onChange={(event) =>
                          setMappings((current) =>
                            current.map((item) =>
                              item.localId === mapping.localId
                                ? { ...item, startDate: event.target.value }
                                : item,
                            ),
                          )
                        }
                        InputLabelProps={{ shrink: true }}
                        fullWidth
                      />
                      <TextField
                        label="End Date"
                        type="date"
                        value={mapping.endDate}
                        onChange={(event) =>
                          setMappings((current) =>
                            current.map((item) =>
                              item.localId === mapping.localId
                                ? { ...item, endDate: event.target.value }
                                : item,
                            ),
                          )
                        }
                        InputLabelProps={{ shrink: true }}
                        fullWidth
                      />
                    </Stack>
                  </Stack>
                </Paper>
              ))}
            </Stack>
          )}

          <Stack direction="row" spacing={1.25} sx={{ mt: 3 }}>
            <Button
              variant="contained"
              startIcon={<SaveRoundedIcon />}
              onClick={handleSave}
              disabled={createLoading || updateLoading}
            >
              {createLoading || updateLoading ? "Saving..." : "Save"}
            </Button>
            <Button variant="outlined" onClick={() => navigate("/admin/challenges")}>
              Cancel
            </Button>
          </Stack>
        </Paper>

        {mode === "edit" && (
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2, sm: 3 },
              borderRadius: 3,
              border: "1px solid",
              borderColor: "divider",
              bgcolor: "rgba(255,255,255,0.86)",
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Add KPI Mapping
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 0.75, mb: 2 }}>
              Use the dedicated API to append a new KPI mapping to this challenge.
            </Typography>

            {(mappingFormError || mappingError) && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {mappingFormError || mappingError}
              </Alert>
            )}
            {mappingMessage && (
              <Alert severity="success" sx={{ mb: 2 }}>
                {mappingMessage}
              </Alert>
            )}

            <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
              <TextField
                label="KPI"
                select
                value={newMapping.kpiKey}
                onChange={(event) => {
                  setMappingFormError("");
                  setNewMapping((current) => ({
                    ...current,
                    kpiKey: event.target.value,
                  }));
                }}
                fullWidth
              >
                <MenuItem value="">Select KPI</MenuItem>
                {kpiItems.map((kpi) => (
                  <MenuItem key={kpi.kpi_key} value={kpi.kpi_key}>
                    {kpi.display_name}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label="Start Date"
                type="date"
                value={newMapping.startDate}
                onChange={(event) => {
                  setMappingFormError("");
                  setNewMapping((current) => ({
                    ...current,
                    startDate: event.target.value,
                  }));
                }}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
              <TextField
                label="End Date"
                type="date"
                value={newMapping.endDate}
                onChange={(event) => {
                  setMappingFormError("");
                  setNewMapping((current) => ({
                    ...current,
                    endDate: event.target.value,
                  }));
                }}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
            </Stack>

            <Button
              variant="outlined"
              startIcon={<AddRoundedIcon />}
              onClick={handleExistingMappingAdd}
              disabled={mappingLoading}
              sx={{ mt: 2 }}
            >
              {mappingLoading ? "Adding..." : "Add Mapping"}
            </Button>

            {!!selectedChallenge?.kpi_mappings?.length && (
              <Stack spacing={1.5} sx={{ mt: 3 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  Existing Mappings
                </Typography>
                {selectedChallenge.kpi_mappings.map((mapping, index) => (
                  <Paper key={mapping.id || index} variant="outlined" sx={{ p: 2, borderRadius: 2.5 }}>
                    <Typography sx={{ fontWeight: 600 }}>
                      {(kpiItems.find((kpi) => kpi.kpi_key === mapping.kpi_key)?.display_name ||
                        mapping.kpi_key ||
                        "Unknown KPI")}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      {mapping.start_date || "-"} to {mapping.end_date || "-"}
                    </Typography>
                  </Paper>
                ))}
              </Stack>
            )}
          </Paper>
        )}
      </Stack>
    </Layout>
  );
}
