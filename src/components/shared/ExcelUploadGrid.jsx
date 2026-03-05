import { useMemo, useState } from "react";
import * as XLSX from "xlsx";
import { Alert, Box, Button, Paper, Stack, Typography } from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import { DataGrid } from "@mui/x-data-grid";
import api from "../../services/api";

const getColumns = (rows) => {
  if (!rows.length) return [];
  return Object.keys(rows[0]).map((key) => ({
    field: key,
    headerName: key,
    flex: 1,
    minWidth: 130,
  }));
};

export default function ExcelUploadGrid({ title, description, uploadPath }) {
  const [rows, setRows] = useState([]);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [uploadError, setUploadError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [responseData, setResponseData] = useState(null);

  const columns = useMemo(() => getColumns(rows), [rows]);

  const handleUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadStatus(null);
    setUploadError("");
    setResponseData(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const parsed = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

      const normalized = parsed.map((item, index) => ({
        id: index + 1,
        ...item,
      }));
      setRows(normalized);
    };
    reader.readAsArrayBuffer(file);

    if (!uploadPath) return;

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("file", file);

      const response = await api.post(uploadPath, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const payload = response.data || {};
      setUploadStatus(payload.success ? "success" : "error");
      setResponseData(payload.data || null);
      if (!payload.success) {
        setUploadError(payload.message || "Upload failed.");
      }
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.detail ||
        "Upload failed due to server/network error.";
      setUploadStatus("error");
      setUploadError(message);
    } finally {
      setUploading(false);
    }
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
      <Stack spacing={1.5} sx={{ mb: 2.5 }}>
        <Typography variant="h5" sx={{ fontWeight: 750 }}>
          {title}
        </Typography>
        <Typography color="text.secondary">{description}</Typography>
      </Stack>

      <Button
        variant="contained"
        component="label"
        startIcon={<UploadFileIcon />}
        sx={{ mb: 2 }}
        disabled={uploading}
      >
        {uploading ? "Uploading..." : "Upload Excel"}
        <input hidden type="file" accept=".xlsx,.xls,.csv" onChange={handleUpload} />
      </Button>

      {uploadStatus === "success" && (
        <Alert severity="success" sx={{ mb: 2 }}>
          File uploaded successfully.
        </Alert>
      )}
      {uploadStatus === "error" && !!uploadError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {uploadError}
        </Alert>
      )}

      {!!responseData && (
        <Paper variant="outlined" sx={{ mb: 2, p: 1.5, borderRadius: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 0.8 }}>
            Upload Summary
          </Typography>
          <Typography variant="body2" sx={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
            {JSON.stringify(responseData, null, 2)}
          </Typography>
        </Paper>
      )}

      <Box sx={{ height: 470, width: "100%" }}>
        <DataGrid
          rows={rows}
          columns={columns}
          disableRowSelectionOnClick
          pageSizeOptions={[10, 25, 50]}
          initialState={{
            pagination: {
              paginationModel: { pageSize: 10, page: 0 },
            },
          }}
        />
      </Box>
    </Paper>
  );
}
