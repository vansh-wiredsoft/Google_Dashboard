import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api, { getApiErrorMessage } from "../services/api";

const ADMIN_SUGGESTION_PATH = "/config/api/v1/admin-suggestions";

const initialState = {
  items: [],
  selectedSuggestion: null,
  listLoading: false,
  detailLoading: false,
  createLoading: false,
  updateLoading: false,
  deleteLoading: false,
  listError: "",
  detailError: "",
  createError: "",
  updateError: "",
  deleteError: "",
  createMessage: "",
  updateMessage: "",
  deleteMessage: "",
};

const pickArray = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.results)) return payload.results;
  if (Array.isArray(payload?.data?.items)) return payload.data.items;
  return [];
};

const normalizeSuggestion = (item, index = 0) => ({
  id: String(item?.id || item?.suggestion_id || index),
  suggestion_type: item?.suggestion_type || "",
  title: item?.title || "",
  description: item?.description || "",
  url: item?.url || "",
  dosha_type: item?.dosha_type || "all",
  difficulty: item?.difficulty || "easy",
  duration_mins:
    item?.duration_mins === null || item?.duration_mins === undefined
      ? ""
      : Number(item.duration_mins),
  is_active: item?.is_active ?? true,
  created_at: item?.created_at || "",
  updated_at: item?.updated_at || "",
});

export const fetchAdminSuggestions = createAsyncThunk(
  "adminSuggestion/fetchAdminSuggestions",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get(ADMIN_SUGGESTION_PATH);
      const payload = response?.data || {};

      if (!payload?.success) {
        return rejectWithValue(
          payload?.message || "Failed to fetch admin suggestions.",
        );
      }

      return pickArray(payload).map(normalizeSuggestion);
    } catch (error) {
      return rejectWithValue(
        getApiErrorMessage(
          error,
          "Failed to fetch admin suggestions due to server/network error.",
        ),
      );
    }
  },
);

export const fetchAdminSuggestionById = createAsyncThunk(
  "adminSuggestion/fetchAdminSuggestionById",
  async (suggestionId, { rejectWithValue }) => {
    try {
      const response = await api.get(`${ADMIN_SUGGESTION_PATH}/${suggestionId}`);
      const payload = response?.data || {};

      if (!payload?.success || !payload?.data) {
        return rejectWithValue(
          payload?.message || "Failed to fetch admin suggestion.",
        );
      }

      return normalizeSuggestion(payload.data);
    } catch (error) {
      return rejectWithValue(
        getApiErrorMessage(
          error,
          "Failed to fetch admin suggestion due to server/network error.",
        ),
      );
    }
  },
);

export const createAdminSuggestion = createAsyncThunk(
  "adminSuggestion/createAdminSuggestion",
  async (suggestion, { rejectWithValue }) => {
    try {
      const response = await api.post(ADMIN_SUGGESTION_PATH, suggestion);
      const payload = response?.data || {};

      if (!payload?.success || !payload?.data) {
        return rejectWithValue(
          payload?.message || "Failed to create admin suggestion.",
        );
      }

      return {
        item: normalizeSuggestion(payload.data),
        message: payload?.message || "Admin suggestion created successfully.",
      };
    } catch (error) {
      return rejectWithValue(
        getApiErrorMessage(
          error,
          "Failed to create admin suggestion due to server/network error.",
        ),
      );
    }
  },
);

export const updateAdminSuggestion = createAsyncThunk(
  "adminSuggestion/updateAdminSuggestion",
  async ({ suggestionId, suggestion }, { rejectWithValue }) => {
    try {
      const response = await api.put(
        `${ADMIN_SUGGESTION_PATH}/${suggestionId}`,
        suggestion,
      );
      const payload = response?.data || {};

      if (!payload?.success || !payload?.data) {
        return rejectWithValue(
          payload?.message || "Failed to update admin suggestion.",
        );
      }

      return {
        item: normalizeSuggestion(payload.data),
        message: payload?.message || "Admin suggestion updated successfully.",
      };
    } catch (error) {
      return rejectWithValue(
        getApiErrorMessage(
          error,
          "Failed to update admin suggestion due to server/network error.",
        ),
      );
    }
  },
);

