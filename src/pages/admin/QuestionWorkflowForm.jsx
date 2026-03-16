import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  IconButton,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
  Switch,
} from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import {
  clearQuestionHierarchyError,
  fetchQuestionHierarchy,
} from "../../store/questionHierarchySlice";
import {
  clearThemeCreateState,
  createTheme,
} from "../../store/themeSlice";
import {
  clearKpiCreateState,
  createKpi,
} from "../../store/kpiSlice";
import { entityConfigs } from "../../data/adminEntityConfigs";
import { loadEntityRows, saveEntityRows } from "../../utils/entityStorage";

const createEmptyOption = (index) => ({
  option_number: index + 1,
  option_text: "",
  score: index + 1,
});

function buildInitialForm(record, themes) {
  const themeOptions = themes.map((theme) => ({
    key: theme.theme_key,
    label: theme.theme_display_name,
    description: theme.description || "",
  }));

  const selectedThemeKeys = Array.isArray(record?.theme_keys)
    ? record.theme_keys
    : themeOptions
        .filter((theme) =>
          String(record?.Theme || "")
            .split(",")
            .map((item) => item.trim())
            .includes(theme.label),
        )
        .map((theme) => theme.key);

  const kpiOptions = themes
    .filter((theme) => selectedThemeKeys.includes(theme.theme_key))
    .flatMap((theme) =>
      (theme.kpis || []).map((kpi) => ({
        key: kpi.kpi_key,
        label: kpi.display_name,
        themeKey: theme.theme_key,
        description: kpi.description || "",
      })),
    );

  const selectedKpiKeys = Array.isArray(record?.kpi_keys)
    ? record.kpi_keys
    : kpiOptions
        .filter((kpi) =>
          String(record?.KPI || "")
            .split(",")
            .map((item) => item.trim())
            .includes(kpi.label),
        )
        .map((kpi) => kpi.key);

  const options = Array.isArray(record?.options) && record.options.length
    ? record.options.map((option, index) => ({
        option_number: option.option_number ?? index + 1,
        option_text: option.option_text ?? "",
        score: option.score ?? index + 1,
      }))
    : [1, 2, 3, 4, 5]
        .map((number) => ({
          option_number: number,
          option_text: record?.[String(number)] || "",
          score: number,
        }))
        .filter((option) => option.option_text || option.option_number <= 2);

  return {
    selectedThemeKeys,
    selectedKpiKeys,
    questionCode: record?.Question_Code || "",
    questionText: record?.Question || "",
    reverseCoded:
      typeof record?.reverse_coded === "boolean"
        ? record.reverse_coded
        : String(record?.Reverse_Coded || "").toLowerCase() === "yes",
    options:
      options.length > 0
        ? options
        : [createEmptyOption(0), createEmptyOption(1)],
  };
}

