import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api, { getApiErrorMessage } from "../services/api";

const DASHBOARD_KPI_PATH = "/config/api/v1/dashboard/kpis";

const initialState = {
  items: [],
  loading: false,
  error: "",
};

export const fetchDashboardKpis = createAsyncThunk(
  "dashboard/fetchDashboardKpis",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get(DASHBOARD_KPI_PATH);
      const payload = response?.data || {};

      if (!payload?.success) {
        return rejectWithValue(payload?.message || "Failed to fetch dashboard KPIs.");
      }

      return Array.isArray(payload?.data?.items) ? payload.data.items : [];
    } catch (error) {
      return rejectWithValue(
        getApiErrorMessage(error, "Failed to fetch dashboard KPIs due to server/network error."),
      );
    }
  },
);

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {
    clearDashboardError(state) {
      state.error = "";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardKpis.pending, (state) => {
        state.loading = true;
        state.error = "";
      })
      .addCase(fetchDashboardKpis.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchDashboardKpis.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch dashboard KPIs.";
      });
  },
});

export const { clearDashboardError } = dashboardSlice.actions;

export default dashboardSlice.reducer;
