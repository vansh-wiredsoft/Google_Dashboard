import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import sessionReducer from "./sessionSlice";
import companyReducer from "./companySlice";
import userUploadReducer from "./userUploadSlice";
import questionUploadReducer from "./questionUploadSlice";
import questionHierarchyReducer from "./questionHierarchySlice";
import themeReducer from "./themeSlice";
import kpiReducer from "./kpiSlice";
import challengeReducer from "./challengeSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    session: sessionReducer,
    company: companyReducer,
    userUpload: userUploadReducer,
    questionUpload: questionUploadReducer,
    questionHierarchy: questionHierarchyReducer,
    theme: themeReducer,
    kpi: kpiReducer,
    challenge: challengeReducer,
  },
});

export default store;
