import { Button } from "@/components/ui/button";
import { LogOut, ShieldX } from "lucide-react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

export default function AccessDenied() {
  const { clear } = useInternetIdentity();

  return (
    <div className="min-h-screen navy-mesh flex flex-col items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-card-lg p-8 max-w-sm w-full text-center">
        <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto mb-4">
          <ShieldX className="w-8 h-8 text-destructive" />
        </div>
        <h2 className="font-display text-xl font-bold text-foreground mb-2">
          Access Denied
        </h2>
        <p className="text-muted-foreground text-sm mb-6">
          You don't have administrator privileges to access this system. Please
          contact your system administrator.
        </p>
        <Button
          variant="outline"
          className="w-full"
          onClick={clear}
          data-ocid="nav.logout_button"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </div>
    </div>
  );
}
