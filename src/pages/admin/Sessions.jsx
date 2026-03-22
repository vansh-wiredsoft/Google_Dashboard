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
  useTheme,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { DataGrid } from "@mui/x-data-grid";
import Layout from "../../layouts/commonLayout/Layout";
import {
  addQuestionsToSession,
  clearSessionDetailError,
  clearSessionDetails,
  clearSessionError,
  clearSessionListError,
  clearSessionMessages,
  clearSessionPreview,
  createSession,
  fetchSessionPreview,
  fetchSessionById,
  fetchSessions,
  publishSession,
  resetSessionFlow,
} from "../../store/sessionSlice";
import { fetchCompanies } from "../../store/companySlice";
import {
  clearQuestionHierarchyError,
  fetchQuestionHierarchy,
} from "../../store/questionHierarchySlice";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import RefreshIcon from "@mui/icons-material/Refresh";
import PreviewRoundedIcon from "@mui/icons-material/PreviewRounded";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import LinkIcon from "@mui/icons-material/Link";
import PublishIcon from "@mui/icons-material/Publish";
import { getSurfaceBackground } from "../../theme";

const normalizeQuestion = (item, index) => ({
  id: String(item?.id || item?.question_id || index),
  text: item?.question_text || item?.text || item?.name || "Untitled Question",
  code: item?.question_code || "",
});

