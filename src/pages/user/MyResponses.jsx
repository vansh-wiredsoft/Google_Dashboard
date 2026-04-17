import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Alert,
  Box,
  Button,
  Chip,
  Collapse,
  Divider,
  Grid,
  IconButton,
  Paper,
  Stack,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import ChecklistRoundedIcon from "@mui/icons-material/ChecklistRounded";
import ExpandLessRoundedIcon from "@mui/icons-material/ExpandLessRounded";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import QueryStatsRoundedIcon from "@mui/icons-material/QueryStatsRounded";
import TaskAltRoundedIcon from "@mui/icons-material/TaskAltRounded";
import Layout from "../../layouts/commonLayout/Layout";
import {
  clearMySubmissionsState,
  clearMyLinksState,
  fetchMyLinks,
  fetchMySubmissions,
} from "../../store/sessionSlice";
import { getSurfaceBackground } from "../../theme";

function formatDateTime(value) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

function SummaryCard({ label, value, icon }) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        borderRadius: 3,
        border: "1px solid",
        borderColor: "divider",
        height: "100%",
      }}
    >
      <Stack direction="row" spacing={1.2} alignItems="center">
        <Box
          sx={{
            width: 38,
            height: 38,
            borderRadius: 2.5,
            display: "grid",
            placeItems: "center",
            bgcolor: "action.hover",
            color: "primary.main",
          }}
        >
          {icon}
        </Box>
        <Box>
          <Typography variant="body2" color="text.secondary">
            {label}
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 800 }}>
            {value}
          </Typography>
        </Box>
      </Stack>
    </Paper>
  );
}

