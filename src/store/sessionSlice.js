import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../services/api";

const SESSION_PATH = "/config/api/v1/sessions";

const initialState = {
  createdSession: null,
  addedQuestions: [],
  sessions: [],
  sessionDetails: null,
  sessionPreview: null,
  createLoading: false,
  addLoading: false,
  listLoading: false,
  detailLoading: false,
  previewLoading: false,
  publishLoading: false,
  createMessage: "",
  addMessage: "",
  listMessage: "",
  detailMessage: "",
  previewMessage: "",
  publishMessage: "",
  error: null,
  listError: null,
  detailError: null,
  previewError: null,
  publishError: null,
};

export const createSession = createAsyncThunk(
  "session/createSession",
  async ({ title, description, companyId }, { rejectWithValue }) => {
    try {
      const response = await api.post(SESSION_PATH, {
        title,
        description,
        company_id: String(companyId),
      });

      const payload = response?.data || {};
      if (!payload?.success || !payload?.data?.id) {
        return rejectWithValue(payload?.message || "Session creation failed.");
      }

      return {
        session: payload.data,
        message: payload.message || "Session created successfully.",
      };
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.detail ||
        "Session creation failed due to server/network error.";
      return rejectWithValue(message);
    }
  },
);

export const addQuestionsToSession = createAsyncThunk(
  "session/addQuestionsToSession",
  async ({ sessionId, questionIds }, { rejectWithValue }) => {
    try {
      const response = await api.post(`${SESSION_PATH}/${sessionId}/questions`, {
        question_ids: questionIds,
      });

      const payload = response?.data || {};
      if (!payload?.success) {
        return rejectWithValue(payload?.message || "Failed to add questions.");
      }

      return {
        addedQuestions: Array.isArray(payload?.data) ? payload.data : [],
        message: payload?.message || "Questions added to session successfully.",
      };
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.detail ||
        "Failed to add questions due to server/network error.";
      return rejectWithValue(message);
    }
  },
);

export const fetchSessions = createAsyncThunk(
  "session/fetchSessions",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get(SESSION_PATH);
      const payload = response?.data || {};

      if (!payload?.success) {
        return rejectWithValue(payload?.message || "Failed to fetch sessions.");
      }

      return {
        sessions: Array.isArray(payload?.data) ? payload.data : [],
        message: payload?.message || "Sessions fetched successfully.",
      };
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.detail ||
        "Failed to fetch sessions due to server/network error.";
      return rejectWithValue(message);
    }
  },
);

export const fetchSessionById = createAsyncThunk(
  "session/fetchSessionById",
  async (sessionId, { rejectWithValue }) => {
    try {
      const response = await api.get(`${SESSION_PATH}/${sessionId}`);
      const payload = response?.data || {};

      if (!payload?.success || !payload?.data) {
        return rejectWithValue(
          payload?.message || "Failed to fetch session details.",
        );
      }

      return {
        sessionDetails: payload.data,
        message: payload?.message || "Session details fetched successfully.",
      };
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.detail ||
        "Failed to fetch session details due to server/network error.";
      return rejectWithValue(message);
    }
  },
);

export const fetchSessionPreview = createAsyncThunk(
  "session/fetchSessionPreview",
  async (sessionId, { rejectWithValue }) => {
    try {
      const response = await api.get(`${SESSION_PATH}/${sessionId}/form/preview`);
      const payload = response?.data || {};

      if (!payload?.success || !payload?.data) {
        return rejectWithValue(
          payload?.message || "Failed to fetch session preview.",
        );
      }

      return {
        sessionPreview: payload.data,
        message: payload?.message || "Session preview fetched successfully.",
      };
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.detail?.message ||
        error?.response?.data?.detail ||
        "Failed to fetch session preview due to server/network error.";
      return rejectWithValue(message);
    }
  },
);

export const publishSession = createAsyncThunk(
  "session/publishSession",
  async (sessionId, { rejectWithValue }) => {
    try {
      const response = await api.post(`${SESSION_PATH}/${sessionId}/publish`);
      const payload = response?.data || {};

      if (!payload?.success || !payload?.data) {
        return rejectWithValue(payload?.message || "Failed to publish session.");
      }

      return {
        sessionPreview: payload.data,
        message: payload?.message || "Session form published successfully.",
      };
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.detail?.message ||
        error?.response?.data?.detail ||
        "Failed to publish session due to server/network error.";
      return rejectWithValue(message);
    }
  },
);

