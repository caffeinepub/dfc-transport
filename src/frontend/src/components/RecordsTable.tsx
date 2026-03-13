import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import {
  FileX,
  IndianRupee,
  TableProperties,
  Trash2,
  TrendingUp,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  type TransportEntry,
  useDeleteEntry,
  useGetAllEntries,
} from "../hooks/useQueries";

const COMMISSION_PER_GADI = 2000;

const fmt = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);

function BalanceBadge({ value }: { value: number }) {
  if (value > 0)
    return (
      <span className="font-semibold text-emerald-600">₹{fmt(value)}</span>
    );
  if (value < 0)
    return (
      <span className="font-semibold text-destructive">₹{fmt(value)}</span>
    );
  return <span className="text-muted-foreground">₹0.00</span>;
}

function CommissionBadge() {
  return (
    <Badge className="bg-accent text-accent-foreground font-semibold">
      +₹{fmt(COMMISSION_PER_GADI)}
    </Badge>
  );
}

interface RowProps {
  entry: TransportEntry;
  index: number;
  onDelete: (billNo: bigint) => void;
  isDeleting: boolean;
}

function EntryRow({ entry, index, onDelete, isDeleting }: RowProps) {
  const partyBalance = entry.party_rate - entry.party_advance;
  const ownerBalance = entry.owner_rate - entry.owner_advance;

  return (
    <TableRow className="shimmer-row" data-ocid="records.row">
      <TableCell className="font-mono text-xs font-semibold text-primary">
        DFC-{entry.bill_no.toString().padStart(4, "0")}
      </TableCell>
      <TableCell className="text-sm">{entry.date}</TableCell>
      <TableCell>
        <Badge variant="outline" className="font-mono text-xs">
          {entry.gadi_number}
        </Badge>
      </TableCell>
      <TableCell className="text-sm">{entry.from_location}</TableCell>
      <TableCell className="text-sm">{entry.to_location}</TableCell>
      <TableCell className="text-sm font-medium">{entry.party_name}</TableCell>
      <TableCell className="text-right">
        <BalanceBadge value={partyBalance} />
      </TableCell>
      <TableCell className="text-sm font-medium">{entry.owner_name}</TableCell>
      <TableCell className="text-right">
        <BalanceBadge value={ownerBalance} />
      </TableCell>
      <TableCell className="text-right">
        <CommissionBadge />
      </TableCell>
      <TableCell className="text-sm text-muted-foreground max-w-[160px] truncate">
        {entry.comment || "-"}
      </TableCell>
      <TableCell>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              disabled={isDeleting}
              data-ocid={`records.delete_button.${index}`}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent data-ocid="records.dialog">
            <AlertDialogHeader>
              <AlertDialogTitle>
                Delete Entry DFC-{entry.bill_no.toString().padStart(4, "0")}?
              </AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete the transport entry for{" "}
                <strong>{entry.party_name}</strong> ({entry.from_location} →{" "}
                {entry.to_location}). This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel data-ocid="records.cancel_button">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={() => onDelete(entry.bill_no)}
                data-ocid="records.confirm_button"
              >
                Delete Entry
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </TableCell>
    </TableRow>
  );
}

