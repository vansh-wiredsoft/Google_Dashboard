import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import AppRoutes from "./routes/AppRoutes";
import OnboardingGate from "./components/OnboardingGate";
import { loadAuthorization } from "./store/permissionSlice";

function App() {
  const dispatch = useDispatch();
  const authenticated = useSelector((state) => state.auth.isAuthenticated);
  const loaded = useSelector((state) => state.permission.loaded);
  const loading = useSelector((state) => state.permission.loading);

  useEffect(() => {
    if (authenticated && !loaded && !loading) {
      dispatch(loadAuthorization());
    }
  }, [authenticated, loaded, loading, dispatch]);

  return (
    <OnboardingGate>
      <AppRoutes />
    </OnboardingGate>
  );
}

export default App;