import { useLocation } from "react-router-dom";
import { Alert, Stack } from "@mui/material";
import Layout from "../../layouts/commonLayout/Layout";
import EntityManagementTable from "../../components/shared/EntityManagementTable";
import { entityConfigs } from "../../data/adminEntityConfigs";
import {
  clearUserUploadError,
  resetUserUpload,
  uploadUserFile,
} from "../../store/userUploadSlice";

export default function CompanyUsers() {
  const location = useLocation();
  const feedback = location.state?.feedback;
  const config = entityConfigs.user;

  return (
    <Layout role="admin" title="Company User Data">
      <Stack spacing={2}>
        {feedback && <Alert severity={feedback.severity}>{feedback.message}</Alert>}
        <EntityManagementTable
          {...config}
          uploadSelector={(state) => state.userUpload}
          uploadThunk={uploadUserFile}
          resetUploadAction={resetUserUpload}
          clearUploadErrorAction={clearUserUploadError}
        />
      </Stack>
    </Layout>
  );
}