export default function RecordsTable() {
  const { data: entries = [], isLoading, isError } = useGetAllEntries();
  const deleteEntry = useDeleteEntry();
  const [deletingId, setDeletingId] = useState<bigint | null>(null);

  const totalCommission = entries.length * COMMISSION_PER_GADI;

  const handleDelete = async (billNo: bigint) => {
    setDeletingId(billNo);
    try {
      const success = await deleteEntry.mutateAsync(billNo);
      if (success) {
        toast.success("Entry deleted.");
      } else {
        toast.error("Failed to delete entry.");
      }
    } catch {
      toast.error("An error occurred while deleting.");
    } finally {
      setDeletingId(null);
    }
  };

  const sorted = [...entries].sort((a, b) => Number(b.bill_no - a.bill_no));

  return (
    <div className="space-y-4">
      {/* Summary bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {
            label: "Total Entries",
            value: entries.length.toString(),
            icon: TableProperties,
          },
          {
            label: "Total Commission",
            value: `₹${fmt(totalCommission)}`,
            icon: TrendingUp,
            highlight: true,
          },
          {
            label: "Total Party Value",
            value: `₹${fmt(entries.reduce((s, e) => s + e.party_rate, 0))}`,
            icon: IndianRupee,
          },
          {
            label: "Total Owner Value",
            value: `₹${fmt(entries.reduce((s, e) => s + e.owner_rate, 0))}`,
            icon: IndianRupee,
          },
        ].map(({ label, value, icon: Icon, highlight }) => (
          <Card
            key={label}
            className={`shadow-card border-border ${highlight ? "border-accent/40 bg-accent/5" : ""}`}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs text-muted-foreground font-medium">
                  {label}
                </p>
                <Icon
                  className={`w-3.5 h-3.5 ${highlight ? "text-accent" : "text-muted-foreground"}`}
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

      {/* Table */}
      <Card className="shadow-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="font-display text-lg flex items-center gap-2">
            <TableProperties className="w-5 h-5 text-primary" />
            Transport Records
          </CardTitle>
          <CardDescription>
            All transport entries sorted by latest bill number.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3" data-ocid="records.loading_state">
              <p className="text-muted-foreground text-sm text-center">
                Loading...
              </p>
            </div>
          ) : isError ? (
            <div className="p-8 text-center" data-ocid="records.error_state">
              <p className="text-destructive font-medium">
                Failed to load records. Please refresh.
              </p>
            </div>
          ) : sorted.length === 0 ? (
            <div className="p-12 text-center" data-ocid="records.empty_state">
              <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                <FileX className="w-7 h-7 text-muted-foreground" />
              </div>
              <h3 className="font-display font-semibold text-foreground mb-1">
                No records yet
              </h3>
              <p className="text-muted-foreground text-sm">
                Add your first transport entry using the Add Entry tab.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto" data-ocid="records.table">
              <Table>
                <TableHeader>
                  <TableRow className="bg-secondary/50 hover:bg-secondary/50">
                    <TableHead className="font-display font-semibold text-xs uppercase tracking-wide w-20">
                      Bill No
                    </TableHead>
                    <TableHead className="font-display font-semibold text-xs uppercase tracking-wide">
                      Date
                    </TableHead>
                    <TableHead className="font-display font-semibold text-xs uppercase tracking-wide">
                      Gadi
                    </TableHead>
                    <TableHead className="font-display font-semibold text-xs uppercase tracking-wide">
                      From
                    </TableHead>
                    <TableHead className="font-display font-semibold text-xs uppercase tracking-wide">
                      To
                    </TableHead>
                    <TableHead className="font-display font-semibold text-xs uppercase tracking-wide">
                      Party
                    </TableHead>
                    <TableHead className="font-display font-semibold text-xs uppercase tracking-wide text-right">
                      Party Balance
                    </TableHead>
                    <TableHead className="font-display font-semibold text-xs uppercase tracking-wide">
                      Owner
                    </TableHead>
                    <TableHead className="font-display font-semibold text-xs uppercase tracking-wide text-right">
                      Owner Balance
                    </TableHead>
                    <TableHead className="font-display font-semibold text-xs uppercase tracking-wide text-right">
                      Commission
                    </TableHead>
                    <TableHead className="font-display font-semibold text-xs uppercase tracking-wide">
                      Comment
                    </TableHead>
                    <TableHead className="w-12" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sorted.map((entry, idx) => (
                    <EntryRow
                      key={entry.bill_no.toString()}
                      entry={entry}
                      index={idx + 1}
                      onDelete={handleDelete}
                      isDeleting={deletingId === entry.bill_no}
                    />
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
