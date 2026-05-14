import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api, { getApiErrorMessage } from "../services/api";
import { API_URLS } from "../services/apiUrls";

const initialState = {
  items: [],
  loadedCompanyId: "",
  listLoading: false,
  listError: "",
};

const pickList = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.results)) return payload.results;
  return [];
};

const normalizeDepartment = (item, index = 0) => ({
  id: String(item?.id ?? index),
  name: item?.name || "",
  description: item?.description || "",
  company_id: item?.company_id || "",
  is_active: item?.is_active ?? true,
});

export const fetchDepartments = createAsyncThunk(
  "department/fetchDepartments",
  async (arg = "", { rejectWithValue }) => {
    // Back-compat: accept either a bare companyId string or an options object.
    const { companyId, isActive } =
      typeof arg === "object" && arg !== null
        ? arg
        : { companyId: arg, isActive: true };

    try {
      const params = {};
      if (companyId) params.company_id = companyId;
      if (typeof isActive === "boolean") params.is_active = isActive;

      const response = await api.get(API_URLS.departments, { params });
      const list = pickList(response?.data);
      return {
        companyId: companyId || "",
        items: list.map(normalizeDepartment),
      };
    } catch (error) {
      return rejectWithValue(
        getApiErrorMessage(
          error,
          "Failed to fetch departments due to server/network error.",
        ),
      );
    }
  },
);

const departmentSlice = createSlice({
  name: "department",
  initialState,
  reducers: {
    clearDepartmentListState(state) {
      state.listError = "";
    },
    resetDepartments(state) {
      state.items = [];
      state.loadedCompanyId = "";
      state.listError = "";
      state.listLoading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDepartments.pending, (state) => {
        state.listLoading = true;
        state.listError = "";
      })
      .addCase(fetchDepartments.fulfilled, (state, action) => {
        state.listLoading = false;
        state.items = action.payload.items;
        state.loadedCompanyId = action.payload.companyId;
      })
      .addCase(fetchDepartments.rejected, (state, action) => {
        state.listLoading = false;
        state.items = [];
        state.listError = action.payload || "Failed to fetch departments.";
      });
  },
});

export const { clearDepartmentListState, resetDepartments } =
  departmentSlice.actions;

export default departmentSlice.reducer;