const sessionSlice = createSlice({
  name: "session",
  initialState,
  reducers: {
    clearSessionError(state) {
      state.error = null;
    },
    clearSessionListError(state) {
      state.listError = null;
    },
    clearSessionDetailError(state) {
      state.detailError = null;
    },
    clearSessionDetails(state) {
      state.sessionDetails = null;
      state.detailMessage = "";
      state.detailError = null;
      state.detailLoading = false;
    },
    clearSessionPreview(state) {
      state.sessionPreview = null;
      state.previewMessage = "";
      state.publishMessage = "";
      state.previewError = null;
      state.publishError = null;
      state.previewLoading = false;
      state.publishLoading = false;
    },
    clearSessionMessages(state) {
      state.createMessage = "";
      state.addMessage = "";
    },
    resetSessionFlow(state) {
      state.createdSession = null;
      state.addedQuestions = [];
      state.createLoading = false;
      state.addLoading = false;
      state.createMessage = "";
      state.addMessage = "";
      state.previewMessage = "";
      state.publishMessage = "";
      state.error = null;
      state.previewError = null;
      state.publishError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createSession.pending, (state) => {
        state.createLoading = true;
        state.error = null;
        state.createMessage = "";
      })
      .addCase(createSession.fulfilled, (state, action) => {
        state.createLoading = false;
        state.createdSession = action.payload.session;
        state.addedQuestions = [];
        state.createMessage = action.payload.message;
      })
      .addCase(createSession.rejected, (state, action) => {
        state.createLoading = false;
        state.error = action.payload || "Session creation failed.";
      })
      .addCase(addQuestionsToSession.pending, (state) => {
        state.addLoading = true;
        state.error = null;
        state.addMessage = "";
      })
      .addCase(addQuestionsToSession.fulfilled, (state, action) => {
        state.addLoading = false;
        state.addedQuestions = action.payload.addedQuestions;
        state.addMessage = action.payload.message;
      })
      .addCase(addQuestionsToSession.rejected, (state, action) => {
        state.addLoading = false;
        state.error = action.payload || "Failed to add questions.";
      })
      .addCase(fetchSessions.pending, (state) => {
        state.listLoading = true;
        state.listError = null;
      })
      .addCase(fetchSessions.fulfilled, (state, action) => {
        state.listLoading = false;
        state.sessions = action.payload.sessions;
        state.listMessage = action.payload.message;
      })
      .addCase(fetchSessions.rejected, (state, action) => {
        state.listLoading = false;
        state.listError = action.payload || "Failed to fetch sessions.";
      })
      .addCase(fetchSessionById.pending, (state) => {
        state.detailLoading = true;
        state.detailError = null;
        state.detailMessage = "";
      })
      .addCase(fetchSessionById.fulfilled, (state, action) => {
        state.detailLoading = false;
        state.sessionDetails = action.payload.sessionDetails;
        state.detailMessage = action.payload.message;
      })
      .addCase(fetchSessionById.rejected, (state, action) => {
        state.detailLoading = false;
        state.detailError = action.payload || "Failed to fetch session details.";
      })
      .addCase(fetchSessionPreview.pending, (state) => {
        state.previewLoading = true;
        state.previewError = null;
        state.previewMessage = "";
        state.publishMessage = "";
        state.publishError = null;
      })
      .addCase(fetchSessionPreview.fulfilled, (state, action) => {
        state.previewLoading = false;
        state.sessionPreview = action.payload.sessionPreview;
        state.previewMessage = action.payload.message;
      })
      .addCase(fetchSessionPreview.rejected, (state, action) => {
        state.previewLoading = false;
        state.previewError = action.payload || "Failed to fetch session preview.";
      })
      .addCase(publishSession.pending, (state) => {
        state.publishLoading = true;
        state.publishError = null;
        state.publishMessage = "";
      })
      .addCase(publishSession.fulfilled, (state, action) => {
        state.publishLoading = false;
        state.sessionPreview = action.payload.sessionPreview;
        state.publishMessage = action.payload.message;
        state.sessions = state.sessions.map((session) =>
          session.id === action.payload.sessionPreview.session_id
            ? {
                ...session,
                is_published: action.payload.sessionPreview.is_published,
                published_at: action.payload.sessionPreview.published_at,
                final_url: action.payload.sessionPreview.final_url,
              }
            : session,
        );
      })
      .addCase(publishSession.rejected, (state, action) => {
        state.publishLoading = false;
        state.publishError = action.payload || "Failed to publish session.";
      });
  },
});

export const {
  clearSessionError,
  clearSessionListError,
  clearSessionDetailError,
  clearSessionDetails,
  clearSessionPreview,
  clearSessionMessages,
  resetSessionFlow,
} = sessionSlice.actions;
export default sessionSlice.reducer;
