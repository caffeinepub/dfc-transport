import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BarChart3, Shield, Truck } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";

interface Props {
  onLogin: (email: string, password: string) => boolean;
}

export default function LoginPage({ onLogin }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    const success = onLogin(email, password);
    if (!success) {
      setError("Invalid login credentials");
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen navy-mesh flex flex-col">
      {/* Header */}
      <header className="px-6 py-5 flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-white/15 flex items-center justify-center">
          <Truck className="w-5 h-5 text-white" />
        </div>
        <span className="font-display text-white font-semibold text-lg tracking-tight">
          DFC Transport
        </span>
      </header>

      {/* Main */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-sm"
        >
          {/* Login card */}
          <div className="bg-white rounded-2xl shadow-card-lg overflow-hidden">
            <div className="h-1.5 w-full bg-accent" />

            <div className="px-8 py-8">
              <div className="text-center mb-8">
                <div className="inline-flex w-16 h-16 rounded-2xl navy-gradient items-center justify-center mb-4 shadow-card-lg">
                  <Truck className="w-8 h-8 text-white" />
                </div>
                <h1 className="font-display text-2xl font-bold text-foreground mb-1">
                  DFC Transport
                </h1>
                <p className="text-muted-foreground text-sm">
                  Management System
                </p>
              </div>

              <div className="space-y-3 mb-6">
                {[
                  { icon: Shield, text: "Secure admin access" },
                  { icon: BarChart3, text: "Full records management" },
                  { icon: Truck, text: "Transport entry tracking" },
                ].map(({ icon: Icon, text }) => (
                  <div
                    key={text}
                    className="flex items-center gap-3 text-sm text-muted-foreground"
                  >
                    <div className="w-7 h-7 rounded-md bg-secondary flex items-center justify-center flex-shrink-0">
                      <Icon className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <span>{text}</span>
                  </div>
                ))}
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label
                    htmlFor="email"
                    className="text-sm font-medium text-foreground"
                  >
                    Email / Phone
                  </Label>
                  <Input
                    id="email"
                    type="text"
                    placeholder="Email ya Phone Number"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="username"
                    data-ocid="login.email.input"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label
                    htmlFor="password"
                    className="text-sm font-medium text-foreground"
                  >
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    data-ocid="login.password.input"
                  />
                </div>

                {error && (
                  <p
                    className="text-sm text-destructive font-medium text-center"
                    data-ocid="login.error_state"
                  >
                    {error}
                  </p>
                )}

                <Button
                  type="submit"
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-11 font-semibold text-sm rounded-lg"
                  disabled={isLoading}
                  data-ocid="login.submit_button"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      Logging in...
                    </span>
                  ) : (
                    "Login"
                  )}
                </Button>
              </form>

              <p className="text-center text-xs text-muted-foreground mt-4">
                Admin access only. Unauthorized access is prohibited.
              </p>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="text-center py-4 text-white/40 text-xs">
        © {new Date().getFullYear()}. Built with love using{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-white/70 transition-colors"
        >
          caffeine.ai
        </a>
      </footer>
    </div>
  );
}
