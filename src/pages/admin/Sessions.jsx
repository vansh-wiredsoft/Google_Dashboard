import { useMemo, useState } from "react";
import {
  Box,
  Button,
  Checkbox,
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

const companies = [
  { id: 1, name: "Skyline Tech" },
  { id: 2, name: "Aster Solutions" },
  { id: 3, name: "Nimbus Labs" },
];

const questions = [
  { id: 1, text: "What is normalization in DBMS?" },
  { id: 2, text: "Explain async/await in JavaScript." },
  { id: 3, text: "What is REST and why is it stateless?" },
  { id: 4, text: "Differentiate stack and queue." },
  { id: 5, text: "How does indexing improve query performance?" },
];

export default function Sessions() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [companyId, setCompanyId] = useState("");
  const [selectedQuestions, setSelectedQuestions] = useState([]);

  const selectedCompanyName = useMemo(
    () => companies.find((company) => company.id === companyId)?.name || "",
    [companyId],
  );

  const toggleQuestion = (questionId) => {
    setSelectedQuestions((current) =>
      current.includes(questionId)
        ? current.filter((id) => id !== questionId)
        : [...current, questionId],
    );
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setCompanyId("");
    setSelectedQuestions([]);
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
              Set title, description, company, and add questions to prepare an assessment
              session.
            </Typography>

            <Stack spacing={2}>
              <TextField
                label="Session Title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                fullWidth
              />

              <TextField
                label="Description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                fullWidth
                multiline
                minRows={3}
              />

              <FormControl fullWidth>
                <Select
                  displayEmpty
                  value={companyId}
                  onChange={(event) => setCompanyId(event.target.value)}
                >
                  <MenuItem value="">Select Company</MenuItem>
                  {companies.map((company) => (
                    <MenuItem key={company.id} value={company.id}>
                      {company.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
                  Add Questions
                </Typography>
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
                      label={question.text}
                    />
                  ))}
                </Stack>
              </Box>

              <Stack direction="row" spacing={1.2}>
                <Button variant="contained">Create Session</Button>
                <Button variant="outlined" onClick={resetForm}>
                  Reset
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
                  Selected Questions
                </Typography>
                <Typography>{selectedQuestions.length}</Typography>
              </Box>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Layout>
  );
}
