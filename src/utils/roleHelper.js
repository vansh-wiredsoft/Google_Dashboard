const AUTH_KEY = "isAuthenticated";
const ROLE_KEY = "role";
const USER_KEY = "userProfile";

export const getRole = () => localStorage.getItem(ROLE_KEY);

export const isAuthenticated = () => localStorage.getItem(AUTH_KEY) === "true";

export const setAuthSession = ({ role, name, email }) => {
  localStorage.setItem(AUTH_KEY, "true");
  localStorage.setItem(ROLE_KEY, role);
  localStorage.setItem(
    USER_KEY,
    JSON.stringify({
      name,
      email,
      role,
    }),
  );
};

export const clearAuthSession = () => {
  localStorage.removeItem(AUTH_KEY);
  localStorage.removeItem(ROLE_KEY);
  localStorage.removeItem(USER_KEY);
};

export const getUserProfile = () => {
  const profile = localStorage.getItem(USER_KEY);
  if (!profile) return null;

  try {
    return JSON.parse(profile);
  } catch {
    return null;
  }
};
