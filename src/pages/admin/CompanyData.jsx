import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Alert, Stack } from "@mui/material";
import Layout from "../../layouts/commonLayout/Layout";
import EntityManagementTable from "../../components/shared/EntityManagementTable";
import { entityConfigs } from "../../data/adminEntityConfigs";
import { clearCompanyError, fetchCompanies } from "../../store/companySlice";

export default function CompanyData() {
  const dispatch = useDispatch();
  const location = useLocation();
  const feedback = location.state?.feedback;
  const config = entityConfigs.company;
  const { companies, companiesLoading, error } = useSelector((state) => state.company);

  useEffect(() => {
    dispatch(fetchCompanies());
  }, [dispatch]);

  useEffect(() => {
    return () => {
      dispatch(clearCompanyError());
    };
  }, [dispatch]);

  return (
    <Layout role="admin" title="Company Data">
      <Stack spacing={2}>
        {feedback && <Alert severity={feedback.severity}>{feedback.message}</Alert>}
        {error && <Alert severity="error">{error}</Alert>}
        <EntityManagementTable
          {...config}
          rows={companies}
          loading={companiesLoading}
        />
      </Stack>
    </Layout>
  );
}
