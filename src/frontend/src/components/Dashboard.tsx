import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  LogOut,
  PlusCircle,
  TableProperties,
  TrendingUp,
  Truck,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { useGetTotalCommission } from "../hooks/useQueries";
import EntryForm from "./EntryForm";
import MonthlyReport from "./MonthlyReport";
import PartySummary from "./PartySummary";
import RecordsTable from "./RecordsTable";

type Tab = "entries" | "records" | "monthly" | "summary";

interface Props {
  onLogout: () => void;
}

const LAST_TAB_KEY = "dfcLastTab";

export default function Dashboard({ onLogout }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>(() => {
    const saved = localStorage.getItem(LAST_TAB_KEY) as Tab | null;
    return saved && ["entries", "records", "monthly", "summary"].includes(saved)
      ? saved
      : "entries";
  });
  const { data: totalCommission = 0 } = useGetTotalCommission();

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    localStorage.setItem(LAST_TAB_KEY, tab);
  };

  const isRecords = activeTab === "records";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="navy-mesh shadow-card-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-white/15 flex items-center justify-center">
                <Truck className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-display text-white font-bold text-base leading-tight">
                  DFC Transport Management
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Badge className="bg-accent text-accent-foreground font-semibold hidden sm:flex">
                <TrendingUp className="w-3 h-3 mr-1" />₹
                {totalCommission.toLocaleString("en-IN")} Commission
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                className="text-white/80 hover:text-white hover:bg-white/10"
                onClick={onLogout}
                data-ocid="nav.logout_button"
              >
                <LogOut className="w-4 h-4 mr-1.5" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>

          {/* Tab navigation */}
          <div className="flex gap-1 pb-0 flex-wrap">
            <button
              className={`px-4 py-2.5 text-sm font-medium rounded-t-lg transition-all flex items-center gap-2 ${
                activeTab === "entries"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-white/60 hover:text-white/90 hover:bg-white/10"
              }`}
              onClick={() => handleTabChange("entries")}
              type="button"
              data-ocid="nav.tab"
            >
              <PlusCircle className="w-4 h-4" />
              Add Entry
            </button>
            <button
              className={`px-4 py-2.5 text-sm font-medium rounded-t-lg transition-all flex items-center gap-2 ${
                activeTab === "records"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-white/60 hover:text-white/90 hover:bg-white/10"
              }`}
              onClick={() => handleTabChange("records")}
              type="button"
              data-ocid="records.tab"
            >
              <TableProperties className="w-4 h-4" />
              Records
            </button>
            <button
              className={`px-4 py-2.5 text-sm font-medium rounded-t-lg transition-all flex items-center gap-2 ${
                activeTab === "summary"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-white/60 hover:text-white/90 hover:bg-white/10"
              }`}
              onClick={() => handleTabChange("summary")}
              type="button"
              data-ocid="summary.tab"
            >
              <Users className="w-4 h-4" />
              Party / Owner
            </button>
            <button
              className={`px-4 py-2.5 text-sm font-medium rounded-t-lg transition-all flex items-center gap-2 ${
                activeTab === "monthly"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-white/60 hover:text-white/90 hover:bg-white/10"
              }`}
              onClick={() => handleTabChange("monthly")}
              type="button"
              data-ocid="monthly.tab"
            >
              <BarChart3 className="w-4 h-4" />
              Monthly Report
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main
        className={`flex-1 w-full py-6 ${
          isRecords ? "px-2 sm:px-4" : "max-w-7xl mx-auto px-4 sm:px-6"
        }`}
      >
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
        >
          {activeTab === "entries" ? (
            <EntryForm onSuccess={() => handleTabChange("records")} />
          ) : activeTab === "records" ? (
            <RecordsTable />
          ) : activeTab === "summary" ? (
            <PartySummary />
          ) : (
            <MonthlyReport />
          )}
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-4 px-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()}. Built with ❤️ using{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-foreground transition-colors"
        >
          caffeine.ai
        </a>
      </footer>
    </div>
  );
}