export default function MyResponses() {
  const theme = useTheme();
  const dispatch = useDispatch();
  const [expandedSessions, setExpandedSessions] = useState({});
  const {
    mySubmissions,
    mySubmissionsLoading,
    mySubmissionsError,
    mySubmissionsMessage,
    myLinks,
    myLinksLoading,
    myLinksError,
  } = useSelector((state) => state.session);

  useEffect(() => {
    dispatch(fetchMySubmissions());
    dispatch(fetchMyLinks({ skip: 0, limit: 50 }));

    return () => {
      dispatch(clearMySubmissionsState());
      dispatch(clearMyLinksState());
    };
  }, [dispatch]);

  const summary = useMemo(() => {
    const responses = mySubmissions.flatMap((session) => session.responses || []);
    const totalQuestions = responses.reduce(
      (total, item) => total + (item.questions?.length || 0),
      0,
    );
    const totalScore = responses.reduce(
      (total, item) => total + (item.total_score || 0),
      0,
    );

    return {
      sessions: mySubmissions.length,
      responses: responses.length,
      questions: totalQuestions,
      score: totalScore,
    };
  }, [mySubmissions]);

  const unansweredLinks = useMemo(() => {
    const submittedIds = new Set(
      mySubmissions
        .filter((session) => (session.responses || []).length)
        .map((session) => session.session_id),
    );
    return myLinks.filter((item) => !submittedIds.has(item.session_id));
  }, [myLinks, mySubmissions]);

  const summaryWithPending = useMemo(
    () => ({
      ...summary,
      pending: unansweredLinks.length,
    }),
    [summary, unansweredLinks.length],
  );

  useEffect(() => {
    setExpandedSessions((current) =>
      mySubmissions.reduce((accumulator, session, index) => {
        accumulator[session.session_id] =
          current[session.session_id] ?? index === 0;
        return accumulator;
      }, {}),
    );
  }, [mySubmissions]);

  const toggleSession = (sessionId) => {
    setExpandedSessions((current) => ({
      ...current,
      [sessionId]: !current[sessionId],
    }));
  };

  return (
    <Layout role="user" title="My Responses">
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
          <Stack spacing={1}>
            <Typography variant="h5" sx={{ fontWeight: 800 }}>
              My Responses
            </Typography>
            <Typography color="text.secondary">
              Review your submitted session responses, selected answers, and KPI
              score breakdowns and unanswered responses.
            </Typography>
          </Stack>

          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              <SummaryCard
                label="Sessions Submitted"
                value={summaryWithPending.sessions}
                icon={<ChecklistRoundedIcon fontSize="small" />}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              <SummaryCard
                label="Total Responses"
                value={summaryWithPending.responses}
                icon={<TaskAltRoundedIcon fontSize="small" />}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              <SummaryCard
                label="Questions Answered"
                value={summaryWithPending.questions}
                icon={<QueryStatsRoundedIcon fontSize="small" />}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              <SummaryCard
                label="Total Score"
                value={summaryWithPending.score}
                icon={<QueryStatsRoundedIcon fontSize="small" />}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              <SummaryCard
                label="Pending Forms"
                value={summaryWithPending.pending}
                icon={<ChecklistRoundedIcon fontSize="small" />}
              />
            </Grid>
          </Grid>
        </Paper>

        {mySubmissionsError && <Alert severity="error">{mySubmissionsError}</Alert>}
        {myLinksError && <Alert severity="error">{myLinksError}</Alert>}
        {!mySubmissionsError && mySubmissionsMessage && (
          <Alert severity="success">{mySubmissionsMessage}</Alert>
        )}

        {mySubmissionsLoading ? (
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              border: "1px solid",
              borderColor: "divider",
              bgcolor: getSurfaceBackground(theme),
            }}
          >
            <Typography>Loading your submitted responses...</Typography>
          </Paper>
        ) : null}

        {myLinksLoading ? (
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              border: "1px solid",
              borderColor: "divider",
              bgcolor: getSurfaceBackground(theme),
            }}
          >
            <Typography>Loading your pending session forms...</Typography>
          </Paper>
        ) : null}

        {!myLinksLoading && !!unansweredLinks.length ? (
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
            <Stack spacing={2}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>
                  Pending Session Forms
                </Typography>
                <Typography color="text.secondary" sx={{ mt: 0.6 }}>
                  These sessions are published but not yet submitted.
                </Typography>
              </Box>

              <Stack spacing={1.5}>
                {unansweredLinks.map((item) => (
                  <Paper
                    key={item.session_id}
                    variant="outlined"
                    sx={{ p: 2, borderRadius: 2.5 }}
                  >
                    <Stack
                      direction={{ xs: "column", sm: "row" }}
                      justifyContent="space-between"
                      spacing={1.5}
                    >
                      <Box>
                        <Typography sx={{ fontWeight: 700 }}>
                          {item.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {item.description || "No description provided."}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mt: 0.8 }}
                        >
                          Published: {formatDateTime(item.published_at)}
                        </Typography>
                      </Box>
                      <Stack
                        direction={{ xs: "column", sm: "row" }}
                        spacing={1}
                        alignItems={{ sm: "center" }}
                      >
                        <Button
                          variant="outlined"
                          href={item.form_url || undefined}
                          target="_blank"
                          rel="noreferrer"
                          disabled={!item.form_url}
                        >
                          Open Form
                        </Button>
                      </Stack>
                    </Stack>
                  </Paper>
                ))}
              </Stack>
            </Stack>
          </Paper>
        ) : null}

        {!myLinksLoading && !unansweredLinks.length ? (
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
              No pending forms
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 0.75 }}>
              You have submitted all available session forms.
            </Typography>
          </Paper>
        ) : null}

        {!mySubmissionsLoading && !mySubmissions.length ? (
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              border: "1px solid",
              borderColor: "divider",
              bgcolor: getSurfaceBackground(theme),
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              No submissions found
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 0.75 }}>
              Once you submit session forms, they will appear here.
            </Typography>
          </Paper>
        ) : null}

        {!mySubmissionsLoading &&
          mySubmissions.map((session) => (
            <Paper
              key={session.session_id}
              elevation={0}
              sx={{
                p: { xs: 2, sm: 3 },
                borderRadius: 3,
                border: "1px solid",
                borderColor: "divider",
                bgcolor: getSurfaceBackground(theme),
              }}
            >
              <Stack spacing={2}>
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  justifyContent="space-between"
                  spacing={1.5}
                  alignItems={{ sm: "flex-start" }}
                >
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 800 }}>
                      {session.title}
                    </Typography>
                    <Typography color="text.secondary" sx={{ mt: 0.5 }}>
                      {session.description || "No description provided."}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Submissions: {session.responses.length}
                    </Typography>
                  </Box>
                  <Tooltip
                    title={expandedSessions[session.session_id] ? "Collapse" : "Expand"}
                  >
                    <IconButton onClick={() => toggleSession(session.session_id)}>
                      {expandedSessions[session.session_id] ? (
                        <ExpandLessRoundedIcon />
                      ) : (
                        <ExpandMoreRoundedIcon />
                      )}
                    </IconButton>
                  </Tooltip>
                </Stack>

                <Collapse in={Boolean(expandedSessions[session.session_id])}>
                  <Stack spacing={2} sx={{ pt: 1 }}>
                    {session.responses.map((response, responseIndex) => (
                      <Paper
                        key={response.response_id}
                        variant="outlined"
                        sx={{ p: 2, borderRadius: 3 }}
                      >
                        <Stack spacing={2}>
                          <Stack
                            direction={{ xs: "column", md: "row" }}
                            justifyContent="space-between"
                            spacing={1.5}
                          >
                            <Box>
                              <Typography sx={{ fontWeight: 700 }}>
                                Submission {responseIndex + 1}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {response.employee_email || "-"}
                              </Typography>
                            </Box>
                            <Stack
                              direction={{ xs: "column", sm: "row" }}
                              spacing={1}
                              useFlexGap
                              flexWrap="wrap"
                            >
                              <Chip
                                label={`Submitted: ${formatDateTime(response.submitted_at)}`}
                                variant="outlined"
                              />
                              <Chip
                                label={`Total Score: ${response.total_score}`}
                                color="primary"
                              />
                            </Stack>
                          </Stack>

                          {!!response.kpi_scores.length && (
                            <Box>
                              <Typography sx={{ fontWeight: 700, mb: 1.2 }}>
                                KPI Scores
                              </Typography>
                              <Grid container spacing={1.25}>
                                {response.kpi_scores.map((item) => (
                                  <Grid key={item.kpi_key} size={{ xs: 12, md: 6, xl: 4 }}>
                                    <Paper
                                      variant="outlined"
                                      sx={{ p: 1.5, borderRadius: 2.5, height: "100%" }}
                                    >
                                      <Typography sx={{ fontWeight: 700 }}>
                                        {item.kpi_name}
                                      </Typography>
                                      <Typography
                                        variant="body2"
                                        color="text.secondary"
                                        sx={{ mt: 0.6 }}
                                      >
                                        Total Score: {item.total_score}
                                      </Typography>
                                      <Typography variant="body2" color="text.secondary">
                                        Questions: {item.question_count}
                                      </Typography>
                                      <Typography variant="body2" color="text.secondary">
                                        Average Score: {item.average_score}
                                      </Typography>
                                    </Paper>
                                  </Grid>
                                ))}
                              </Grid>
                            </Box>
                          )}

                          <Divider />

                          <Box>
                            <Typography sx={{ fontWeight: 700, mb: 1.2 }}>
                              Answered Questions
                            </Typography>
                            <Stack spacing={1.25}>
                              {response.questions.map((question, index) => (
                                <Paper
                                  key={`${response.response_id}-${question.question_code}-${index}`}
                                  variant="outlined"
                                  sx={{ p: 1.5, borderRadius: 2.5 }}
                                >
                                  <Stack spacing={0.75}>
                                    <Stack
                                      direction={{ xs: "column", sm: "row" }}
                                      justifyContent="space-between"
                                      spacing={1}
                                    >
                                      <Typography sx={{ fontWeight: 700 }}>
                                        {question.question_text}
                                      </Typography>
                                      <Chip
                                        label={`Score: ${question.score}`}
                                        size="small"
                                        color="primary"
                                        variant="outlined"
                                      />
                                    </Stack>
                                    <Typography variant="body2" color="text.secondary">
                                      Code: {question.question_code}
                                    </Typography>
                                    <Typography variant="body2">
                                      Selected Option:{" "}
                                      <Box component="span" sx={{ fontWeight: 700 }}>
                                        {question.selected_option}
                                      </Box>
                                    </Typography>
                                  </Stack>
                                </Paper>
                              ))}
                            </Stack>
                          </Box>
                        </Stack>
                      </Paper>
                    ))}
                  </Stack>
                </Collapse>
              </Stack>
            </Paper>
          ))}
      </Stack>
    </Layout>
  );
}
