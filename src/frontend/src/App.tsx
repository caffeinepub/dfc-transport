import { Toaster } from "@/components/ui/sonner";
import { useState } from "react";
import Dashboard from "./components/Dashboard";
import LoginPage from "./components/LoginPage";

const ADMINS = [
  { id: "9817783604", pass: "258025" },
  { id: "jatinsharmas336@gmail.com", pass: "Jatin2580" },
];

const AUTH_KEY = "dfc_auth";

export default function App() {
  const [loggedIn, setLoggedIn] = useState(() => {
    return localStorage.getItem(AUTH_KEY) === "true";
  });

  const handleLogin = (email: string, password: string) => {
    const valid = ADMINS.some((a) => a.id === email && a.pass === password);
    if (valid) {
      localStorage.setItem(AUTH_KEY, "true");
      setLoggedIn(true);
    }
    return valid;
  };

  const handleLogout = () => {
    localStorage.removeItem(AUTH_KEY);
    setLoggedIn(false);
  };

  return (
    <>
      {loggedIn ? (
        <Dashboard onLogout={handleLogout} />
      ) : (
        <LoginPage onLogin={handleLogin} />
      )}
      <Toaster />
    </>
  );
}