export default function QuestionWorkflowForm({ mode }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const { items: apiHierarchy, loading, error } = useSelector(
    (state) => state.questionHierarchy,
  );
  const {
    createLoading: createThemeLoading,
    createError: createThemeError,
  } = useSelector((state) => state.theme);
  const {
    createLoading: createKpiLoading,
    createError: createKpiError,
  } = useSelector((state) => state.kpi);
  const config = entityConfigs.question;
  const records = useMemo(
    () => loadEntityRows(config.storageKey, config.initialRows),
    [config.initialRows, config.storageKey],
  );
  const record = mode === "edit" ? records.find((item) => item.id === id) : null;
  const [form, setForm] = useState(() => buildInitialForm(record, apiHierarchy));
  const [errors, setErrors] = useState({});
  const [themeDialogOpen, setThemeDialogOpen] = useState(false);
  const [kpiDialogOpen, setKpiDialogOpen] = useState(false);
  const [newTheme, setNewTheme] = useState({ name: "", description: "" });
  const [newKpi, setNewKpi] = useState({
    themeKey: "",
    name: "",
    description: "",
  });

  useEffect(() => {
    dispatch(fetchQuestionHierarchy());
    return () => {
      dispatch(clearQuestionHierarchyError());
      dispatch(clearThemeCreateState());
      dispatch(clearKpiCreateState());
    };
  }, [dispatch]);

  useEffect(() => {
    if (mode === "edit" && record) {
      setForm(buildInitialForm(record, apiHierarchy));
    }
  }, [apiHierarchy, mode, record]);

  const themeOptions = useMemo(
    () =>
      apiHierarchy.map((theme) => ({
        key: theme.theme_key,
        label: theme.theme_display_name,
        description: theme.description || "",
      })),
    [apiHierarchy],
  );

  const selectedThemes = themeOptions.filter((theme) =>
    form.selectedThemeKeys.includes(theme.key),
  );

  const kpiOptions = useMemo(
    () =>
      apiHierarchy
        .filter((theme) => form.selectedThemeKeys.includes(theme.theme_key))
        .flatMap((theme) =>
          (theme.kpis || []).map((kpi) => ({
            key: kpi.kpi_key,
            label: kpi.display_name,
            themeKey: theme.theme_key,
            themeLabel: theme.theme_display_name,
            description: kpi.description || "",
          })),
        ),
    [form.selectedThemeKeys, apiHierarchy],
  );

  const selectedKpis = kpiOptions.filter((kpi) =>
    form.selectedKpiKeys.includes(kpi.key),
  );

  const validate = () => {
    const nextErrors = {};

    if (!form.selectedThemeKeys.length) {
      nextErrors.themes = "Select at least one theme.";
    }
    if (!form.selectedKpiKeys.length) {
      nextErrors.kpis = "Select at least one KPI.";
    }
    if (!form.questionCode.trim()) {
      nextErrors.questionCode = "Question Code is required.";
    }
    if (!form.questionText.trim()) {
      nextErrors.questionText = "Question text is required.";
    }

    const validOptions = form.options.filter((option) => option.option_text.trim());
    if (validOptions.length < 2) {
      nextErrors.options = "Add at least two options.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;

    const validOptions = form.options
      .filter((option) => option.option_text.trim())
      .map((option, index) => ({
        option_number: index + 1,
        option_text: option.option_text.trim(),
        score: Number(option.score) || index + 1,
      }));

    const nextRecord = {
      id: mode === "edit" && record ? record.id : String(Date.now()),
      Theme: selectedThemes.map((theme) => theme.label).join(", "),
      KPI: selectedKpis.map((kpi) => kpi.label).join(", "),
      Question_Code: form.questionCode.trim(),
      Question: form.questionText.trim(),
      Reverse_Coded: form.reverseCoded ? "Yes" : "No",
      reverse_coded: form.reverseCoded,
      theme_keys: form.selectedThemeKeys,
      kpi_keys: form.selectedKpiKeys,
      options: validOptions,
      "1": validOptions[0]?.option_text || "",
      "2": validOptions[1]?.option_text || "",
      "3": validOptions[2]?.option_text || "",
      "4": validOptions[3]?.option_text || "",
      "5": validOptions[4]?.option_text || "",
    };

    const nextRows =
      mode === "edit" && record
        ? records.map((item) => (item.id === record.id ? nextRecord : item))
        : [nextRecord, ...records];

    saveEntityRows(config.storageKey, nextRows);
    navigate(config.basePath, {
      replace: true,
      state: {
        feedback: {
          severity: "success",
          message: `Question ${mode === "edit" ? "updated" : "added"} successfully.`,
        },
      },
    });
  };

  const handleAddTheme = () => {
    if (!newTheme.name.trim()) return;

    dispatch(
      createTheme({
        themeDisplayName: newTheme.name.trim(),
      }),
    )
      .unwrap()
      .then((payload) => {
        dispatch(fetchQuestionHierarchy());
        setForm((current) => ({
          ...current,
          selectedThemeKeys: current.selectedThemeKeys.includes(
            payload.item.theme_key,
          )
            ? current.selectedThemeKeys
            : [...current.selectedThemeKeys, payload.item.theme_key],
        }));
        setNewTheme({ name: "", description: "" });
        setThemeDialogOpen(false);
      })
      .catch(() => {
        // Error is already handled in redux state.
      });
  };

  const handleAddKpi = () => {
    if (!newKpi.themeKey || !newKpi.name.trim()) return;
    const today = new Date().toISOString().slice(0, 10);

    dispatch(
      createKpi({
        displayName: newKpi.name.trim(),
        themeKey: newKpi.themeKey,
        startDate: today,
        endDate: today,
      }),
    )
      .unwrap()
      .then((payload) => {
        dispatch(fetchQuestionHierarchy());
        setForm((current) => ({
          ...current,
          selectedThemeKeys: current.selectedThemeKeys.includes(newKpi.themeKey)
            ? current.selectedThemeKeys
            : [...current.selectedThemeKeys, newKpi.themeKey],
          selectedKpiKeys: current.selectedKpiKeys.includes(payload.item.kpi_key)
            ? current.selectedKpiKeys
            : [...current.selectedKpiKeys, payload.item.kpi_key],
        }));
        setNewKpi({ themeKey: "", name: "", description: "" });
        setKpiDialogOpen(false);
      })
      .catch(() => {
        // Error is already handled in redux state.
      });
  };

  if (mode === "edit" && !record) {
    return (
      <Paper elevation={0} sx={{ p: { xs: 2, sm: 3 }, borderRadius: 3, border: "1px solid", borderColor: "divider", bgcolor: "rgba(255,255,255,0.86)" }}>
        <Alert severity="warning" sx={{ mb: 2 }}>
          This question record could not be found.
        </Alert>
        <Button startIcon={<ArrowBackRoundedIcon />} onClick={() => navigate(config.basePath)}>
          Back to Question Bank
        </Button>
      </Paper>
    );
  }

  return (
    <>
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
              {mode === "edit" ? "Edit Question" : "Add Question"}
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 0.75, maxWidth: 760 }}>
              Select themes and KPIs from hierarchy, build question options dynamically, and optionally create new themes or KPIs from the popup actions.
            </Typography>
          </Box>
          <Button startIcon={<ArrowBackRoundedIcon />} onClick={() => navigate(config.basePath)}>
            Back to list
          </Button>
        </Stack>

        {error && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {createThemeError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {createThemeError}
          </Alert>
        )}
        {createKpiError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {createKpiError}
          </Alert>
        )}

        <Stack direction={{ xs: "column", md: "row" }} spacing={1.25} sx={{ mb: 2.5 }}>
          <Button variant="outlined" startIcon={<AddRoundedIcon />} onClick={() => setThemeDialogOpen(true)}>
            Add Theme
          </Button>
          <Button variant="outlined" startIcon={<AddRoundedIcon />} onClick={() => setKpiDialogOpen(true)}>
            Add KPI
          </Button>
        </Stack>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", lg: "repeat(2, minmax(0, 1fr))" },
            gap: 2,
          }}
        >
          <Autocomplete
            multiple
            options={themeOptions}
            loading={loading}
            value={selectedThemes}
            onChange={(_, value) =>
              setForm((current) => ({
                ...current,
                selectedThemeKeys: value.map((item) => item.key),
                selectedKpiKeys: current.selectedKpiKeys.filter((key) =>
                  apiHierarchy
                    .filter((theme) => value.some((item) => item.key === theme.theme_key))
                    .flatMap((theme) => (theme.kpis || []).map((kpi) => kpi.kpi_key))
                    .includes(key),
                ),
              }))
            }
            getOptionLabel={(option) => option.label}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Themes"
                error={Boolean(errors.themes)}
                helperText={errors.themes || "You can select multiple themes"}
              />
            )}
          />

          <Autocomplete
            multiple
            options={kpiOptions}
            loading={loading}
            value={selectedKpis}
            onChange={(_, value) =>
              setForm((current) => ({
                ...current,
                selectedKpiKeys: value.map((item) => item.key),
              }))
            }
            getOptionLabel={(option) => `${option.label} (${option.themeLabel})`}
            isOptionEqualToValue={(option, value) => option.key === value.key}
            renderInput={(params) => (
              <TextField
                {...params}
                label="KPIs"
                error={Boolean(errors.kpis)}
                helperText={errors.kpis || "KPI list changes based on selected themes"}
              />
            )}
          />

          <TextField
            label="Question Code"
            value={form.questionCode}
            onChange={(event) =>
              setForm((current) => ({ ...current, questionCode: event.target.value }))
            }
            error={Boolean(errors.questionCode)}
            helperText={errors.questionCode || ""}
            fullWidth
          />

          <FormControlLabel
            control={
              <Switch
                checked={form.reverseCoded}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    reverseCoded: event.target.checked,
                  }))
                }
              />
            }
            label="Reverse coded"
            sx={{ px: 1, py: 1 }}
          />

          <TextField
            label="Question"
            value={form.questionText}
            onChange={(event) =>
              setForm((current) => ({ ...current, questionText: event.target.value }))
            }
            error={Boolean(errors.questionText)}
            helperText={errors.questionText || ""}
            multiline
            minRows={4}
            fullWidth
            sx={{ gridColumn: "1 / -1" }}
          />
        </Box>

        <Divider sx={{ my: 3 }} />

        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          spacing={1}
          sx={{ mb: 2 }}
        >
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Question Options
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Add as many response options as needed. Scores can be adjusted individually.
            </Typography>
          </Box>
          <Button
            variant="outlined"
            startIcon={<AddRoundedIcon />}
            onClick={() =>
              setForm((current) => ({
                ...current,
                options: [...current.options, createEmptyOption(current.options.length)],
              }))
            }
          >
            Add Option
          </Button>
        </Stack>

        {errors.options && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errors.options}
          </Alert>
        )}

        <Stack spacing={1.5}>
          {form.options.map((option, index) => (
            <Paper key={`${option.option_number}-${index}`} variant="outlined" sx={{ p: 2, borderRadius: 2.5 }}>
              <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} alignItems={{ md: "center" }}>
                <Chip label={`Option ${index + 1}`} color="primary" variant="outlined" />
                <TextField
                  label="Option Text"
                  value={option.option_text}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      options: current.options.map((item, itemIndex) =>
                        itemIndex === index
                          ? { ...item, option_text: event.target.value }
                          : item,
                      ),
                    }))
                  }
                  fullWidth
                />
                <TextField
                  label="Score"
                  type="number"
                  value={option.score}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      options: current.options.map((item, itemIndex) =>
                        itemIndex === index
                          ? { ...item, score: event.target.value }
                          : item,
                      ),
                    }))
                  }
                  sx={{ width: { xs: "100%", md: 110 } }}
                />
                <IconButton
                  color="error"
                  onClick={() =>
                    setForm((current) => ({
                      ...current,
                      options:
                        current.options.length > 2
                          ? current.options
                              .filter((_, itemIndex) => itemIndex !== index)
                              .map((item, itemIndex) => ({
                                ...item,
                                option_number: itemIndex + 1,
                              }))
                          : current.options,
                    }))
                  }
                  disabled={form.options.length <= 2}
                >
                  <DeleteOutlineRoundedIcon />
                </IconButton>
              </Stack>
            </Paper>
          ))}
        </Stack>

        <Stack direction="row" spacing={1.25} sx={{ mt: 3 }}>
          <Button variant="contained" startIcon={<SaveRoundedIcon />} onClick={handleSave}>
            {mode === "edit" ? "Update Question" : "Add Question"}
          </Button>
          <Button variant="outlined" onClick={() => navigate(config.basePath)}>
            Cancel
          </Button>
        </Stack>
      </Paper>

      <Dialog open={themeDialogOpen} onClose={() => setThemeDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Add Theme</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField
              label="Theme Name"
              value={newTheme.name}
              onChange={(event) =>
                setNewTheme((current) => ({ ...current, name: event.target.value }))
              }
              fullWidth
            />
            <TextField
              label="Description"
              value={newTheme.description}
              onChange={(event) =>
                setNewTheme((current) => ({
                  ...current,
                  description: event.target.value,
                }))
              }
              multiline
              minRows={3}
              fullWidth
              helperText="Theme API currently uses only the theme name."
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setThemeDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleAddTheme}
            disabled={createThemeLoading}
          >
            {createThemeLoading ? "Saving..." : "Save Theme"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={kpiDialogOpen} onClose={() => setKpiDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Add KPI</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField
              label="Theme"
              value={newKpi.themeKey}
              onChange={(event) =>
                setNewKpi((current) => ({ ...current, themeKey: event.target.value }))
              }
              select
              fullWidth
            >
              <MenuItem value="">Select Theme</MenuItem>
              {themeOptions.map((theme) => (
                <MenuItem key={theme.key} value={theme.key}>
                  {theme.label}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="KPI Name"
              value={newKpi.name}
              onChange={(event) =>
                setNewKpi((current) => ({ ...current, name: event.target.value }))
              }
              fullWidth
            />
            <TextField
              label="Description"
              value={newKpi.description}
              onChange={(event) =>
                setNewKpi((current) => ({
                  ...current,
                  description: event.target.value,
                }))
              }
              multiline
              minRows={3}
              fullWidth
              helperText="KPI API currently uses theme, KPI name, and default start/end date as today."
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setKpiDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleAddKpi}
            disabled={createKpiLoading}
          >
            {createKpiLoading ? "Saving..." : "Save KPI"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
