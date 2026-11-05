import { useCallback, useMemo, useState } from "react";
import AuthContext from "./authContext";

const STORAGE_KEY = "examflow.user";
const TOKEN_KEY = "token";
const validRoles = new Set(["student", "teacher", "admin"]);

function readStoredUser() {
  for (const storage of [localStorage, sessionStorage]) {
    const token = storage.getItem(TOKEN_KEY);
    const storedUser = storage.getItem(STORAGE_KEY);

    if (!token && !storedUser) continue;
    if (!token || !storedUser) {
      storage.removeItem(TOKEN_KEY);
      storage.removeItem(STORAGE_KEY);
      continue;
    }

    try {
      const user = JSON.parse(storedUser);
      if (user && validRoles.has(user.role)) {
        return {
          token,
          user: {
            ...user,
            name: user.name || user.fullName || "User",
          },
        };
      }
    } catch {
      storage.removeItem(TOKEN_KEY);
      storage.removeItem(STORAGE_KEY);
    }

    storage.removeItem(TOKEN_KEY);
    storage.removeItem(STORAGE_KEY);
  }

  return { token: null, user: null };
}

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(readStoredUser);

  function signIn({ token, user }, remember = false) {
    if (!token || !user || !validRoles.has(user.role)) {
      throw new Error("The server response is missing valid account information.");
    }

    const authenticatedUser = {
      ...user,
      name: user.name || user.fullName || "User",
    };
    const targetStorage = remember ? localStorage : sessionStorage;
    const otherStorage = remember ? sessionStorage : localStorage;

    otherStorage.removeItem(TOKEN_KEY);
    otherStorage.removeItem(STORAGE_KEY);
    targetStorage.setItem(TOKEN_KEY, token);
    targetStorage.setItem(STORAGE_KEY, JSON.stringify(authenticatedUser));
    setAuth({ token, user: authenticatedUser });
  }

  function signOut() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(STORAGE_KEY);
    setAuth({ token: null, user: null });
  }

  const updateUser = useCallback((changes) => {
    if (!auth.user) {
      throw new Error("You must be signed in to update your account.");
    }
    const user = { ...auth.user, ...changes };
    const storage = localStorage.getItem(TOKEN_KEY) ? localStorage : sessionStorage;
    storage.setItem(STORAGE_KEY, JSON.stringify(user));
    setAuth((current) => ({ ...current, user }));
    return user;
  }, [auth.user]);

  const value = useMemo(
    () => ({
      token: auth.token,
      user: auth.user,
      isAuthenticated: Boolean(auth.token && auth.user),
      signIn,
      signOut,
      updateUser,
    }),
    [auth, updateUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
