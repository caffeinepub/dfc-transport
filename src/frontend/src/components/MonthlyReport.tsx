import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BarChart3, Calendar, IndianRupee, Truck } from "lucide-react";
import { useGetAllEntries } from "../hooks/useQueries";

const COMMISSION_PER_GADI = 2000;

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function fmtCurrency(n: number) {
  return new Intl.NumberFormat("en-IN").format(n);
}

interface MonthData {
  key: string; // YYYY-MM
  label: string; // "March 2026"
  gadiCount: number;
  commission: number;
}

export default function MonthlyReport() {
  const { data: entries = [], isLoading } = useGetAllEntries();

  // Group by month
  const monthMap = new Map<string, number>();
  for (const entry of entries) {
    const key = entry.date.slice(0, 7); // YYYY-MM
    monthMap.set(key, (monthMap.get(key) ?? 0) + 1);
  }

  const months: MonthData[] = Array.from(monthMap.entries())
    .map(([key, count]) => {
      const [year, month] = key.split("-");
      return {
        key,
        label: `${MONTH_NAMES[Number(month) - 1]} ${year}`,
        gadiCount: count,
        commission: count * COMMISSION_PER_GADI,
      };
    })
    .sort((a, b) => b.key.localeCompare(a.key)); // newest first

  const totalGadis = entries.length;
  const totalCommission = totalGadis * COMMISSION_PER_GADI;

  return (
    <div className="space-y-4">
      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          {
            label: "Total Months",
            value: months.length.toString(),
            icon: Calendar,
          },
          {
            label: "Total Gadis",
            value: totalGadis.toString(),
            icon: Truck,
          },
          {
            label: "Total Commission",
            value: `₹${fmtCurrency(totalCommission)}`,
            icon: IndianRupee,
            highlight: true,
          },
        ].map(({ label, value, icon: Icon, highlight }) => (
          <Card
            key={label}
            className={`shadow-card border-border ${
              highlight ? "border-accent/40 bg-accent/5" : ""
            }`}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs text-muted-foreground font-medium">
                  {label}
                </p>
                <Icon
                  className={`w-3.5 h-3.5 ${
                    highlight ? "text-accent" : "text-muted-foreground"
                  }`}
                />
              </div>
              <p
                className={`font-display font-bold text-lg leading-tight ${
                  highlight ? "text-accent" : "text-foreground"
                }`}
              >
                {value}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Monthly table */}
      <Card className="shadow-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="font-display text-lg flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            Monthly Commission Report
          </CardTitle>
          <CardDescription>
            Commission is fixed at ₹2,000 per gadi.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div
              className="p-6 text-center text-muted-foreground"
              data-ocid="monthly.loading_state"
            >
              Loading...
            </div>
          ) : months.length === 0 ? (
            <div className="p-12 text-center" data-ocid="monthly.empty_state">
              <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-7 h-7 text-muted-foreground" />
              </div>
              <h3 className="font-display font-semibold text-foreground mb-1">
                No data yet
              </h3>
              <p className="text-muted-foreground text-sm">
                Add transport entries to see monthly reports.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto" data-ocid="monthly.table">
              <Table>
                <TableHeader>
                  <TableRow className="bg-secondary/50 hover:bg-secondary/50">
                    <TableHead className="font-display font-semibold text-xs uppercase tracking-wide">
                      Month
                    </TableHead>
                    <TableHead className="font-display font-semibold text-xs uppercase tracking-wide text-center">
                      Total Gadi
                    </TableHead>
                    <TableHead className="font-display font-semibold text-xs uppercase tracking-wide text-right">
                      Commission
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {months.map((month, idx) => (
                    <TableRow
                      key={month.key}
                      data-ocid={`monthly.row.${idx + 1}`}
                    >
                      <TableCell className="font-medium text-sm">
                        {month.label}
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-secondary text-sm font-semibold">
                          {month.gadiCount}
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-semibold text-accent">
                        ₹{fmtCurrency(month.commission)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
