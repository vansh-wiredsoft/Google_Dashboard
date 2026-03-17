import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api, { getApiErrorMessage } from "../services/api";

const COMPANY_PATH = "/config/api/v1/companies";
const COMPANY_UPLOAD_PATH = "/config/api/v1/companies/upload";

const initialState = {
  companies: [],
  companiesLoading: false,
  error: "",
  message: "",
  uploadLoading: false,
  uploadStatus: null,
  uploadError: "",
  uploadResponseData: null,
};

const pickArray = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.results)) return payload.results;
  return [];
};

export const fetchCompanies = createAsyncThunk(
  "company/fetchCompanies",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get(COMPANY_PATH);
      const payload = response?.data || {};

      if (!payload?.success) {
        return rejectWithValue(payload?.message || "Failed to fetch companies.");
      }

      const normalized = pickArray(payload).map((item, index) => ({
        id: String(item?.id || item?.company_id || index),
        company_name:
          item?.company_name || item?.name || item?.title || "Unnamed Company",
        industry: item?.industry || "",
        size_bucket: item?.size_bucket || "",
        email: item?.email || "",
        phone: String(item?.phone ?? ""),
        no_of_employees: item?.no_of_employees ?? "",
        is_active: item?.is_active ?? false,
        created_at: item?.created_at || "",
        updated_at: item?.updated_at || "",
      }));

      return {
        companies: normalized,
        message: payload?.message || "Companies fetched successfully.",
      };
    } catch (error) {
      return rejectWithValue(
        getApiErrorMessage(
          error,
          "Failed to fetch companies due to server/network error.",
        ),
      );
    }
  },
);

export const uploadCompanyFile = createAsyncThunk(
  "company/uploadCompanyFile",
  async (file, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await api.post(COMPANY_UPLOAD_PATH, formData);

      const payload = response?.data || {};
      if (!payload?.success) {
        return rejectWithValue(payload?.message || "Upload failed.");
      }

      return payload?.data || null;
    } catch (error) {
      return rejectWithValue(
        getApiErrorMessage(error, "Upload failed due to server/network error."),
      );
    }
  },
);

const companySlice = createSlice({
  name: "company",
  initialState,
  reducers: {
    clearCompanyError(state) {
      state.error = "";
    },
    resetCompanyUpload(state) {
      state.uploadLoading = false;
      state.uploadStatus = null;
      state.uploadError = "";
      state.uploadResponseData = null;
    },
    clearCompanyUploadError(state) {
      state.uploadError = "";
      if (state.uploadStatus === "error") {
        state.uploadStatus = null;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCompanies.pending, (state) => {
        state.companiesLoading = true;
        state.error = "";
      })
      .addCase(fetchCompanies.fulfilled, (state, action) => {
        state.companiesLoading = false;
        state.companies = action.payload.companies;
        state.message = action.payload.message;
      })
      .addCase(fetchCompanies.rejected, (state, action) => {
        state.companiesLoading = false;
        state.error = action.payload || "Failed to fetch companies.";
      })
      .addCase(uploadCompanyFile.pending, (state) => {
        state.uploadLoading = true;
        state.uploadStatus = null;
        state.uploadError = "";
        state.uploadResponseData = null;
      })
      .addCase(uploadCompanyFile.fulfilled, (state, action) => {
        state.uploadLoading = false;
        state.uploadStatus = "success";
        state.uploadResponseData = action.payload;
      })
      .addCase(uploadCompanyFile.rejected, (state, action) => {
        state.uploadLoading = false;
        state.uploadStatus = "error";
        state.uploadError = action.payload || "Upload failed.";
      });
  },
});

export const {
  clearCompanyError,
  resetCompanyUpload,
  clearCompanyUploadError,
} = companySlice.actions;
export default companySlice.reducer;