export default function Sessions() {
  const theme = useTheme();
  const dispatch = useDispatch();
  const {
    createdSession,
    addedQuestions,
    sessions,
    createLoading,
    addLoading,
    listLoading,
    detailLoading,
    previewLoading,
    publishLoading,
    createMessage,
    addMessage,
    detailMessage,
    previewMessage,
    publishMessage,
    error: sessionError,
    listError,
    detailError,
    previewError,
    publishError,
    sessionDetails,
    sessionPreview,
  } = useSelector((state) => state.session);
  const {
    companies,
    companiesLoading,
    error: companiesError,
  } = useSelector((state) => state.company);
  const {
    items: questionHierarchy,
    loading: loadingQuestions,
    error: questionHierarchyError,
  } = useSelector((state) => state.questionHierarchy);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [companyId, setCompanyId] = useState("");
  const [selectedThemeKeys, setSelectedThemeKeys] = useState([]);
  const [selectedKpiKeys, setSelectedKpiKeys] = useState([]);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [formError, setFormError] = useState("");
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);

  const selectedCompanyName = useMemo(
    () => companies.find((company) => company.id === companyId)?.company_name || "",
    [companyId],
  );
  const selectedThemes = useMemo(
    () =>
      questionHierarchy.filter((theme) =>
        selectedThemeKeys.includes(theme.theme_key),
      ),
    [questionHierarchy, selectedThemeKeys],
  );
  const kpiOptions = useMemo(
    () =>
      selectedThemes.flatMap((theme) =>
        (Array.isArray(theme?.kpis) ? theme.kpis : []).map((kpi) => ({
          ...kpi,
          selectionKey: `${theme.theme_key}::${kpi.kpi_key}`,
          themeKey: theme.theme_key,
          themeDisplayName: theme.theme_display_name || theme.theme_key,
        })),
      ),
    [selectedThemes],
  );
  const questions = useMemo(() => {
    const questionMap = new Map();

    kpiOptions
      .filter((kpi) => selectedKpiKeys.includes(kpi.selectionKey))
      .forEach((kpi) => {
        const rawQuestions = Array.isArray(kpi.questions) ? kpi.questions : [];
        rawQuestions.map(normalizeQuestion).forEach((question) => {
          if (!questionMap.has(question.id)) {
            questionMap.set(question.id, question);
          }
        });
      });

    return Array.from(questionMap.values());
  }, [kpiOptions, selectedKpiKeys]);
  const allThemeKeys = useMemo(
    () => questionHierarchy.map((item) => item.theme_key),
    [questionHierarchy],
  );
  const allKpiKeys = useMemo(
    () => kpiOptions.map((item) => item.selectionKey),
    [kpiOptions],
  );
  const allThemesSelected =
    !!allThemeKeys.length && selectedThemeKeys.length === allThemeKeys.length;
  const allKpisSelected =
    !!allKpiKeys.length && selectedKpiKeys.length === allKpiKeys.length;

  useEffect(() => {
    dispatch(fetchCompanies());
    dispatch(fetchSessions());
    dispatch(fetchQuestionHierarchy());
  }, [dispatch]);

  useEffect(() => {
    return () => {
      dispatch(resetSessionFlow());
      dispatch(clearQuestionHierarchyError());
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

  const handleThemeSelectionChange = (event) => {
    const value = event.target.value;
    const hasSelectAll = value.includes("__all_themes__");
    const nextThemeKeys = hasSelectAll
      ? allThemesSelected
        ? []
        : allThemeKeys
      : value;

    setSelectedThemeKeys(nextThemeKeys);
    setSelectedKpiKeys([]);
    setSelectedQuestions([]);
  };

  const handleKpiSelectionChange = (event) => {
    const value = event.target.value;
    const hasSelectAll = value.includes("__all_kpis__");
    const nextKpiKeys = hasSelectAll
      ? allKpisSelected
        ? []
        : allKpiKeys
      : value;

    setSelectedKpiKeys(nextKpiKeys);
    setSelectedQuestions([]);
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
    setSelectedThemeKeys([]);
    setSelectedKpiKeys([]);
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

  const handlePreviewSession = async (sessionId) => {
    setPreviewDialogOpen(true);
    try {
      await dispatch(fetchSessionPreview(sessionId)).unwrap();
    } catch {
      // Error is already captured in redux state.
    }
  };

  const handlePublishSession = async () => {
    if (!sessionPreview?.session_id) return;

    try {
      await dispatch(publishSession(sessionPreview.session_id)).unwrap();
      dispatch(fetchSessions());
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
          <Stack
            direction="row"
            spacing={0.5}
            alignItems="center"
            justifyContent="center"
            sx={{ width: "100%", height: "100%" }}
          >
            <Tooltip title="View">
              <IconButton
                size="small"
                color="primary"
                onClick={() => handleViewSession(params.row)}
              >
                <VisibilityIcon fontSize="small" />
              </IconButton>
            </Tooltip>

            <Tooltip title="Preview Form">
              <IconButton
                size="small"
                color="success"
                onClick={() => handlePreviewSession(params.row.id)}
              >
                <PreviewRoundedIcon fontSize="small" />
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

  const handleClosePreviewDialog = () => {
    setPreviewDialogOpen(false);
    dispatch(clearSessionPreview());
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
              bgcolor: getSurfaceBackground(theme),
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
              {!!questionHierarchyError && (
                <Alert severity="error">{questionHierarchyError}</Alert>
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
                          multiple
                          displayEmpty
                          value={selectedThemeKeys}
                          onChange={handleThemeSelectionChange}
                          renderValue={(selected) =>
                            selected.length
                              ? questionHierarchy
                                  .filter((theme) =>
                                    selected.includes(theme.theme_key),
                                  )
                                  .map(
                                    (theme) =>
                                      theme.theme_display_name ||
                                      theme.theme_key,
                                  )
                                  .join(", ")
                              : "Select Theme"
                          }
                        >
                          <MenuItem value="__all_themes__">
                            <Checkbox checked={allThemesSelected} />
                            Select All Themes
                          </MenuItem>
                          {questionHierarchy.map((theme) => (
                            <MenuItem
                              key={theme.theme_key}
                              value={theme.theme_key}
                            >
                              <Checkbox
                                checked={selectedThemeKeys.includes(
                                  theme.theme_key,
                                )}
                              />
                              {theme.theme_display_name || theme.theme_key}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>

                      <FormControl fullWidth disabled={!selectedThemeKeys.length}>
                        <Select
                          multiple
                          displayEmpty
                          value={selectedKpiKeys}
                          onChange={handleKpiSelectionChange}
                          renderValue={(selected) =>
                            selected.length
                              ? kpiOptions
                                  .filter((kpi) =>
                                    selected.includes(kpi.selectionKey),
                                  )
                                  .map(
                                    (kpi) =>
                                      `${kpi.display_name || kpi.kpi_key} (${kpi.themeDisplayName})`,
                                  )
                                  .join(", ")
                              : "Select KPI"
                          }
                        >
                          <MenuItem value="__all_kpis__">
                            <Checkbox checked={allKpisSelected} />
                            Select All KPI
                          </MenuItem>
                          {kpiOptions.map((kpi) => (
                            <MenuItem
                              key={kpi.selectionKey}
                              value={kpi.selectionKey}
                            >
                              <Checkbox
                                checked={selectedKpiKeys.includes(
                                  kpi.selectionKey,
                                )}
                              />
                              {kpi.display_name || kpi.kpi_key} (
                              {kpi.themeDisplayName})
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>

                      {!!selectedKpiKeys.length && (
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
                              No questions found for selected KPIs.
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
                {!!createdSession && !!addedQuestions.length && (
                  <Button
                    variant="outlined"
                    color="success"
                    startIcon={<PreviewRoundedIcon />}
                    onClick={() => handlePreviewSession(createdSession.id)}
                  >
                    Preview Form
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
              bgcolor: getSurfaceBackground(theme),
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
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={1}
                  alignItems={{ xs: "stretch", sm: "center" }}
                  justifyContent="space-between"
                  sx={{ mb: 0.8 }}
                >
                  <Typography variant="subtitle2">
                    Added Questions Summary
                  </Typography>
                  {!!createdSession && (
                    <Button
                      variant="contained"
                      color="success"
                      size="small"
                      startIcon={<PreviewRoundedIcon />}
                      onClick={() => handlePreviewSession(createdSession.id)}
                      sx={{ alignSelf: { xs: "stretch", sm: "center" } }}
                    >
                      Open Form Preview
                    </Button>
                  )}
                </Stack>
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
              bgcolor: getSurfaceBackground(theme),
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
                  rowHeight={66}
                  columnHeaderHeight={56}
                  disableRowSelectionOnClick
                  pageSizeOptions={[10, 25, 50]}
                  initialState={{
                    pagination: {
                      paginationModel: { pageSize: 10, page: 0 },
                    },
                  }}
                  sx={{
                    border: 0,
                    "& .MuiDataGrid-columnHeader": {
                      display: "flex",
                      alignItems: "center",
                    },
                    "& .MuiDataGrid-cell": {
                      display: "flex",
                      alignItems: "center",
                    },
                    "& .MuiDataGrid-cell:focus, & .MuiDataGrid-columnHeader:focus":
                      {
                        outline: "none",
                      },
                    "& .MuiDataGrid-cell:focus-within, & .MuiDataGrid-columnHeader:focus-within":
                      {
                        outline: "none",
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

      <Dialog
        open={previewDialogOpen}
        onClose={handleClosePreviewDialog}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1.2}
            alignItems={{ xs: "stretch", sm: "center" }}
            justifyContent="space-between"
          >
            <Typography variant="h6">Form Preview</Typography>
            <Stack direction="row" spacing={1} justifyContent="flex-end">
              {!sessionPreview?.is_published && !!sessionPreview && (
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<PublishIcon />}
                  onClick={handlePublishSession}
                  disabled={publishLoading}
                >
                  {publishLoading ? "Publishing..." : "Publish Form"}
                </Button>
              )}
              <Button onClick={handleClosePreviewDialog}>Close</Button>
            </Stack>
          </Stack>
        </DialogTitle>
        <DialogContent
          dividers
          sx={{
            bgcolor: "background.default",
            px: { xs: 1.5, sm: 3 },
            py: { xs: 2, sm: 3 },
          }}
        >
          {previewLoading && (
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              sx={{ py: 2 }}
            >
              <CircularProgress size={18} />
              <Typography>Loading form preview...</Typography>
            </Stack>
          )}

          {!!previewError && !previewLoading && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {previewError}
            </Alert>
          )}

          {!!publishError && !previewLoading && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {publishError}
            </Alert>
          )}

          {!!previewMessage && !previewLoading && !previewError && (
            <Alert severity="info" sx={{ mb: 2 }}>
              {previewMessage}
            </Alert>
          )}

          {!!publishMessage && !previewLoading && !publishError && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {publishMessage}
            </Alert>
          )}

          {!!sessionPreview && !previewLoading && (
            <Stack spacing={2}>
              <Paper
                elevation={0}
                sx={{
                  borderRadius: 3,
                  overflow: "hidden",
                  border: "1px solid",
                  borderColor: "divider",
                  bgcolor: getSurfaceBackground(theme, 0.92),
                  backdropFilter: "blur(6px)",
                }}
              >
                <Box sx={{ height: 10, bgcolor: "primary.main" }} />
                <Box sx={{ p: { xs: 2, sm: 3 } }}>
                  <Typography
                    variant="h4"
                    sx={{ fontSize: { xs: 24, sm: 32 }, mb: 1 }}
                  >
                    {sessionPreview.title || "-"}
                  </Typography>
                  <Typography color="text.secondary" sx={{ mb: 2 }}>
                    {sessionPreview.description || "No description provided."}
                  </Typography>

                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={1.2}
                    useFlexGap
                    flexWrap="wrap"
                  >
                    <Paper
                      variant="outlined"
                      sx={{ px: 1.5, py: 1, borderRadius: 2, minWidth: 180 }}
                    >
                      <Typography variant="caption" color="text.secondary">
                        Session ID
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {sessionPreview.session_id}
                      </Typography>
                    </Paper>
                    <Paper
                      variant="outlined"
                      sx={{ px: 1.5, py: 1, borderRadius: 2, minWidth: 180 }}
                    >
                      <Typography variant="caption" color="text.secondary">
                        Status
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {sessionPreview.is_published ? "Published" : "Draft"}
                      </Typography>
                    </Paper>
                    {!!sessionPreview.preview_url && (
                      <Paper
                        variant="outlined"
                        sx={{ px: 1.5, py: 1, borderRadius: 2, minWidth: 180 }}
                      >
                        <Typography variant="caption" color="text.secondary">
                          Preview URL
                        </Typography>
                        <Stack
                          direction="row"
                          spacing={0.7}
                          alignItems="center"
                        >
                          <LinkIcon
                            sx={{ fontSize: 16, color: "text.secondary" }}
                          />
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {sessionPreview.preview_url}
                          </Typography>
                        </Stack>
                      </Paper>
                    )}
                    {!!sessionPreview.final_url && (
                      <Paper
                        variant="outlined"
                        sx={{ px: 1.5, py: 1, borderRadius: 2, minWidth: 180 }}
                      >
                        <Typography variant="caption" color="text.secondary">
                          Final URL
                        </Typography>
                        <Stack
                          direction="row"
                          spacing={0.7}
                          alignItems="center"
                        >
                          <LinkIcon
                            sx={{ fontSize: 16, color: "text.secondary" }}
                          />
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {sessionPreview.final_url}
                          </Typography>
                        </Stack>
                      </Paper>
                    )}
                  </Stack>
                </Box>
              </Paper>

              {(sessionPreview.questions || []).map((question) => (
                <Paper
                  key={question.question_id}
                  elevation={0}
                  sx={{
                    p: { xs: 2, sm: 3 },
                    borderRadius: 3,
                    border: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  <Stack spacing={1.4}>
                    <Stack
                      direction={{ xs: "column", sm: "row" }}
                      justifyContent="space-between"
                      spacing={1}
                    >
                      <Box>
                        <Typography
                          variant="subtitle1"
                          sx={{ fontWeight: 700 }}
                        >
                          {question.display_order}. {question.question_text}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {question.theme_display_name} •{" "}
                          {question.kpi_display_name}
                        </Typography>
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        {question.question_code}
                      </Typography>
                    </Stack>

                    <Stack spacing={1}>
                      {(question.options || []).map((option, index) => (
                        <Paper
                          key={`${question.question_id}-${index}`}
                          variant="outlined"
                          sx={{
                            p: 1.4,
                            borderRadius: 999,
                            display: "flex",
                            alignItems: "center",
                            gap: 1.2,
                            bgcolor: alpha(
                              theme.palette.primary.main,
                              theme.palette.mode === "dark" ? 0.08 : 0.04,
                            ),
                            borderColor: alpha(
                              theme.palette.primary.main,
                              theme.palette.mode === "dark" ? 0.28 : 0.18,
                            ),
                          }}
                        >
                          <RadioButtonUncheckedIcon
                            sx={{ color: "text.secondary", fontSize: 20 }}
                          />
                          <Typography variant="body2">{option}</Typography>
                        </Paper>
                      ))}
                    </Stack>
                  </Stack>
                </Paper>
              ))}

              {!sessionPreview.questions?.length && (
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: 3,
                    border: "1px dashed",
                    borderColor: "divider",
                    textAlign: "center",
                  }}
                >
                  <Typography color="text.secondary">
                    No questions are available in this preview yet.
                  </Typography>
                </Paper>
              )}
            </Stack>
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