export const deleteAdminSuggestion = createAsyncThunk(
  "adminSuggestion/deleteAdminSuggestion",
  async (suggestionId, { rejectWithValue }) => {
    try {
      const response = await api.delete(
        `${ADMIN_SUGGESTION_PATH}/${suggestionId}`,
      );
      const payload = response?.data || {};

      if (!payload?.success || !payload?.data) {
        return rejectWithValue(
          payload?.message || "Failed to delete admin suggestion.",
        );
      }

      return {
        item: normalizeSuggestion(payload.data),
        message: payload?.message || "Admin suggestion deleted successfully.",
      };
    } catch (error) {
      return rejectWithValue(
        getApiErrorMessage(
          error,
          "Failed to delete admin suggestion due to server/network error.",
        ),
      );
    }
  },
);

const adminSuggestionSlice = createSlice({
  name: "adminSuggestion",
  initialState,
  reducers: {
    clearAdminSuggestionListState(state) {
      state.listError = "";
      state.deleteError = "";
      state.deleteMessage = "";
    },
    clearAdminSuggestionDetailState(state) {
      state.selectedSuggestion = null;
      state.detailLoading = false;
      state.detailError = "";
    },
    clearAdminSuggestionCreateState(state) {
      state.createLoading = false;
      state.createError = "";
      state.createMessage = "";
    },
    clearAdminSuggestionUpdateState(state) {
      state.updateLoading = false;
      state.updateError = "";
      state.updateMessage = "";
    },
    clearAdminSuggestionDeleteState(state) {
      state.deleteLoading = false;
      state.deleteError = "";
      state.deleteMessage = "";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminSuggestions.pending, (state) => {
        state.listLoading = true;
        state.listError = "";
      })
      .addCase(fetchAdminSuggestions.fulfilled, (state, action) => {
        state.listLoading = false;
        state.items = action.payload;
      })
      .addCase(fetchAdminSuggestions.rejected, (state, action) => {
        state.listLoading = false;
        state.listError = action.payload || "Failed to fetch admin suggestions.";
      })
      .addCase(fetchAdminSuggestionById.pending, (state) => {
        state.detailLoading = true;
        state.detailError = "";
      })
      .addCase(fetchAdminSuggestionById.fulfilled, (state, action) => {
        state.detailLoading = false;
        state.selectedSuggestion = action.payload;
      })
      .addCase(fetchAdminSuggestionById.rejected, (state, action) => {
        state.detailLoading = false;
        state.detailError =
          action.payload || "Failed to fetch admin suggestion.";
      })
      .addCase(createAdminSuggestion.pending, (state) => {
        state.createLoading = true;
        state.createError = "";
        state.createMessage = "";
      })
      .addCase(createAdminSuggestion.fulfilled, (state, action) => {
        state.createLoading = false;
        state.createMessage = action.payload.message;
        state.items = [action.payload.item, ...state.items];
      })
      .addCase(createAdminSuggestion.rejected, (state, action) => {
        state.createLoading = false;
        state.createError =
          action.payload || "Failed to create admin suggestion.";
      })
      .addCase(updateAdminSuggestion.pending, (state) => {
        state.updateLoading = true;
        state.updateError = "";
        state.updateMessage = "";
      })
      .addCase(updateAdminSuggestion.fulfilled, (state, action) => {
        state.updateLoading = false;
        state.updateMessage = action.payload.message;
        state.selectedSuggestion = action.payload.item;
        state.items = state.items.map((item) =>
          item.id === action.payload.item.id ? action.payload.item : item,
        );
      })
      .addCase(updateAdminSuggestion.rejected, (state, action) => {
        state.updateLoading = false;
        state.updateError =
          action.payload || "Failed to update admin suggestion.";
      })
      .addCase(deleteAdminSuggestion.pending, (state) => {
        state.deleteLoading = true;
        state.deleteError = "";
        state.deleteMessage = "";
      })
      .addCase(deleteAdminSuggestion.fulfilled, (state, action) => {
        state.deleteLoading = false;
        state.deleteMessage = action.payload.message;
        state.items = state.items.filter(
          (item) => item.id !== action.payload.item.id,
        );
        if (state.selectedSuggestion?.id === action.payload.item.id) {
          state.selectedSuggestion = null;
        }
      })
      .addCase(deleteAdminSuggestion.rejected, (state, action) => {
        state.deleteLoading = false;
        state.deleteError =
          action.payload || "Failed to delete admin suggestion.";
      });
  },
});

export const {
  clearAdminSuggestionListState,
  clearAdminSuggestionDetailState,
  clearAdminSuggestionCreateState,
  clearAdminSuggestionUpdateState,
  clearAdminSuggestionDeleteState,
} = adminSuggestionSlice.actions;

export default adminSuggestionSlice.reducer;
