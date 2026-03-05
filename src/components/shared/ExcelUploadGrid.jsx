import { useMemo, useState } from "react";
import * as XLSX from "xlsx";
import { Box, Button, Paper, Stack, Typography } from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import { DataGrid } from "@mui/x-data-grid";

const getColumns = (rows) => {
  if (!rows.length) return [];
  return Object.keys(rows[0]).map((key) => ({
    field: key,
    headerName: key,
    flex: 1,
    minWidth: 130,
  }));
};

export default function ExcelUploadGrid({ title, description }) {
  const [rows, setRows] = useState([]);

  const columns = useMemo(() => getColumns(rows), [rows]);

  const handleUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

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
      >
        Upload Excel
        <input hidden type="file" accept=".xlsx,.xls,.csv" onChange={handleUpload} />
      </Button>

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
