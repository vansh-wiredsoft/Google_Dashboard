import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  FormControl,
  FormControlLabel,
  Grid,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import Layout from "../../layouts/commonLayout/Layout";
import api from "../../services/api";
import {
  addQuestionsToSession,
  clearSessionError,
  clearSessionMessages,
  createSession,
  resetSessionFlow,
} from "../../store/sessionSlice";
import { fetchCompanies } from "../../store/companySlice";

const QUESTION_HIERARCHY_PATH = "/config/api/v1/kpiquestions/hierarchy";

const pickArray = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.results)) return payload.results;
  return [];
};

const normalizeQuestion = (item, index) => ({
  id: String(item?.id || item?.question_id || index),
  text: item?.question_text || item?.text || item?.name || "Untitled Question",
  code: item?.question_code || "",
});

export default function Sessions() {
  const dispatch = useDispatch();
  const {
    createdSession,
    addedQuestions,
    createLoading,
    addLoading,
    createMessage,
    addMessage,
    error: sessionError,
  } = useSelector((state) => state.session);
  const { companies, companiesLoading, error: companiesError } = useSelector(
    (state) => state.company,
  );

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [companyId, setCompanyId] = useState("");
  const [selectedThemeKey, setSelectedThemeKey] = useState("");
  const [selectedKpiKey, setSelectedKpiKey] = useState("");
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [questionHierarchy, setQuestionHierarchy] = useState([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [formError, setFormError] = useState("");

  const selectedCompanyName = useMemo(
    () => companies.find((company) => company.id === companyId)?.name || "",
    [companyId],
  );
  const selectedTheme = useMemo(
    () => questionHierarchy.find((theme) => theme.theme_key === selectedThemeKey) || null,
    [questionHierarchy, selectedThemeKey],
  );
  const kpiOptions = useMemo(
    () => (Array.isArray(selectedTheme?.kpis) ? selectedTheme.kpis : []),
    [selectedTheme],
  );
  const selectedKpi = useMemo(
    () => kpiOptions.find((kpi) => kpi.kpi_key === selectedKpiKey) || null,
    [kpiOptions, selectedKpiKey],
  );
  const questions = useMemo(() => {
    const raw = Array.isArray(selectedKpi?.questions) ? selectedKpi.questions : [];
    return raw.map(normalizeQuestion);
  }, [selectedKpi]);

  useEffect(() => {
    const loadQuestions = async () => {
      try {
        setLoadingQuestions(true);
        const response = await api.get(QUESTION_HIERARCHY_PATH);
        setQuestionHierarchy(pickArray(response?.data));
      } catch {
        setFormError("Failed to load questions.");
      } finally {
        setLoadingQuestions(false);
      }
    };

    loadQuestions();
  }, []);

  useEffect(() => {
    dispatch(fetchCompanies());
  }, [dispatch]);

  useEffect(() => {
    return () => {
      dispatch(resetSessionFlow());
    };
  }, [dispatch]);

  const clearLocalAndReduxErrors = () => {
    if (formError) setFormError("");
    if (sessionError) dispatch(clearSessionError());
  };

  const toggleQuestion = (questionId) => {
    setSelectedQuestions((current) =>
      current.includes(questionId)
        ? current.filter((id) => id !== questionId)
        : [...current, questionId],
    );
  };

  const handleCreateSession = async () => {
    clearLocalAndReduxErrors();
    dispatch(clearSessionMessages());

    if (!title.trim() || !description.trim() || !companyId) {
      setFormError("Title, description and company are required.");
      return;
    }

    try {
      await dispatch(
        createSession({
          title: title.trim(),
          description: description.trim(),
          companyId,
        }),
      ).unwrap();
    } catch {
      // Error is already captured in redux state.
    }
  };

  const handleAddQuestions = async () => {
    clearLocalAndReduxErrors();
    dispatch(clearSessionMessages());

    if (!createdSession?.id) {
      setFormError("Create the session first.");
      return;
    }
    if (!selectedQuestions.length) {
      setFormError("Select at least one question.");
      return;
    }

    try {
      await dispatch(
        addQuestionsToSession({
          sessionId: createdSession.id,
          questionIds: selectedQuestions,
        }),
      ).unwrap();
    } catch {
      // Error is already captured in redux state.
    }
  };

  const handleReset = () => {
    setTitle("");
    setDescription("");
    setCompanyId("");
    setSelectedThemeKey("");
    setSelectedKpiKey("");
    setSelectedQuestions([]);
    setFormError("");
    dispatch(resetSessionFlow());
  };

  return (
    <Layout role="admin" title="Create Session">
      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, md: 7 }}>
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
            <Typography variant="h5" sx={{ fontWeight: 750, mb: 0.7 }}>
              Session Details
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 2.5 }}>
              Create session first, then select questions and add them to the created
              session.
            </Typography>

            <Stack spacing={2}>
              {!!formError && <Alert severity="error">{formError}</Alert>}
              {!!sessionError && <Alert severity="error">{sessionError}</Alert>}
              {!!companiesError && <Alert severity="error">{companiesError}</Alert>}
              {!!createMessage && <Alert severity="success">{createMessage}</Alert>}
              {!!addMessage && <Alert severity="success">{addMessage}</Alert>}

              <TextField
                label="Session Title"
                value={title}
                onChange={(event) => {
                  clearLocalAndReduxErrors();
                  setTitle(event.target.value);
                }}
                fullWidth
                disabled={!!createdSession}
              />

              <TextField
                label="Description"
                value={description}
                onChange={(event) => {
                  clearLocalAndReduxErrors();
                  setDescription(event.target.value);
                }}
                fullWidth
                multiline
                minRows={3}
                disabled={!!createdSession}
              />

              <FormControl fullWidth>
                <Select
                  displayEmpty
                  value={companyId}
                  onChange={(event) => {
                    clearLocalAndReduxErrors();
                    setCompanyId(event.target.value);
                  }}
                  disabled={!!createdSession || companiesLoading}
                >
                  <MenuItem value="">Select Company</MenuItem>
                  {companies.map((company) => (
                    <MenuItem key={company.id} value={company.id}>
                      {company.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {!createdSession && (
                <Button variant="contained" onClick={handleCreateSession} disabled={createLoading}>
                  {createLoading ? "Creating Session..." : "Create Session"}
                </Button>
              )}

              {!!createdSession && (
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
                    Add Questions
                  </Typography>
                  {loadingQuestions ? (
                    <Stack direction="row" spacing={1} alignItems="center">
                      <CircularProgress size={16} />
                      <Typography variant="body2" color="text.secondary">
                        Loading question list...
                      </Typography>
                    </Stack>
                  ) : (
                    <Stack spacing={1.5}>
                      <FormControl fullWidth>
                        <Select
                          displayEmpty
                          value={selectedThemeKey}
                          onChange={(event) => {
                            setSelectedThemeKey(event.target.value);
                            setSelectedKpiKey("");
                            setSelectedQuestions([]);
                          }}
                        >
                          <MenuItem value="">Select Theme</MenuItem>
                          {questionHierarchy.map((theme) => (
                            <MenuItem key={theme.theme_key} value={theme.theme_key}>
                              {theme.theme_display_name || theme.theme_key}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>

                      <FormControl fullWidth disabled={!selectedThemeKey}>
                        <Select
                          displayEmpty
                          value={selectedKpiKey}
                          onChange={(event) => {
                            setSelectedKpiKey(event.target.value);
                            setSelectedQuestions([]);
                          }}
                        >
                          <MenuItem value="">Select KPI</MenuItem>
                          {kpiOptions.map((kpi) => (
                            <MenuItem key={kpi.kpi_key} value={kpi.kpi_key}>
                              {kpi.display_name || kpi.kpi_key}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>

                      {!!selectedKpiKey && (
                        <Stack
                          spacing={0.6}
                          sx={{ maxHeight: 240, overflowY: "auto", pr: 1 }}
                        >
                          {questions.map((question) => (
                            <FormControlLabel
                              key={question.id}
                              control={
                                <Checkbox
                                  checked={selectedQuestions.includes(question.id)}
                                  onChange={() => toggleQuestion(question.id)}
                                />
                              }
                              label={
                                question.code
                                  ? `${question.text} (${question.code})`
                                  : question.text
                              }
                            />
                          ))}
                          {!questions.length && (
                            <Typography variant="body2" color="text.secondary">
                              No questions found for selected KPI.
                            </Typography>
                          )}
                        </Stack>
                      )}
                    </Stack>
                  )}
                </Box>
              )}

              <Stack direction="row" spacing={1.2}>
                {!!createdSession && (
                  <Button
                    variant="contained"
                    onClick={handleAddQuestions}
                    disabled={addLoading || !selectedQuestions.length}
                  >
                    {addLoading ? "Adding Questions..." : "Add Questions"}
                  </Button>
                )}
                <Button variant="outlined" onClick={handleReset}>
                  {createdSession ? "Create New Session" : "Reset"}
                </Button>
              </Stack>
            </Stack>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 5 }}>
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
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
              Session Preview
            </Typography>

            <Stack spacing={1.5}>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Title
                </Typography>
                <Typography>{title || "-"}</Typography>
              </Box>

              <Box>
                <Typography variant="body2" color="text.secondary">
                  Company
                </Typography>
                <Typography>{selectedCompanyName || "-"}</Typography>
              </Box>

              <Box>
                <Typography variant="body2" color="text.secondary">
                  Description
                </Typography>
                <Typography>{description || "-"}</Typography>
              </Box>

              <Box>
                <Typography variant="body2" color="text.secondary">
                  Session ID
                </Typography>
                <Typography>{createdSession?.id || "-"}</Typography>
              </Box>

              <Box>
                <Typography variant="body2" color="text.secondary">
                  Selected Questions
                </Typography>
                <Typography>{selectedQuestions.length}</Typography>
              </Box>

              <Box>
                <Typography variant="body2" color="text.secondary">
                  Questions Added
                </Typography>
                <Typography>{addedQuestions.length}</Typography>
              </Box>
            </Stack>

            {!!addedQuestions.length && (
              <Paper variant="outlined" sx={{ mt: 2, p: 1.5, borderRadius: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 0.8 }}>
                  Added Questions Summary
                </Typography>
                <Stack spacing={0.8}>
                  {addedQuestions.map((item) => (
                    <Typography key={item.question_id} variant="body2">
                      {item.display_order}. {item.question_text} ({item.question_code})
                    </Typography>
                  ))}
                </Stack>
              </Paper>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Layout>
  );
}
