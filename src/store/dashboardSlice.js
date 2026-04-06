import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api, { getApiErrorMessage } from "../services/api";
import { API_URLS } from "../services/apiUrls";

const initialState = {
  items: [],
  loading: false,
  error: "",
  actionLoadingById: {},
  actionErrorById: {},
  actionResultById: {},
};

export const fetchDashboardKpis = createAsyncThunk(
  "dashboard/fetchDashboardKpis",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get(API_URLS.dashboardKpis);
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

export const postDashboardChallengeAction = createAsyncThunk(
  "dashboard/postDashboardChallengeAction",
  async (payload, { rejectWithValue }) => {
    try {
      const response = await api.post(API_URLS.dashboardChallengeAction, payload);
      const responsePayload = response?.data || {};

      if (!responsePayload?.success) {
        return rejectWithValue({
          challengeId: payload.challenge_id,
          message: responsePayload?.message || "Failed to submit challenge action.",
        });
      }

      return {
        challengeId: payload.challenge_id,
        payload: responsePayload?.data || {},
      };
    } catch (error) {
      return rejectWithValue({
        challengeId: payload.challenge_id,
        message: getApiErrorMessage(
          error,
          "Failed to submit challenge action due to server/network error.",
        ),
      });
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
    clearDashboardChallengeActionError(state, action) {
      if (action.payload) {
        delete state.actionErrorById[action.payload];
        return;
      }

      state.actionErrorById = {};
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
      })
      .addCase(postDashboardChallengeAction.pending, (state, action) => {
        const challengeId = action.meta.arg?.challenge_id;
        if (!challengeId) return;

        state.actionLoadingById[challengeId] = true;
        delete state.actionErrorById[challengeId];
      })
      .addCase(postDashboardChallengeAction.fulfilled, (state, action) => {
        const { challengeId, payload } = action.payload;
        state.actionLoadingById[challengeId] = false;
        state.actionResultById[challengeId] = payload;
      })
      .addCase(postDashboardChallengeAction.rejected, (state, action) => {
        const challengeId = action.payload?.challengeId || action.meta.arg?.challenge_id;
        if (!challengeId) return;

        state.actionLoadingById[challengeId] = false;
        state.actionErrorById[challengeId] =
          action.payload?.message || "Failed to submit challenge action.";
      });
  },
});

export const { clearDashboardError, clearDashboardChallengeActionError } =
  dashboardSlice.actions;

export default dashboardSlice.reducer;
