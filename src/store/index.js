import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import sessionReducer from "./sessionSlice";
import companyReducer from "./companySlice";
import userReducer from "./userSlice";
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
    user: userReducer,
    userUpload: userUploadReducer,
    questionUpload: questionUploadReducer,
    questionHierarchy: questionHierarchyReducer,
    theme: themeReducer,
    kpi: kpiReducer,
    challenge: challengeReducer,
  },
});

export default store;
