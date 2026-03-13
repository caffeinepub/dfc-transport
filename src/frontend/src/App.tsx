import { Toaster } from "@/components/ui/sonner";
import Dashboard from "./components/Dashboard";
import LoginPage from "./components/LoginPage";
import { useSimpleAuth } from "./hooks/useSimpleAuth";

export default function App() {
  const { isLoggedIn, login, logout } = useSimpleAuth();

  if (!isLoggedIn) {
    return (
      <>
        <LoginPage onLogin={login} />
        <Toaster />
      </>
    );
  }

  return (
    <>
      <Dashboard onLogout={logout} />
      <Toaster />
    </>
  );
}
