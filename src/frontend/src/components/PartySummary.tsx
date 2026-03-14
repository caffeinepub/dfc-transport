import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Building2, FileX, Search, Truck, X } from "lucide-react";
import { useState } from "react";
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

function DetailTable({
  title,
  name,
  entries,
  type,
  onClose,
}: {
  title: string;
  name: string;
  entries: ReturnType<typeof useGetAllEntries>["data"];
  type: "party" | "owner";
  onClose: () => void;
}) {
  const filtered = (entries ?? []).filter((e) =>
    type === "party" ? e.party_name === name : e.owner_name === name,
  );

  const totalGadi = filtered.length;
  const totalAdvance = filtered.reduce(
    (s, e) => s + Number(type === "party" ? e.party_advance : e.owner_advance),
    0,
  );
  const totalBalance = filtered.reduce(
    (s, e) =>
      s +
      Number(
        type === "party"
          ? e.party_rate - e.party_advance
          : e.owner_rate - e.owner_advance,
      ),
    0,
  );

  return (
    <Card
      className="border-primary/30 shadow-md mt-4"
      data-ocid={`${type}_detail.card`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="font-display text-lg">
              {title}: <span className="text-primary">{name}</span>
            </CardTitle>
            <CardDescription className="mt-1">
              Sabhi entries is {type === "party" ? "party" : "owner"} ke liye.
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            data-ocid={`${type}_detail.close_button`}
            className="h-8 w-8 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {filtered.length === 0 ? (
          <div
            className="p-8 text-center text-muted-foreground text-sm"
            data-ocid={`${type}_detail.empty_state`}
          >
            Koi entry nahi mili.
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-primary/5 hover:bg-primary/5">
                    <TableHead className="font-bold text-xs uppercase px-4 py-2">
                      Date
                    </TableHead>
                    <TableHead className="font-bold text-xs uppercase px-4 py-2">
                      Truck No
                    </TableHead>
                    <TableHead className="font-bold text-xs uppercase px-4 py-2">
                      From
                    </TableHead>
                    <TableHead className="font-bold text-xs uppercase px-4 py-2">
                      To
                    </TableHead>
                    <TableHead className="font-bold text-xs uppercase px-4 py-2 text-right">
                      {type === "party" ? "Party Rate" : "Owner Rate"}
                    </TableHead>
                    <TableHead className="font-bold text-xs uppercase px-4 py-2 text-right">
                      Advance
                    </TableHead>
                    <TableHead className="font-bold text-xs uppercase px-4 py-2 text-right">
                      Balance
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((e, idx) => {
                    const rate = Number(
                      type === "party" ? e.party_rate : e.owner_rate,
                    );
                    const advance = Number(
                      type === "party" ? e.party_advance : e.owner_advance,
                    );
                    const balance = rate - advance;
                    return (
                      <TableRow
                        key={String(e.bill_no)}
                        data-ocid={`${type}_detail.row.${idx + 1}`}
                      >
                        <TableCell className="px-4 py-2 text-sm">
                          {e.date}
                        </TableCell>
                        <TableCell className="px-4 py-2 text-sm font-mono">
                          {e.gadi_number}
                        </TableCell>
                        <TableCell className="px-4 py-2 text-sm">
                          {e.from_location}
                        </TableCell>
                        <TableCell className="px-4 py-2 text-sm">
                          {e.to_location}
                        </TableCell>
                        <TableCell className="px-4 py-2 text-sm text-right font-semibold">
                          ₹{fmt(rate)}
                        </TableCell>
                        <TableCell className="px-4 py-2 text-sm text-right text-muted-foreground">
                          ₹{fmt(advance)}
                        </TableCell>
                        <TableCell className="px-4 py-2 text-sm text-right">
                          <span
                            className={`font-semibold ${
                              balance >= 0
                                ? "text-emerald-600"
                                : "text-destructive"
                            }`}
                          >
                            ₹{fmt(balance)}
                          </span>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
            {/* Totals */}
            <div className="flex flex-wrap gap-4 px-4 py-3 bg-secondary/40 border-t border-border text-sm">
              <span className="font-semibold">
                Total Gadi:{" "}
                <Badge variant="outline" className="ml-1 font-bold">
                  {totalGadi}
                </Badge>
              </span>
              <span className="font-semibold">
                Total Advance:{" "}
                <span className="text-muted-foreground ml-1">
                  ₹{fmt(totalAdvance)}
                </span>
              </span>
              <span className="font-semibold">
                Total Balance:{" "}
                <span
                  className={`ml-1 ${
                    totalBalance >= 0 ? "text-emerald-600" : "text-destructive"
                  }`}
                >
                  ₹{fmt(totalBalance)}
                </span>
              </span>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default function PartySummary() {
  const { data: entries = [], isLoading } = useGetAllEntries();
  const [partySearch, setPartySearch] = useState("");
  const [ownerSearch, setOwnerSearch] = useState("");
  const [selectedParty, setSelectedParty] = useState<string | null>(null);
  const [selectedOwner, setSelectedOwner] = useState<string | null>(null);

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

  const partyRows = Object.values(partyMap)
    .sort((a, b) => b.totalGadi - a.totalGadi)
    .filter((r) => r.name.toLowerCase().includes(partySearch.toLowerCase()));

  const ownerRows = Object.values(ownerMap)
    .sort((a, b) => b.totalGadi - a.totalGadi)
    .filter((r) => r.name.toLowerCase().includes(ownerSearch.toLowerCase()));

  if (isLoading) {
    return (
      <div
        className="p-8 text-center text-muted-foreground"
        data-ocid="party_summary.loading_state"
      >
        Loading...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Party Summary */}
      <div>
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
              Party ke naam ke hisaab se total gadi, advance aur balance. Naam
              par click karke detail dekhein.
            </CardDescription>
            <div className="relative mt-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Party naam se search karein..."
                value={partySearch}
                onChange={(e) => setPartySearch(e.target.value)}
                className="pl-9 h-9"
                data-ocid="party_summary.search_input"
              />
            </div>
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
                        onClick={() =>
                          setSelectedParty(
                            selectedParty === row.name ? null : row.name,
                          )
                        }
                        className={`cursor-pointer transition-colors ${
                          selectedParty === row.name
                            ? "bg-primary/10 hover:bg-primary/15"
                            : "hover:bg-muted/50"
                        }`}
                      >
                        <TableCell className="px-4 py-3 font-bold text-base text-primary">
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

        {selectedParty && (
          <DetailTable
            title="Party Detail"
            name={selectedParty}
            entries={entries}
            type="party"
            onClose={() => setSelectedParty(null)}
          />
        )}
      </div>

      {/* Owner Summary */}
      <div>
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
              Naam par click karke detail dekhein.
            </CardDescription>
            <div className="relative mt-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Owner naam se search karein..."
                value={ownerSearch}
                onChange={(e) => setOwnerSearch(e.target.value)}
                className="pl-9 h-9"
                data-ocid="owner_summary.search_input"
              />
            </div>
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
                        onClick={() =>
                          setSelectedOwner(
                            selectedOwner === row.name ? null : row.name,
                          )
                        }
                        className={`cursor-pointer transition-colors ${
                          selectedOwner === row.name
                            ? "bg-primary/10 hover:bg-primary/15"
                            : "hover:bg-muted/50"
                        }`}
                      >
                        <TableCell className="px-4 py-3 font-bold text-base text-primary">
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

        {selectedOwner && (
          <DetailTable
            title="Owner Detail"
            name={selectedOwner}
            entries={entries}
            type="owner"
            onClose={() => setSelectedOwner(null)}
          />
        )}
      </div>
    </div>
  );
}
