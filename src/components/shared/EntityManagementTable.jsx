import { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import {
  Alert,
  Box,
  Button,
  IconButton,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import PreviewRoundedIcon from "@mui/icons-material/PreviewRounded";
import RestartAltRoundedIcon from "@mui/icons-material/RestartAltRounded";
import UploadFileRoundedIcon from "@mui/icons-material/UploadFileRounded";
import { DataGrid } from "@mui/x-data-grid";
import { loadEntityRows, saveEntityRows } from "../../utils/entityStorage";

function normalizeImportedRows(rows) {
  return rows.map((row, index) => ({
    id: String(row.id || row.ID || `${Date.now()}-${index}`),
    ...row,
  }));
}

export default function EntityManagementTable({
  title,
  description,
  entityLabel,
  basePath,
  storageKey,
  fields,
  initialRows,
  rows: controlledRows,
  loading = false,
}) {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [internalRows, setInternalRows] = useState(() =>
    loadEntityRows(storageKey, initialRows),
  );
  const [feedback, setFeedback] = useState(null);
  const rows = controlledRows ?? internalRows;

  const columns = useMemo(
    () => [
      ...fields.map((field) => ({
        field: field.name,
        headerName: field.label,
        flex: field.flex || 1,
        minWidth: field.minWidth || 150,
        renderCell: (params) => {
          const value = params.value;
          const displayValue =
            value === null || value === undefined || value === "" ? "-" : String(value);

          return (
            <Tooltip title={displayValue}>
              <Typography variant="body2" noWrap sx={{ width: "100%" }}>
                {displayValue}
              </Typography>
            </Tooltip>
          );
        },
      })),
      {
        field: "actions",
        headerName: "Actions",
        sortable: false,
        filterable: false,
        minWidth: 140,
        renderCell: (params) => (
          <Stack direction="row" spacing={0.5}>
            <Tooltip title="View">
              <IconButton size="small" onClick={() => navigate(`${basePath}/${params.row.id}`)}>
                <PreviewRoundedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Edit">
              <IconButton
                size="small"
                onClick={() => navigate(`${basePath}/${params.row.id}/edit`)}
              >
                <EditRoundedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        ),
      },
    ],
    [basePath, fields, navigate],
  );

  const handleImport = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: "array" });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const parsedRows = XLSX.utils.sheet_to_json(worksheet, { defval: "" });
      const normalizedRows = normalizeImportedRows(parsedRows);

      if (controlledRows === undefined) {
        setInternalRows(normalizedRows);
      }
      saveEntityRows(storageKey, normalizedRows);
      setFeedback({
        severity: "success",
        message: `${parsedRows.length} ${entityLabel.toLowerCase()} record(s) imported from Excel.`,
      });
    } catch {
      setFeedback({
        severity: "error",
        message: "Unable to read the selected file.",
      });
    }

    event.target.value = "";
  };

  const handleReset = () => {
    if (controlledRows === undefined) {
      setInternalRows(initialRows);
    }
    saveEntityRows(storageKey, initialRows);
    setFeedback({
      severity: "info",
      message: `Reset to sample ${entityLabel.toLowerCase()} data.`,
    });
  };

  return (
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
        direction={{ xs: "column", lg: "row" }}
        justifyContent="space-between"
        spacing={2}
        alignItems={{ lg: "flex-start" }}
        sx={{ mb: 2.5 }}
      >
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 750 }}>
            {title}
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 0.75, maxWidth: 720 }}>
            {description}
          </Typography>
        </Box>

        <Stack
          direction="row"
          spacing={1}
          useFlexGap
          flexWrap="wrap"
          justifyContent={{ xs: "flex-start", lg: "flex-end" }}
          sx={{ width: { xs: "100%", lg: "auto" }, maxWidth: 420 }}
        >
          <Button
            variant="contained"
            startIcon={<AddRoundedIcon />}
            onClick={() => navigate(`${basePath}/add`)}
            sx={{
              minWidth: 152,
              px: 2,
              py: 1.1,
              whiteSpace: "nowrap",
            }}
          >
            Add {entityLabel}
          </Button>
          <Button
            variant="outlined"
            startIcon={<UploadFileRoundedIcon />}
            onClick={() => fileInputRef.current?.click()}
            sx={{
              minWidth: 148,
              px: 2,
              py: 1.1,
              whiteSpace: "nowrap",
            }}
          >
            Import Excel
          </Button>
          <Button
            variant="text"
            startIcon={<RestartAltRoundedIcon />}
            onClick={handleReset}
            sx={{
              minWidth: 140,
              px: 1.5,
              py: 1.1,
              whiteSpace: "nowrap",
            }}
          >
            Reset Sample
          </Button>
          <input
            hidden
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleImport}
          />
        </Stack>
      </Stack>

      {feedback && (
        <Alert severity={feedback.severity} sx={{ mb: 2 }} onClose={() => setFeedback(null)}>
          {feedback.message}
        </Alert>
      )}

      <Box sx={{ width: "100%", overflowX: "auto" }}>
        <Box sx={{ height: 560, width: "max-content", minWidth: "100%" }}>
          <DataGrid
            rows={rows}
            columns={columns}
            loading={loading}
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
  );
}
