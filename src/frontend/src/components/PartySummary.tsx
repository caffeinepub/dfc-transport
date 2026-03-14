import { Badge } from "@/components/ui/badge";
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
import { Building2, FileX, Truck, Users } from "lucide-react";
import { useGetAllEntries } from "../hooks/useQueries";

const fmt = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);

interface SummaryRow {
  name: string;
  totalGadi: number;
  totalAdvance: number;
  totalBalance: number;
  paidCount: number;
}

export default function PartySummary() {
  const { data: entries = [], isLoading } = useGetAllEntries();

  const partyMap: Record<string, SummaryRow> = {};
  const ownerMap: Record<string, SummaryRow> = {};

  for (const d of entries) {
    // Party
    if (!partyMap[d.party_name]) {
      partyMap[d.party_name] = {
        name: d.party_name,
        totalGadi: 0,
        totalAdvance: 0,
        totalBalance: 0,
        paidCount: 0,
      };
    }
    partyMap[d.party_name].totalGadi += 1;
    partyMap[d.party_name].totalAdvance += Number(d.party_advance || 0);
    partyMap[d.party_name].totalBalance += Number(
      d.party_rate - d.party_advance,
    );
    if (d.party_paid) partyMap[d.party_name].paidCount += 1;

    // Owner
    if (!ownerMap[d.owner_name]) {
      ownerMap[d.owner_name] = {
        name: d.owner_name,
        totalGadi: 0,
        totalAdvance: 0,
        totalBalance: 0,
        paidCount: 0,
      };
    }
    ownerMap[d.owner_name].totalGadi += 1;
    ownerMap[d.owner_name].totalAdvance += Number(d.owner_advance || 0);
    ownerMap[d.owner_name].totalBalance += Number(
      d.owner_rate - d.owner_advance,
    );
    if (d.owner_paid) ownerMap[d.owner_name].paidCount += 1;
  }

  const partyRows = Object.values(partyMap).sort(
    (a, b) => b.totalGadi - a.totalGadi,
  );
  const ownerRows = Object.values(ownerMap).sort(
    (a, b) => b.totalGadi - a.totalGadi,
  );

  if (isLoading) {
    return (
      <div className="p-8 text-center text-muted-foreground">Loading...</div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Party Summary */}
      <Card
        className="shadow-card border-border"
        data-ocid="party_summary.card"
      >
        <CardHeader>
          <CardTitle className="font-display text-xl flex items-center gap-2">
            <Building2 className="w-5 h-5 text-primary" />
            Party Records
          </CardTitle>
          <CardDescription>
            Party ke naam ke hisaab se total gadi, advance aur balance.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {partyRows.length === 0 ? (
            <div
              className="p-12 text-center"
              data-ocid="party_summary.empty_state"
            >
              <FileX className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">
                Koi party record nahi mila.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto" data-ocid="party_summary.table">
              <Table>
                <TableHeader>
                  <TableRow className="bg-secondary/50 hover:bg-secondary/50">
                    <TableHead className="font-bold text-sm uppercase tracking-wide px-4 py-3">
                      Party Name
                    </TableHead>
                    <TableHead className="font-bold text-sm uppercase tracking-wide px-4 py-3 text-center">
                      Total Gadi
                    </TableHead>
                    <TableHead className="font-bold text-sm uppercase tracking-wide px-4 py-3 text-right">
                      Total Advance
                    </TableHead>
                    <TableHead className="font-bold text-sm uppercase tracking-wide px-4 py-3 text-right">
                      Total Balance
                    </TableHead>
                    <TableHead className="font-bold text-sm uppercase tracking-wide px-4 py-3 text-center">
                      Paid
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {partyRows.map((row, idx) => (
                    <TableRow
                      key={row.name}
                      data-ocid={`party_summary.row.${idx + 1}`}
                    >
                      <TableCell className="px-4 py-3 font-bold text-base">
                        {row.name}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-center">
                        <Badge
                          variant="outline"
                          className="font-bold text-sm px-3"
                        >
                          {row.totalGadi}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-right font-semibold text-muted-foreground">
                        ₹{fmt(row.totalAdvance)}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-right">
                        <span
                          className={`font-bold text-base ${
                            row.totalBalance > 0
                              ? "text-emerald-600"
                              : row.totalBalance < 0
                                ? "text-destructive"
                                : "text-muted-foreground"
                          }`}
                        >
                          ₹{fmt(row.totalBalance)}
                        </span>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-center">
                        <span className="text-sm text-muted-foreground">
                          {row.paidCount}/{row.totalGadi}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Owner Summary */}
      <Card
        className="shadow-card border-border"
        data-ocid="owner_summary.card"
      >
        <CardHeader>
          <CardTitle className="font-display text-xl flex items-center gap-2">
            <Truck className="w-5 h-5 text-primary" />
            Owner Records
          </CardTitle>
          <CardDescription>
            Gadi owner ke naam ke hisaab se total gadi, advance aur balance.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {ownerRows.length === 0 ? (
            <div
              className="p-12 text-center"
              data-ocid="owner_summary.empty_state"
            >
              <FileX className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">
                Koi owner record nahi mila.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto" data-ocid="owner_summary.table">
              <Table>
                <TableHeader>
                  <TableRow className="bg-secondary/50 hover:bg-secondary/50">
                    <TableHead className="font-bold text-sm uppercase tracking-wide px-4 py-3">
                      Owner Name
                    </TableHead>
                    <TableHead className="font-bold text-sm uppercase tracking-wide px-4 py-3 text-center">
                      Total Gadi
                    </TableHead>
                    <TableHead className="font-bold text-sm uppercase tracking-wide px-4 py-3 text-right">
                      Total Advance
                    </TableHead>
                    <TableHead className="font-bold text-sm uppercase tracking-wide px-4 py-3 text-right">
                      Total Balance
                    </TableHead>
                    <TableHead className="font-bold text-sm uppercase tracking-wide px-4 py-3 text-center">
                      Paid
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ownerRows.map((row, idx) => (
                    <TableRow
                      key={row.name}
                      data-ocid={`owner_summary.row.${idx + 1}`}
                    >
                      <TableCell className="px-4 py-3 font-bold text-base">
                        {row.name}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-center">
                        <Badge
                          variant="outline"
                          className="font-bold text-sm px-3"
                        >
                          {row.totalGadi}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-right font-semibold text-muted-foreground">
                        ₹{fmt(row.totalAdvance)}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-right">
                        <span
                          className={`font-bold text-base ${
                            row.totalBalance > 0
                              ? "text-emerald-600"
                              : row.totalBalance < 0
                                ? "text-destructive"
                                : "text-muted-foreground"
                          }`}
                        >
                          ₹{fmt(row.totalBalance)}
                        </span>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-center">
                        <span className="text-sm text-muted-foreground">
                          {row.paidCount}/{row.totalGadi}
                        </span>
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
