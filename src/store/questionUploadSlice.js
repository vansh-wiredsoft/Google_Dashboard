import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api, { getApiErrorMessage } from "../services/api";

const QUESTION_UPLOAD_PATH = "/config/api/v1/kpiquestions/upload";

const initialState = {
  loading: false,
  status: null,
  error: "",
  responseData: null,
};

export const uploadQuestionFile = createAsyncThunk(
  "questionUpload/uploadQuestionFile",
  async (file, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await api.post(QUESTION_UPLOAD_PATH, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

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

const questionUploadSlice = createSlice({
  name: "questionUpload",
  initialState,
  reducers: {
    resetQuestionUpload(state) {
      state.loading = false;
      state.status = null;
      state.error = "";
      state.responseData = null;
    },
    clearQuestionUploadError(state) {
      state.error = "";
      if (state.status === "error") {
        state.status = null;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(uploadQuestionFile.pending, (state) => {
        state.loading = true;
        state.status = null;
        state.error = "";
        state.responseData = null;
      })
      .addCase(uploadQuestionFile.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "success";
        state.responseData = action.payload;
      })
      .addCase(uploadQuestionFile.rejected, (state, action) => {
        state.loading = false;
        state.status = "error";
        state.error = action.payload || "Upload failed.";
      });
  },
});

export const { resetQuestionUpload, clearQuestionUploadError } =
  questionUploadSlice.actions;
export default questionUploadSlice.reducer;
