import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, CircularProgress, FormControl, MenuItem, Paper, Select, Stack, TextField, Typography, Alert } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "../../layouts/commonLayout/Layout";
import { fetchCompanies } from "../../store/companySlice";
import { clearSessionDetailError, clearSessionError, clearSessionMessages, createSession, fetchSessionById, updateSession } from "../../store/sessionSlice";
import { getSurfaceBackground } from "../../theme";

export default function SessionEditor({ mode }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const theme = useTheme();
  const { id } = useParams();
  const { companies, companiesLoading, error: companiesError } = useSelector((state) => state.company);
  const {
    createLoading,
    updateLoading,
    createMessage,
    updateMessage,
    error: sessionError,
    updateError,
    detailLoading,
    detailError,
    sessionDetails,
  } = useSelector((state) => state.session);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [companyId, setCompanyId] = useState("");
  const [formError, setFormError] = useState("");

  useEffect(() => {
    dispatch(fetchCompanies());
    dispatch(clearSessionMessages());
    dispatch(clearSessionError());
    dispatch(clearSessionDetailError());

    if (mode === "edit" && id) {
      dispatch(fetchSessionById(id));
    }
  }, [dispatch, id, mode]);

  useEffect(() => {
    if (mode === "edit" && sessionDetails && String(sessionDetails.id) === String(id)) {
      setTitle(sessionDetails.title || "");
      setDescription(sessionDetails.description || "");
      setCompanyId(sessionDetails.company_id || "");
    }
  }, [id, mode, sessionDetails]);

  const heading = useMemo(
    () => (mode === "edit" ? "Edit Session" : "Add Session"),
    [mode],
  );

  const handleSubmit = async () => {
    dispatch(clearSessionMessages());
    dispatch(clearSessionError());
    dispatch(clearSessionDetailError());

    if (!title.trim() || !description.trim() || !companyId) {
      setFormError("Title, description and company are required.");
      return;
    }

    setFormError("");

    try {
      if (mode === "edit" && id) {
        await dispatch(
          updateSession({
            sessionId: id,
            title: title.trim(),
            description: description.trim(),
            companyId,
          }),
        ).unwrap();
      } else {
        await dispatch(
          createSession({
            title: title.trim(),
            description: description.trim(),
            companyId,
          }),
        ).unwrap();
      }

      navigate("/admin/sessions", { replace: true });
    } catch {
      // Redux state already holds the error.
    }
  };

  return (
    <Layout role="admin" title={heading}>
      <Paper
        elevation={0}
        sx={{
          maxWidth: 760,
          p: { xs: 2, sm: 3 },
          borderRadius: 3,
          border: "1px solid",
          borderColor: "divider",
          bgcolor: getSurfaceBackground(theme),
        }}
      >
        <Stack spacing={2}>
          <Typography variant="h5" sx={{ fontWeight: 750 }}>
            {heading}
          </Typography>
          <Typography color="text.secondary">
            {mode === "edit"
              ? "Update the session details here."
              : "Create the session details here, then manage questions from the Sessions page."}
          </Typography>

          {(detailLoading || companiesLoading) && mode === "edit" && (
            <Stack direction="row" spacing={1} alignItems="center">
              <CircularProgress size={18} />
              <Typography variant="body2">Loading session details...</Typography>
            </Stack>
          )}

          {!!formError && <Alert severity="error">{formError}</Alert>}
          {!!sessionError && <Alert severity="error">{sessionError}</Alert>}
          {!!updateError && <Alert severity="error">{updateError}</Alert>}
          {!!detailError && <Alert severity="error">{detailError}</Alert>}
          {!!companiesError && <Alert severity="error">{companiesError}</Alert>}
          {!!createMessage && <Alert severity="success">{createMessage}</Alert>}
          {!!updateMessage && <Alert severity="success">{updateMessage}</Alert>}

          <TextField label="Session Title" value={title} onChange={(event) => setTitle(event.target.value)} fullWidth />
          <TextField label="Description" value={description} onChange={(event) => setDescription(event.target.value)} fullWidth multiline minRows={4} />

          <FormControl fullWidth>
            <Select
              displayEmpty
              value={companyId}
              onChange={(event) => setCompanyId(event.target.value)}
              disabled={companiesLoading}
            >
              <MenuItem value="">Select Company</MenuItem>
              {companies.map((company) => (
                <MenuItem key={company.id} value={company.id}>
                  {company.company_name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Stack direction="row" spacing={1.2}>
            <Button variant="contained" onClick={handleSubmit} disabled={createLoading || updateLoading || detailLoading}>
              {createLoading || updateLoading
                ? mode === "edit"
                  ? "Saving..."
                  : "Creating..."
                : mode === "edit"
                  ? "Save Session"
                  : "Create Session"}
            </Button>
            <Button variant="outlined" onClick={() => navigate("/admin/sessions")}>
              Cancel
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Layout>
  );
}
