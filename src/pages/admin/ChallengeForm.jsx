import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Alert,
  Box,
  Button,
  Chip,
  FormControlLabel,
  IconButton,
  MenuItem,
  Paper,
  Stack,
  Switch,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import Layout from "../../layouts/commonLayout/Layout";
import { fetchKpiById, fetchKpis } from "../../store/kpiSlice";
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
import { getSurfaceBackground } from "../../theme";

const CHALLENGE_ICON_OPTIONS = [
  { value: "🏆", label: "Trophy" },
  { value: "🎯", label: "Target" },
  { value: "🔥", label: "Streak" },
  { value: "⚡", label: "Energy" },
  { value: "🌟", label: "Star" },
  { value: "💪", label: "Strength" },
  { value: "🚀", label: "Boost" },
  { value: "🥇", label: "Winner" },
  { value: "🎉", label: "Celebrate" },
  { value: "🧠", label: "Focus" },
  { value: "💧", label: "Hydration" },
  { value: "🌿", label: "Wellness" },
];

const defaultMapping = () => ({
  localId: `${Date.now()}-${Math.random()}`,
  kpiKey: "",
  startDate: "",
  endDate: "",
});

export default function ChallengeForm({ mode }) {
  const theme = useTheme();
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
    challengeType: "",
    description: "",
    targetValue: 0,
    xpReward: 0,
    icon: "",
    isDaily: true,
    isActive: true,
  });
  const [mappings, setMappings] = useState([defaultMapping()]);
  const [newMapping, setNewMapping] = useState({
    kpiKey: "",
    startDate: "",
    endDate: "",
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
        challengeType: selectedChallenge.challenge_type || "",
        description: selectedChallenge.description || "",
        targetValue: selectedChallenge.target_value || 0,
        xpReward: selectedChallenge.xp_reward || 0,
        icon: selectedChallenge.icon || "",
        isDaily: Boolean(selectedChallenge.is_daily),
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

  const getKpiDatesFromList = (kpiKey) => {
    const selectedKpi = kpiItems.find((item) => item.kpi_key === kpiKey);

    return {
      startDate: selectedKpi?.start_date || "",
      endDate: selectedKpi?.end_date || "",
    };
  };

  const hydrateMappingDates = async (kpiKey) => {
    const listDates = getKpiDatesFromList(kpiKey);
    if (listDates.startDate && listDates.endDate) {
      return listDates;
    }

    try {
      const kpiDetail = await dispatch(fetchKpiById(kpiKey)).unwrap();

      return {
        startDate: kpiDetail?.start_date || "",
        endDate: kpiDetail?.end_date || "",
      };
    } catch {
      return {
        startDate: "",
        endDate: "",
      };
    }
  };

  const validateDateRange = (startDate, endDate) =>
    Boolean(startDate) && Boolean(endDate) && startDate <= endDate;

  const handleSave = async () => {
    if (!form.name.trim() || !form.challengeType.trim() || !form.description.trim()) {
      setFormError("Challenge name, type, and description are required.");
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
            challengeType: form.challengeType.trim(),
            description: form.description.trim(),
            targetValue: Number(form.targetValue) || 0,
            xpReward: Number(form.xpReward) || 0,
            icon: form.icon.trim(),
            isDaily: form.isDaily,
            isActive: form.isActive,
            kpiMappings: (selectedChallenge?.kpi_mappings || []).map((mapping) => ({
              kpi_key: mapping.kpi_key,
              start_date: mapping.start_date,
              end_date: mapping.end_date,
            })),
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
          challengeType: form.challengeType.trim(),
          description: form.description.trim(),
          targetValue: Number(form.targetValue) || 0,
          xpReward: Number(form.xpReward) || 0,
          icon: form.icon.trim(),
          isDaily: form.isDaily,
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

  const handleMappingKpiChange = async (localId, kpiKey) => {
    setFormError("");

    setMappings((current) =>
      current.map((item) =>
        item.localId === localId
          ? { ...item, kpiKey, startDate: "", endDate: "" }
          : item,
      ),
    );

    const kpiDates = await hydrateMappingDates(kpiKey);

    setMappings((current) =>
      current.map((item) =>
        item.localId === localId
          ? {
              ...item,
              kpiKey,
              startDate: kpiDates.startDate,
              endDate: kpiDates.endDate,
            }
          : item,
      ),
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
        startDate: "",
        endDate: "",
      });
    } catch {
      // Error is already handled in redux state.
    }
  };

  const handleExistingMappingKpiChange = async (kpiKey) => {
    setMappingFormError("");
    setNewMapping({
      kpiKey,
      startDate: "",
      endDate: "",
    });

    const kpiDates = await hydrateMappingDates(kpiKey);

    setNewMapping({
      kpiKey,
      startDate: kpiDates.startDate,
      endDate: kpiDates.endDate,
    });
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
            bgcolor: getSurfaceBackground(theme),
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
              label="Challenge Type"
              value={form.challengeType}
              onChange={(event) => {
                setFormError("");
                setForm((current) => ({
                  ...current,
                  challengeType: event.target.value,
                }));
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
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                label="Target Value"
                type="number"
                value={form.targetValue}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    targetValue: event.target.value,
                  }))
                }
                fullWidth
              />
              <TextField
                label="XP Reward"
                type="number"
                value={form.xpReward}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    xpReward: event.target.value,
                  }))
                }
                fullWidth
              />
            </Stack>
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                borderRadius: 2.5,
                bgcolor: "background.default",
              }}
            >
              <Stack spacing={2}>
                <Box>
                  <Typography sx={{ fontWeight: 700 }}>Challenge Icon</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    Pick an icon that will look good on the user dashboard, or enter a custom
                    emoji/icon below.
                  </Typography>
                </Box>

                <Stack
                  direction={{ xs: "column", md: "row" }}
                  spacing={2}
                  alignItems={{ xs: "stretch", md: "center" }}
                >
                  <Paper
                    variant="outlined"
                    sx={{
                      width: { xs: "100%", md: 160 },
                      minHeight: 132,
                      px: 2,
                      py: 2.5,
                      borderRadius: 3,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 1,
                      bgcolor: "background.paper",
                    }}
                  >
                    <Typography sx={{ fontSize: 36, lineHeight: 1 }}>
                      {form.icon || "✨"}
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      Live Preview
                    </Typography>
                    <Chip
                      size="small"
                      label={form.icon ? "Selected" : "Default Preview"}
                      color={form.icon ? "primary" : "default"}
                      variant={form.icon ? "filled" : "outlined"}
                    />
                  </Paper>

                  <Box sx={{ flex: 1 }}>
                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: {
                          xs: "repeat(4, minmax(0, 1fr))",
                          sm: "repeat(6, minmax(0, 1fr))",
                        },
                        gap: 1,
                      }}
                    >
                      {CHALLENGE_ICON_OPTIONS.map((iconOption) => {
                        const selected = form.icon === iconOption.value;

                        return (
                          <Button
                            key={iconOption.value}
                            variant={selected ? "contained" : "outlined"}
                            color={selected ? "primary" : "inherit"}
                            onClick={() =>
                              setForm((current) => ({
                                ...current,
                                icon: iconOption.value,
                              }))
                            }
                            sx={{
                              minWidth: 0,
                              minHeight: 72,
                              borderRadius: 2.5,
                              display: "flex",
                              flexDirection: "column",
                              gap: 0.5,
                              px: 1,
                            }}
                          >
                            <Box component="span" sx={{ fontSize: 24, lineHeight: 1 }}>
                              {iconOption.value}
                            </Box>
                            <Box
                              component="span"
                              sx={{
                                fontSize: 11,
                                lineHeight: 1.2,
                                textTransform: "none",
                                textAlign: "center",
                              }}
                            >
                              {iconOption.label}
                            </Box>
                          </Button>
                        );
                      })}
                    </Box>
                  </Box>
                </Stack>

                <TextField
                  label="Custom Icon / Emoji"
                  value={form.icon}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, icon: event.target.value }))
                  }
                  helperText="You can paste any emoji or short icon text that should appear on the user dashboard."
                  fullWidth
                />
              </Stack>
            </Paper>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <FormControlLabel
                control={
                  <Switch
                    checked={form.isDaily}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        isDaily: event.target.checked,
                      }))
                    }
                  />
                }
                label="Daily Challenge"
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
                          handleMappingKpiChange(mapping.localId, event.target.value)
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
                        value={mapping.startDate}
                        disabled
                        InputLabelProps={{ shrink: true }}
                        fullWidth
                      />
                      <TextField
                        label="End Date"
                        value={mapping.endDate}
                        disabled
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
              bgcolor: getSurfaceBackground(theme),
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
                onChange={(event) => handleExistingMappingKpiChange(event.target.value)}
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
                value={newMapping.startDate}
                disabled
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
              <TextField
                label="End Date"
                value={newMapping.endDate}
                disabled
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
                      KPI Key: {mapping.kpi_key || "-"}
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
