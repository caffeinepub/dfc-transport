import { Toaster } from "@/components/ui/sonner";
import { useState } from "react";
import Dashboard from "./components/Dashboard";
import LoginPage from "./components/LoginPage";

const ADMINS = [
  { id: "9817783604", pass: "258025" },
  { id: "jatinsharmas336@gmail.com", pass: "Jatin2580" },
];

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);

  const handleLogin = (email: string, password: string) => {
    const valid = ADMINS.some((a) => a.id === email && a.pass === password);
    if (valid) setLoggedIn(true);
    return valid;
  };

  return (
    <>
      {loggedIn ? (
        <Dashboard onLogout={() => setLoggedIn(false)} />
      ) : (
        <LoginPage onLogin={handleLogin} />
      )}
      <Toaster />
    </>
  );
}
