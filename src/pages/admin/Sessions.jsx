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
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import Layout from "../../layouts/commonLayout/Layout";
import api from "../../services/api";
import {
  addQuestionsToSession,
  clearSessionDetailError,
  clearSessionDetails,
  clearSessionError,
  clearSessionListError,
  clearSessionMessages,
  createSession,
  fetchSessionById,
  fetchSessions,
  resetSessionFlow,
} from "../../store/sessionSlice";
import { fetchCompanies } from "../../store/companySlice";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import RefreshIcon from "@mui/icons-material/Refresh";

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
    sessions,
    createLoading,
    addLoading,
    listLoading,
    detailLoading,
    createMessage,
    addMessage,
    detailMessage,
    error: sessionError,
    listError,
    detailError,
    sessionDetails,
  } = useSelector((state) => state.session);
  const {
    companies,
    companiesLoading,
    error: companiesError,
  } = useSelector((state) => state.company);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [companyId, setCompanyId] = useState("");
  const [selectedThemeKey, setSelectedThemeKey] = useState("");
  const [selectedKpiKey, setSelectedKpiKey] = useState("");
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [questionHierarchy, setQuestionHierarchy] = useState([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [formError, setFormError] = useState("");
  const [viewDialogOpen, setViewDialogOpen] = useState(false);

  const selectedCompanyName = useMemo(
    () => companies.find((company) => company.id === companyId)?.name || "",
    [companyId],
  );
  const selectedTheme = useMemo(
    () =>
      questionHierarchy.find((theme) => theme.theme_key === selectedThemeKey) ||
      null,
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
    const raw = Array.isArray(selectedKpi?.questions)
      ? selectedKpi.questions
      : [];
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
    dispatch(fetchSessions());
  }, [dispatch]);

  useEffect(() => {
    return () => {
      dispatch(resetSessionFlow());
    };
  }, [dispatch]);

  const clearLocalAndReduxErrors = () => {
    if (formError) setFormError("");
    if (sessionError) dispatch(clearSessionError());
    if (listError) dispatch(clearSessionListError());
    if (detailError) dispatch(clearSessionDetailError());
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
      dispatch(fetchSessions());
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
    dispatch(fetchSessions());
  };

  const sessionRows = useMemo(
    () =>
      sessions.map((session) => ({
        ...session,
        id: session.id,
        company_name:
          companies.find((company) => company.id === session.company_id)
            ?.name || session.company_id,
      })),
    [sessions, companies],
  );

  const handleViewSession = async (row) => {
    setViewDialogOpen(true);
    try {
      await dispatch(fetchSessionById(row.id)).unwrap();
    } catch {
      // Error is already captured in redux state.
    }
  };

  const handleEditSession = (row) => {
    console.log("Edit session:", row);
  };

  const handleDeleteSession = (row) => {
    console.log("Delete session:", row);
  };

  const sessionColumns = useMemo(
    () => [
      {
        field: "title",
        headerName: "Title",
        flex: 1.1,
        minWidth: 140,
        renderCell: (params) => (
          <Tooltip title={params.value || "-"}>
            <Typography variant="body2" noWrap sx={{ width: "100%" }}>
              {params.value || "-"}
            </Typography>
          </Tooltip>
        ),
      },
      {
        field: "description",
        headerName: "Description",
        flex: 1.6,
        minWidth: 220,
        renderCell: (params) => (
          <Tooltip title={params.value || "-"}>
            <Typography variant="body2" noWrap sx={{ width: "100%" }}>
              {params.value || "-"}
            </Typography>
          </Tooltip>
        ),
      },
      {
        field: "company_name",
        headerName: "Company",
        flex: 1.2,
        minWidth: 180,
        renderCell: (params) => (
          <Tooltip title={params.value || "-"}>
            <Typography variant="body2" noWrap sx={{ width: "100%" }}>
              {params.value || "-"}
            </Typography>
          </Tooltip>
        ),
      },
      {
        field: "is_active",
        headerName: "Active",
        minWidth: 90,
        renderCell: ({ value }) => (value ? "Yes" : "No"),
      },
      {
        field: "created_at",
        headerName: "Created At",
        flex: 1.2,
        minWidth: 180,
        valueFormatter: (value) =>
          value ? new Date(value).toLocaleString() : "-",
        renderCell: (params) => {
          const displayValue = params.value
            ? new Date(params.value).toLocaleString()
            : "-";
          return (
            <Tooltip title={displayValue}>
              <Typography variant="body2" noWrap sx={{ width: "100%" }}>
                {displayValue}
              </Typography>
            </Tooltip>
          );
        },
      },
      {
        field: "actions",
        headerName: "Actions",
        minWidth: 150,
        sortable: false,
        filterable: false,
        renderCell: (params) => (
          <Stack direction="row" spacing={0.5}>
            <Tooltip title="View">
              <IconButton
                size="small"
                color="primary"
                onClick={() => handleViewSession(params.row)}
              >
                <VisibilityIcon fontSize="small" />
              </IconButton>
            </Tooltip>

            <Tooltip title="Edit">
              <IconButton
                size="small"
                color="secondary"
                onClick={() => handleEditSession(params.row)}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>

            <Tooltip title="Delete">
              <IconButton
                size="small"
                color="error"
                onClick={() => handleDeleteSession(params.row)}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        ),
      },
    ],
    [],
  );

  const handleCloseViewDialog = () => {
    setViewDialogOpen(false);
    dispatch(clearSessionDetails());
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
              Create session first, then select questions and add them to the
              created session.
            </Typography>

            <Stack spacing={2}>
              {!!formError && <Alert severity="error">{formError}</Alert>}
              {!!sessionError && <Alert severity="error">{sessionError}</Alert>}
              {!!companiesError && (
                <Alert severity="error">{companiesError}</Alert>
              )}
              {!!createMessage && (
                <Alert severity="success">{createMessage}</Alert>
              )}
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
                      {company.company_name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {!createdSession && (
                <Button
                  variant="contained"
                  onClick={handleCreateSession}
                  disabled={createLoading}
                >
                  {createLoading ? "Creating Session..." : "Create Session"}
                </Button>
              )}

              {!!createdSession && (
                <Box>
                  <Typography
                    variant="subtitle1"
                    sx={{ fontWeight: 700, mb: 1 }}
                  >
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
                            <MenuItem
                              key={theme.theme_key}
                              value={theme.theme_key}
                            >
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
                                  checked={selectedQuestions.includes(
                                    question.id,
                                  )}
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
                      {item.display_order}. {item.question_text} (
                      {item.question_code})
                    </Typography>
                  ))}
                </Stack>
              </Paper>
            )}
          </Paper>
        </Grid>

        <Grid size={{ xs: 12 }}>
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
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              sx={{ mb: 2 }}
            >
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Sessions Listing
              </Typography>
              <Tooltip title="Refresh Sessions">
                <IconButton
                  size="small"
                  onClick={() => dispatch(fetchSessions())}
                  disabled={listLoading}
                >
                  <RefreshIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Stack>
            {!!listError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {listError}
              </Alert>
            )}

            <Box sx={{ width: "100%", overflowX: "auto" }}>
              <Box sx={{ height: 420, width: "max-content", minWidth: "100%" }}>
                <DataGrid
                  loading={listLoading}
                  rows={sessionRows}
                  columns={sessionColumns}
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
        </Grid>
      </Grid>

      <Dialog
        open={viewDialogOpen}
        onClose={handleCloseViewDialog}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>Session Details</DialogTitle>
        <DialogContent dividers>
          {detailLoading && (
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              sx={{ py: 2 }}
            >
              <CircularProgress size={18} />
              <Typography>Loading session details...</Typography>
            </Stack>
          )}

          {!!detailError && !detailLoading && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {detailError}
            </Alert>
          )}

          {!!detailMessage && !detailLoading && !detailError && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {detailMessage}
            </Alert>
          )}

          {!!sessionDetails && !detailLoading && (
            <Stack spacing={2}>
              <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
                <Typography variant="subtitle2">
                  {sessionDetails.title || "-"}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {sessionDetails.description || "-"}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Session ID: {sessionDetails.id}
                </Typography>
              </Paper>

              {(sessionDetails.themes || []).map((theme) => (
                <Paper
                  key={theme.theme_key}
                  variant="outlined"
                  sx={{ p: 1.5, borderRadius: 2 }}
                >
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    {theme.theme_display_name || theme.theme_key}
                  </Typography>
                  <Divider sx={{ my: 1 }} />

                  <Stack spacing={1.5}>
                    {(theme.kpis || []).map((kpi) => (
                      <Box key={kpi.kpi_key}>
                        <Typography
                          variant="subtitle2"
                          sx={{ fontWeight: 600 }}
                        >
                          KPI: {kpi.display_name || kpi.kpi_key}
                        </Typography>
                        <Stack spacing={0.7} sx={{ mt: 0.8 }}>
                          {(kpi.questions || []).map((question) => (
                            <Typography
                              key={question.question_id}
                              variant="body2"
                            >
                              {question.display_order}. {question.question_text}{" "}
                              ({question.question_code})
                            </Typography>
                          ))}
                          {!kpi.questions?.length && (
                            <Typography variant="body2" color="text.secondary">
                              No questions.
                            </Typography>
                          )}
                        </Stack>
                      </Box>
                    ))}
                  </Stack>
                </Paper>
              ))}
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseViewDialog}>Close</Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
}
