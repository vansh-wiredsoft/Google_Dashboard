import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Alert,
  Box,
  Button,
  FormControlLabel,
  MenuItem,
  Paper,
  Stack,
  Switch,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import Layout from "../../layouts/commonLayout/Layout";
import {
  clearCompanyCreateState,
  clearCompanyDetailState,
  clearCompanyUpdateState,
  createCompany,
  fetchCompanyById,
  updateCompany,
} from "../../store/companySlice";
import { getSurfaceBackground } from "../../theme";

const createCompanyDefaults = {
  company_name: "",
  industry: "",
  size_bucket: "",
  email: "",
  phone: "",
  no_of_employees: 0,
  is_active: true,
};

const createAdminDefaults = {
  username: "",
  email: "",
  password: "",
  emp_id: "",
  full_name: "",
  department: "",
  location: "",
  gender: "",
  phone: "",
  is_active: true,
};

export default function CompanyDataForm({ mode }) {
  const theme = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const {
    selectedCompany,
    detailLoading,
    detailError,
    createLoading,
    createError,
    updateLoading,
    updateError,
  } = useSelector((state) => state.company);
  const [companyForm, setCompanyForm] = useState(createCompanyDefaults);
  const [adminForm, setAdminForm] = useState(createAdminDefaults);
  const [formError, setFormError] = useState("");

  const pageTitle = useMemo(
    () => (mode === "edit" ? "Edit Company" : "Add Company"),
    [mode],
  );

  useEffect(() => {
    if (mode === "edit" && id) {
      dispatch(fetchCompanyById(id));
    }

    return () => {
      dispatch(clearCompanyCreateState());
      dispatch(clearCompanyUpdateState());
      dispatch(clearCompanyDetailState());
    };
  }, [dispatch, id, mode]);

  useEffect(() => {
    if (mode === "edit" && selectedCompany) {
      setCompanyForm({
        company_name: selectedCompany.company_name || "",
        industry: selectedCompany.industry || "",
        size_bucket: selectedCompany.size_bucket || "",
        email: selectedCompany.email || "",
        phone: selectedCompany.phone || "",
        no_of_employees: selectedCompany.no_of_employees ?? 0,
        is_active: Boolean(selectedCompany.is_active),
      });
    }
  }, [mode, selectedCompany]);

  const validate = () => {
    if (
      !companyForm.company_name.trim() ||
      !companyForm.industry.trim() ||
      !companyForm.size_bucket ||
      !companyForm.email.trim() ||
      !companyForm.phone.trim()
    ) {
      return "Complete all required company fields.";
    }

    if (mode === "add") {
      if (
        !adminForm.username.trim() ||
        !adminForm.email.trim() ||
        !adminForm.password.trim() ||
        !adminForm.emp_id.trim() ||
        !adminForm.full_name.trim()
      ) {
        return "Complete the required admin fields for company creation.";
      }
    }

    return "";
  };

  const handleSave = async () => {
    const nextError = validate();
    if (nextError) {
      setFormError(nextError);
      return;
    }

    setFormError("");

    try {
      if (mode === "edit") {
        await dispatch(
          updateCompany({
            companyId: id,
            company: {
              company_name: companyForm.company_name.trim(),
              industry: companyForm.industry.trim(),
              size_bucket: companyForm.size_bucket,
              email: companyForm.email.trim(),
              phone: companyForm.phone.trim(),
              no_of_employees: Number(companyForm.no_of_employees) || 0,
              is_active: companyForm.is_active,
            },
          }),
        ).unwrap();

        navigate("/super-admin/company-data", {
          replace: true,
          state: {
            feedback: {
              severity: "success",
              message: "Company updated successfully.",
            },
          },
        });
        return;
      }

      await dispatch(
        createCompany({
          company: {
            company_name: companyForm.company_name.trim(),
            industry: companyForm.industry.trim(),
            size_bucket: companyForm.size_bucket,
            email: companyForm.email.trim(),
            phone: companyForm.phone.trim(),
            no_of_employees: Number(companyForm.no_of_employees) || 0,
          },
          admin: {
            username: adminForm.username.trim(),
            email: adminForm.email.trim(),
            password: adminForm.password,
            emp_id: adminForm.emp_id.trim(),
            full_name: adminForm.full_name.trim(),
            department: adminForm.department.trim(),
            location: adminForm.location.trim(),
            gender: adminForm.gender.trim(),
            phone: adminForm.phone.trim(),
            is_active: adminForm.is_active,
          },
        }),
      ).unwrap();

      navigate("/super-admin/company-data", {
        replace: true,
        state: {
          feedback: {
            severity: "success",
            message: "Company and admin created successfully.",
          },
        },
      });
    } catch {
      // Redux state already stores the API error.
    }
  };

  if (mode === "edit" && detailLoading) {
    return (
      <Layout role="superadmin" title={pageTitle}>
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
          <Typography>Loading company...</Typography>
        </Paper>
      </Layout>
    );
  }

  return (
    <Layout role="superadmin" title={pageTitle}>
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
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          spacing={2}
          sx={{ mb: 3 }}
        >
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 750 }}>
              {pageTitle}
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 0.75 }}>
              {mode === "edit"
                ? "Update the company profile and activation state."
                : "Create a company and assign its first admin in one request."}
            </Typography>
          </Box>
          <Button
            startIcon={<ArrowBackRoundedIcon />}
            onClick={() => navigate("/super-admin/company-data")}
          >
            Back to list
          </Button>
        </Stack>

        {(formError || detailError || createError || updateError) && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {formError || detailError || createError || updateError}
          </Alert>
        )}

        <Stack spacing={3}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
              Company Details
            </Typography>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" },
                gap: 2,
              }}
            >
              <TextField
                label="Company Name"
                value={companyForm.company_name}
                onChange={(event) =>
                  setCompanyForm((current) => ({
                    ...current,
                    company_name: event.target.value,
                  }))
                }
                fullWidth
              />
              <TextField
                label="Industry"
                value={companyForm.industry}
                onChange={(event) =>
                  setCompanyForm((current) => ({
                    ...current,
                    industry: event.target.value,
                  }))
                }
                fullWidth
              />
              <TextField
                label="Size Bucket"
                value={companyForm.size_bucket}
                onChange={(event) =>
                  setCompanyForm((current) => ({
                    ...current,
                    size_bucket: event.target.value,
                  }))
                }
                select
                fullWidth
              >
                <MenuItem value="">Select Size Bucket</MenuItem>
                {["small", "medium", "large", "enterprise"].map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label="Company Email"
                value={companyForm.email}
                onChange={(event) =>
                  setCompanyForm((current) => ({
                    ...current,
                    email: event.target.value,
                  }))
                }
                fullWidth
              />
              <TextField
                label="Phone"
                value={companyForm.phone}
                onChange={(event) =>
                  setCompanyForm((current) => ({
                    ...current,
                    phone: event.target.value,
                  }))
                }
                fullWidth
              />
              <TextField
                label="No. of Employees"
                type="number"
                value={companyForm.no_of_employees}
                onChange={(event) =>
                  setCompanyForm((current) => ({
                    ...current,
                    no_of_employees: event.target.value,
                  }))
                }
                fullWidth
              />
            </Box>

            {mode === "edit" && (
              <FormControlLabel
                sx={{ mt: 2 }}
                control={
                  <Switch
                    checked={companyForm.is_active}
                    onChange={(event) =>
                      setCompanyForm((current) => ({
                        ...current,
                        is_active: event.target.checked,
                      }))
                    }
                  />
                }
                label="Company is active"
              />
            )}
          </Box>

          {mode === "add" && (
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                Initial Company Admin
              </Typography>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" },
                  gap: 2,
                }}
              >
                <TextField
                  label="Username"
                  value={adminForm.username}
                  onChange={(event) =>
                    setAdminForm((current) => ({
                      ...current,
                      username: event.target.value,
                    }))
                  }
                  fullWidth
                />
                <TextField
                  label="Admin Email"
                  value={adminForm.email}
                  onChange={(event) =>
                    setAdminForm((current) => ({
                      ...current,
                      email: event.target.value,
                    }))
                  }
                  fullWidth
                />
                <TextField
                  label="Password"
                  type="password"
                  value={adminForm.password}
                  onChange={(event) =>
                    setAdminForm((current) => ({
                      ...current,
                      password: event.target.value,
                    }))
                  }
                  fullWidth
                />
                <TextField
                  label="Employee ID"
                  value={adminForm.emp_id}
                  onChange={(event) =>
                    setAdminForm((current) => ({
                      ...current,
                      emp_id: event.target.value,
                    }))
                  }
                  fullWidth
                />
                <TextField
                  label="Full Name"
                  value={adminForm.full_name}
                  onChange={(event) =>
                    setAdminForm((current) => ({
                      ...current,
                      full_name: event.target.value,
                    }))
                  }
                  fullWidth
                />
                <TextField
                  label="Department"
                  value={adminForm.department}
                  onChange={(event) =>
                    setAdminForm((current) => ({
                      ...current,
                      department: event.target.value,
                    }))
                  }
                  fullWidth
                />
                <TextField
                  label="Location"
                  value={adminForm.location}
                  onChange={(event) =>
                    setAdminForm((current) => ({
                      ...current,
                      location: event.target.value,
                    }))
                  }
                  fullWidth
                />
                <TextField
                  label="Gender"
                  value={adminForm.gender}
                  onChange={(event) =>
                    setAdminForm((current) => ({
                      ...current,
                      gender: event.target.value,
                    }))
                  }
                  fullWidth
                />
                <TextField
                  label="Phone"
                  value={adminForm.phone}
                  onChange={(event) =>
                    setAdminForm((current) => ({
                      ...current,
                      phone: event.target.value,
                    }))
                  }
                  fullWidth
                />
              </Box>
            </Box>
          )}
        </Stack>

        <Stack direction="row" spacing={1.25} sx={{ mt: 3 }}>
          <Button
            variant="contained"
            startIcon={<SaveRoundedIcon />}
            onClick={handleSave}
            disabled={createLoading || updateLoading}
          >
            {createLoading || updateLoading
              ? "Saving..."
              : mode === "edit"
                ? "Update Company"
                : "Create Company"}
          </Button>
          <Button
            variant="outlined"
            onClick={() => navigate("/super-admin/company-data")}
          >
            Cancel
          </Button>
        </Stack>
      </Paper>
    </Layout>
  );
}
