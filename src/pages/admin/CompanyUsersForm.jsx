import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Alert,
  Box,
  Button,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import Layout from "../../layouts/commonLayout/Layout";
import { fetchCompanies } from "../../store/companySlice";
import {
  clearUserCreateState,
  clearUserDetailState,
  clearUserUpdateState,
  createUser,
  fetchUserById,
  updateUser,
} from "../../store/userSlice";
import { getSurfaceBackground } from "../../theme";

const emptyForm = {
  emp_id: "",
  full_name: "",
  department: "",
  location: "",
  gender: "",
  phone: "",
  email: "",
  company_id: "",
};

export default function CompanyUsersForm({ mode }) {
  const theme = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const {
    selectedUser,
    detailLoading,
    detailError,
    createLoading,
    createError,
    updateLoading,
    updateError,
  } = useSelector((state) => state.user);
  const { companies, companiesLoading } = useSelector((state) => state.company);
  const [form, setForm] = useState(mode === "edit" ? {} : emptyForm);
  const [formError, setFormError] = useState("");

  const pageTitle = useMemo(
    () => (mode === "edit" ? "Edit User" : "Add User"),
    [mode],
  );

  useEffect(() => {
    dispatch(fetchCompanies());

    if (mode === "edit" && id) {
      dispatch(fetchUserById(id));
    }

    return () => {
      dispatch(clearUserCreateState());
      dispatch(clearUserUpdateState());
      dispatch(clearUserDetailState());
    };
  }, [dispatch, id, mode]);

  const resolvedForm = useMemo(() => {
    if (mode !== "edit") {
      return form;
    }

    return {
      emp_id: selectedUser?.emp_id || "",
      full_name: selectedUser?.full_name || "",
      department: selectedUser?.department || "",
      location: selectedUser?.location || "",
      gender: selectedUser?.gender || "",
      phone: selectedUser?.phone || "",
      email: selectedUser?.email || "",
      company_id: selectedUser?.company_id || "",
      ...form,
    };
  }, [form, mode, selectedUser]);

  const validate = () => {
    if (
      !resolvedForm.emp_id.trim() ||
      !resolvedForm.full_name.trim() ||
      !resolvedForm.department.trim() ||
      !resolvedForm.location.trim() ||
      !resolvedForm.gender.trim() ||
      !resolvedForm.phone.trim() ||
      !resolvedForm.email.trim() ||
      !resolvedForm.company_id
    ) {
      return "Complete all required user fields.";
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

    const payload = {
      emp_id: resolvedForm.emp_id.trim(),
      full_name: resolvedForm.full_name.trim(),
      department: resolvedForm.department.trim(),
      location: resolvedForm.location.trim(),
      gender: resolvedForm.gender.trim(),
      phone: resolvedForm.phone.trim(),
      email: resolvedForm.email.trim(),
      company_id: resolvedForm.company_id,
    };

    try {
      if (mode === "edit") {
        await dispatch(updateUser({ userId: id, user: payload })).unwrap();
      } else {
        await dispatch(createUser(payload)).unwrap();
      }

      navigate("/admin/company-users", {
        replace: true,
        state: {
          feedback: {
            severity: "success",
            message: `User ${mode === "edit" ? "updated" : "created"} successfully.`,
          },
        },
      });
    } catch {
      // Redux state already stores the error.
    }
  };

  if (mode === "edit" && detailLoading) {
    return (
      <Layout role="admin" title={pageTitle}>
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
          <Typography>Loading user...</Typography>
        </Paper>
      </Layout>
    );
  }

  return (
    <Layout role="admin" title={pageTitle}>
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
                ? "Update the employee details below."
                : "Create a new company user record."}
            </Typography>
          </Box>
          <Button
            startIcon={<ArrowBackRoundedIcon />}
            onClick={() => navigate("/admin/company-users")}
          >
            Back to list
          </Button>
        </Stack>

        {(formError || detailError || createError || updateError) && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {formError || detailError || createError || updateError}
          </Alert>
        )}

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, minmax(0, 1fr))",
            },
            gap: 2,
          }}
        >
          <TextField
            label="Employee ID"
            value={resolvedForm.emp_id}
            onChange={(event) =>
              setForm((current) => ({ ...current, emp_id: event.target.value }))
            }
            fullWidth
          />
          <TextField
            label="Full Name"
            value={resolvedForm.full_name}
            onChange={(event) =>
              setForm((current) => ({ ...current, full_name: event.target.value }))
            }
            fullWidth
          />
          <TextField
            label="Department"
            value={resolvedForm.department}
            onChange={(event) =>
              setForm((current) => ({ ...current, department: event.target.value }))
            }
            fullWidth
          />
          <TextField
            label="Location"
            value={resolvedForm.location}
            onChange={(event) =>
              setForm((current) => ({ ...current, location: event.target.value }))
            }
            fullWidth
          />
          <TextField
            label="Gender"
            value={resolvedForm.gender}
            onChange={(event) =>
              setForm((current) => ({ ...current, gender: event.target.value }))
            }
            select
            fullWidth
          >
            <MenuItem value="">Select Gender</MenuItem>
            {["male", "female", "other"].map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Phone"
            value={resolvedForm.phone}
            onChange={(event) =>
              setForm((current) => ({ ...current, phone: event.target.value }))
            }
            fullWidth
          />
          <TextField
            label="Email"
            value={resolvedForm.email}
            onChange={(event) =>
              setForm((current) => ({ ...current, email: event.target.value }))
            }
            fullWidth
          />
          <TextField
            label="Company"
            value={resolvedForm.company_id}
            onChange={(event) =>
              setForm((current) => ({ ...current, company_id: event.target.value }))
            }
            select
            fullWidth
            disabled={companiesLoading}
          >
            <MenuItem value="">Select Company</MenuItem>
            {companies.map((company) => (
              <MenuItem key={company.id} value={company.id}>
                {company.company_name}
              </MenuItem>
            ))}
          </TextField>
        </Box>

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
                ? "Update User"
                : "Create User"}
          </Button>
          <Button variant="outlined" onClick={() => navigate("/admin/company-users")}>
            Cancel
          </Button>
        </Stack>
      </Paper>
    </Layout>
  );
}
