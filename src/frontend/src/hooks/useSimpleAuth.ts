import { useState } from "react";

const ADMINS = [
  { id: "jatinsharmas336@gmail.com", pass: "Jatin2580" },
  { id: "9817783604", pass: "258025" },
];
const STORAGE_KEY = "dfc_auth";

export function useSimpleAuth() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem(STORAGE_KEY) === "true";
  });

  const login = (email: string, password: string): boolean => {
    const valid = ADMINS.some((a) => a.id === email && a.pass === password);
    if (valid) {
      localStorage.setItem(STORAGE_KEY, "true");
      setIsLoggedIn(true);
      return true;
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setIsLoggedIn(false);
  };

  return { isLoggedIn, login, logout };
}
