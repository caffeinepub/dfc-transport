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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import {
  CalendarDays,
  CheckCircle2,
  FileText,
  FileX,
  ImageIcon,
  IndianRupee,
  Loader2,
  Pencil,
  TableProperties,
  Trash2,
  TrendingUp,
  X,
} from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import {
  type TransportEntry,
  useDeleteEntry,
  useGetAllEntries,
  useToggleOwnerPaid,
  useTogglePartyPaid,
  useUpdateEntry,
} from "../hooks/useQueries";

const COMMISSION_PER_GADI = 2000;

function billLabel(billNo: bigint) {
  return `DFC-${billNo.toString().padStart(4, "0")}`;
}

function downloadLR(entry: TransportEntry) {
  // biome-ignore lint/suspicious/noExplicitAny: jsPDF loaded via CDN
  const { jsPDF } = (window as any).jspdf;
  const doc = new jsPDF();
  const bill = billLabel(entry.bill_no);
  const partyBal = entry.party_rate - entry.party_advance;
  const ownerBal = entry.owner_rate - entry.owner_advance;

  doc.setFontSize(22);
  doc.text("DFC TRANSPORT COMPANY", 105, 15, { align: "center" });
  doc.setFontSize(10);
  doc.text("All India Transport Service", 105, 22, { align: "center" });
  doc.text("Phone: 9817783604", 105, 27, { align: "center" });
  doc.setFontSize(16);
  doc.text("LORRY RECEIPT (LR)", 105, 38, { align: "center" });

  doc.rect(15, 45, 90, 12);
  doc.text(`LR No: ${bill}`, 18, 53);
  doc.rect(105, 45, 90, 12);
  doc.text(`Date: ${entry.date}`, 108, 53);

  doc.rect(15, 60, 90, 18);
  doc.text("Consignor (Sender):", 18, 67);
  doc.text(entry.party_name || "-", 18, 74);
  doc.rect(105, 60, 90, 18);
  doc.text("Consignee (Receiver):", 108, 67);
  doc.text("-", 108, 74);

  doc.rect(15, 82, 90, 12);
  doc.text(`Truck No: ${entry.gadi_number}`, 18, 90);
  doc.rect(105, 82, 90, 12);
  doc.text(`Owner: ${entry.owner_name}`, 108, 90);

  doc.rect(15, 97, 180, 12);
  doc.text(`Route: ${entry.from_location} → ${entry.to_location}`, 18, 105);

  doc.rect(15, 115, 180, 10);
  doc.text("Description of Goods", 18, 122);
  doc.text("Weight", 120, 122);
  doc.text("Freight", 160, 122);
  doc.rect(15, 125, 180, 15);
  doc.text("Transport Material", 18, 134);
  doc.text("-", 125, 134);
  doc.text("To Pay", 160, 134);

  doc.rect(15, 145, 90, 12);
  doc.text(`Party Balance: ${partyBal}`, 18, 153);
  doc.rect(105, 145, 90, 12);
  doc.text(`Owner Balance: ${ownerBal}`, 108, 153);

  doc.rect(15, 160, 180, 10);
  doc.text("Broker Commission: ₹2000", 18, 167);

  doc.text("Receiver Sign", 20, 185);
  doc.line(15, 180, 70, 180);
  doc.text("Authorized Signatory", 150, 185);
  doc.line(135, 180, 200, 180);

  doc.setFontSize(9);
  doc.text("This is a computer generated Lorry Receipt.", 105, 198, {
    align: "center",
  });

  doc.save(`${bill}_LR.pdf`);
}

function downloadBill(entry: TransportEntry) {
  // biome-ignore lint/suspicious/noExplicitAny: jsPDF loaded via CDN
  const { jsPDF } = (window as any).jspdf;
  const doc = new jsPDF();
  const bill = billLabel(entry.bill_no);
  const partyBal = entry.party_rate - entry.party_advance;
  const commission = 2000;

  doc.setFontSize(20);
  doc.text("DFC TRANSPORT - PARTY BILL", 105, 18, { align: "center" });
  doc.setFontSize(12);
  doc.text(`Bill No: ${bill}`, 20, 40);
  doc.text(`Date: ${entry.date}`, 150, 40);

  doc.rect(20, 50, 170, 12);
  doc.text(`Party Name: ${entry.party_name}`, 24, 58);
  doc.rect(20, 65, 170, 12);
  doc.text(
    `Truck No: ${entry.gadi_number}    Route: ${entry.from_location} → ${entry.to_location}`,
    24,
    73,
  );

  doc.rect(20, 85, 170, 10);
  doc.text("Description", 24, 92);
  doc.text("Amount", 150, 92);

  doc.rect(20, 95, 170, 12);
  doc.text("Freight Charges", 24, 103);
  doc.text(String(partyBal + commission), 150, 103);

  doc.rect(20, 107, 170, 12);
  doc.text("Broker Commission", 24, 115);
  doc.text(String(commission), 150, 115);

  doc.rect(20, 119, 170, 12);
  doc.text("Balance Amount", 24, 127);
  doc.text(String(partyBal), 150, 127);

  doc.text("Authorized Signatory", 150, 170);
  doc.line(140, 165, 200, 165);

  doc.save(`${bill}_Party_Bill.pdf`);
}
async function downloadLoadingSlip(entry: TransportEntry) {
  // biome-ignore lint/suspicious/noExplicitAny: jsPDF loaded via CDN
  const { jsPDF } = (window as any).jspdf;
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const bill = billLabel(entry.bill_no);
  const freight = entry.party_rate;
  const advance = entry.party_advance;
  const balance = freight - advance;

  const pageW = 210;
  const margin = 14;
  const contentW = pageW - margin * 2;

  // ── RED HEADER ───────────────────────────────────────────────────
  const headerH = 38;
  doc.setFillColor(200, 0, 0);
  doc.rect(0, 0, pageW, headerH, "F");

  // ── LOGO ─────────────────────────────────────────────────────────
  try {
    await new Promise<void>((resolve) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        doc.addImage(img, "PNG", margin, 4, 30, 30);
        resolve();
      };
      img.onerror = () => resolve();
      img.src = "/assets/uploads/IMG_20260302_162344-1.png";
    });
  } catch (_) {}

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("DEEPANSHU FRIGHT CARRIER", pageW / 2 + 10, 12, { align: "center" });

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Sister Concern : Shivani Roadlines", pageW / 2 + 10, 19, {
    align: "center",
  });

  doc.setFontSize(8);
  doc.text(
    "Mumbai Office : 102, Ridhi Arcade, Plot No.857 C, Near RTO Office, Steel Market, Kalamboli, Mumbai - 410218",
    pageW / 2 + 10,
    25,
    { align: "center" },
  );
  doc.text(
    "Mobile : 9817783604 / 9817983604  |  Email : deepanshufrightcarrier@gmail.com",
    pageW / 2 + 10,
    31,
    { align: "center" },
  );

  // ── TITLE ────────────────────────────────────────────────────────
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.text("LOADING SLIP", pageW / 2, 46, { align: "center" });
  doc.setLineWidth(0.5);
  doc.line(margin, 49, pageW - margin, 49);

  // ── SLIP NO / DATE ───────────────────────────────────────────────
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  let y = 57;
  doc.rect(margin, y - 5, contentW / 2 - 2, 10);
  doc.rect(margin + contentW / 2 + 2, y - 5, contentW / 2 - 2, 10);
  doc.setFont("helvetica", "bold");
  doc.text("Loading Slip No:", margin + 2, y);
  doc.setFont("helvetica", "normal");
  doc.text(bill, margin + 36, y);
  doc.setFont("helvetica", "bold");
  doc.text("Date:", margin + contentW / 2 + 4, y);
  doc.setFont("helvetica", "normal");
  doc.text(entry.date, margin + contentW / 2 + 18, y);

  // ── PARTY ────────────────────────────────────────────────────────
  y = 62;
  doc.rect(margin, y - 5, contentW, 10);
  doc.setFont("helvetica", "bold");
  doc.text("TO, M/S :", margin + 2, y);
  doc.setFont("helvetica", "normal");
  doc.text(entry.party_name || "-", margin + 22, y);

  // ── VEHICLE / OWNER ──────────────────────────────────────────────
  y = 78;
  doc.rect(margin, y - 5, contentW / 2 - 2, 10);
  doc.rect(margin + contentW / 2 + 2, y - 5, contentW / 2 - 2, 10);
  doc.setFont("helvetica", "bold");
  doc.text("Vehicle No:", margin + 2, y);
  doc.setFont("helvetica", "normal");
  doc.text(entry.gadi_number || "-", margin + 26, y);
  doc.setFont("helvetica", "bold");
  doc.text("Owner:", margin + contentW / 2 + 4, y);
  doc.setFont("helvetica", "normal");
  doc.text(entry.owner_name || "-", margin + contentW / 2 + 20, y);

  // ── ROUTE ────────────────────────────────────────────────────────
  y = 94;
  doc.rect(margin, y - 5, contentW / 2 - 2, 10);
  doc.rect(margin + contentW / 2 + 2, y - 5, contentW / 2 - 2, 10);
  doc.setFont("helvetica", "bold");
  doc.text("From Station:", margin + 2, y);
  doc.setFont("helvetica", "normal");
  doc.text(entry.from_location || "-", margin + 30, y);
  doc.setFont("helvetica", "bold");
  doc.text("To Station:", margin + contentW / 2 + 4, y);
  doc.setFont("helvetica", "normal");
  doc.text(entry.to_location || "-", margin + contentW / 2 + 26, y);

  // ── FREIGHT TABLE ────────────────────────────────────────────────
  y = 108;
  doc.setFillColor(220, 220, 220);
  doc.rect(margin, y - 6, contentW, 8, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("Description", margin + 4, y - 0.5);
  doc.text("Amount (Rs)", pageW - margin - 4, y - 0.5, { align: "right" });

  const rows = [
    ["Freight Rs", `Rs. ${freight.toLocaleString("en-IN")}`],
    ["Advance Rs", `Rs. ${advance.toLocaleString("en-IN")}`],
    ["Balance Rs", `Rs. ${balance.toLocaleString("en-IN")}`],
  ];
  y += 4;
  doc.setFont("helvetica", "normal");
  for (const [label, val] of rows) {
    doc.rect(margin, y - 0.5, contentW, 9);
    doc.text(label, margin + 4, y + 5.5);
    doc.text(val, pageW - margin - 4, y + 5.5, { align: "right" });
    y += 9;
  }

  // ── PAYMENT ──────────────────────────────────────────────────────
  y += 6;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Payment Details", margin, y);
  doc.line(margin, y + 1.5, pageW - margin, y + 1.5);

  y += 9;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.rect(margin, y - 5, contentW, 10);
  doc.setFont("helvetica", "bold");
  doc.text("Payment Done At (IMPS / NEFT) :", margin + 2, y);
  doc.setFont("helvetica", "normal");
  doc.text("__________________________", margin + 70, y);

  y += 14;
  // To Pay checkbox
  doc.rect(margin, y - 4, 5, 5);
  doc.text("To Pay", margin + 7, y);
  // Adv Balance checkbox
  doc.rect(margin + 40, y - 4, 5, 5);
  doc.text("Adv Balance", margin + 47, y);

  // ── BANK DETAILS ─────────────────────────────────────────────────
  y += 14;
  doc.setFillColor(240, 240, 240);
  doc.rect(margin, y - 6, contentW, 32, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Bank Details", margin + 4, y);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("Bank   : HDFC Bank", margin + 4, y + 8);
  doc.text("A/C No : XXXXXXXXXXXX", margin + 4, y + 16);
  doc.text("IFSC   : HDFC0000000", margin + 4, y + 24);

  // ── SIGNATURE ────────────────────────────────────────────────────
  y += 42;
  doc.line(pageW - margin - 60, y, pageW - margin, y);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("For Deepanshu Fright Carrier", pageW - margin - 30, y + 5, {
    align: "center",
  });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text("Authorised Signatory", pageW - margin - 30, y + 10, {
    align: "center",
  });

  doc.save(`${bill}_Loading_Slip.pdf`);
}

const fmt = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);

function BalanceBadge({ value }: { value: number }) {
  if (value > 0)
    return (
      <span className="font-bold text-base text-emerald-600">
        ₹{fmt(value)}
      </span>
    );
  if (value < 0)
    return (
      <span className="font-bold text-base text-destructive">
        ₹{fmt(value)}
      </span>
    );
  return <span className="text-base text-muted-foreground">₹0.00</span>;
}

function ProofThumb({ src, label }: { src?: string; label: string }) {
  const [open, setOpen] = useState(false);
  if (!src) return <span className="text-xs text-muted-foreground">-</span>;
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-1 text-xs text-primary hover:underline"
      >
        <ImageIcon className="w-3 h-3" />
        Proof
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{label}</DialogTitle>
          </DialogHeader>
          <img src={src} alt={label} className="w-full rounded-md" />
        </DialogContent>
      </Dialog>
    </>
  );
}

function OwnerBalanceCell({
  rate,
  advance,
  advanceDate,
  advanceProof,
  ownerPaid,
  onTogglePaid,
}: {
  rate: number;
  advance: number;
  advanceDate?: string;
  advanceProof?: string;
  ownerPaid: boolean;
  onTogglePaid: () => void;
}) {
  const balance = rate - advance;
  const afterCommission = rate - advance - COMMISSION_PER_GADI;

  return (
    <div className="flex flex-col gap-1 items-end">
      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        <span className="font-medium">Rate:</span>
        <span>₹{fmt(rate)}</span>
      </div>
      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        <span className="font-medium">Adv:</span>
        <span>₹{fmt(advance)}</span>
      </div>
      {advanceDate && (
        <div className="flex items-center gap-1 text-xs text-blue-600">
          <CalendarDays className="w-3 h-3" />
          <span>{advanceDate}</span>
        </div>
      )}
      <ProofThumb src={advanceProof} label="Owner Advance Proof" />
      <div className="mt-1 border-t border-border pt-1">
        <BalanceBadge value={balance} />
      </div>
      <div className="mt-1.5 pt-1.5 border-t border-dashed border-orange-200 w-full flex flex-col items-end gap-0.5">
        <span className="text-xs text-orange-500 font-medium">
          -₹2000 Commission
        </span>
        <span
          className={`text-base font-bold ${afterCommission < 0 ? "text-destructive" : "text-orange-600"}`}
        >
          ₹{fmt(afterCommission)}
        </span>
      </div>
      <button
        type="button"
        onClick={onTogglePaid}
        data-ocid="records.owner_paid.toggle"
        className={`mt-1.5 flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
          ownerPaid
            ? "bg-emerald-100 text-emerald-700 border border-emerald-300"
            : "bg-muted text-muted-foreground border border-border hover:bg-emerald-50 hover:text-emerald-600"
        }`}
      >
        <CheckCircle2 className="w-3.5 h-3.5" />
        {ownerPaid ? "Paid" : "Mark Paid"}
      </button>
    </div>
  );
}

function PartyBalanceCell({
  rate,
  advance,
  advanceDate,
  advanceProof,
  partyPaid,
  onTogglePaid,
}: {
  rate: number;
  advance: number;
  advanceDate?: string;
  advanceProof?: string;
  partyPaid: boolean;
  onTogglePaid: () => void;
}) {
  const balance = rate - advance;
  return (
    <div className="flex flex-col gap-1 items-end">
      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        <span className="font-medium">Rate:</span>
        <span>₹{fmt(rate)}</span>
      </div>
      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        <span className="font-medium">Adv:</span>
        <span>₹{fmt(advance)}</span>
      </div>
      {advanceDate && (
        <div className="flex items-center gap-1 text-xs text-blue-600">
          <CalendarDays className="w-3 h-3" />
          <span>{advanceDate}</span>
        </div>
      )}
      <ProofThumb src={advanceProof} label="Party Advance Proof" />
      <div className="mt-1 border-t border-border pt-1">
        <BalanceBadge value={balance} />
      </div>
      <button
        type="button"
        onClick={onTogglePaid}
        data-ocid="records.party_paid.toggle"
        className={`mt-1.5 flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
          partyPaid
            ? "bg-emerald-100 text-emerald-700 border border-emerald-300"
            : "bg-muted text-muted-foreground border border-border hover:bg-emerald-50 hover:text-emerald-600"
        }`}
      >
        <CheckCircle2 className="w-3.5 h-3.5" />
        {partyPaid ? "Paid" : "Mark Paid"}
      </button>
    </div>
  );
}

function CommissionBadge() {
  return (
    <Badge className="bg-accent text-accent-foreground font-semibold text-sm px-3 py-1">
      +₹{fmt(COMMISSION_PER_GADI)}
    </Badge>
  );
}

// ---- Edit Dialog ----
function EditDialog({
  entry,
  open,
  onClose,
}: {
  entry: TransportEntry;
  open: boolean;
  onClose: () => void;
}) {
  const updateEntry = useUpdateEntry();
  const partyProofRef = useRef<HTMLInputElement>(null);
  const ownerProofRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    date: entry.date,
    gadi_number: entry.gadi_number,
    from_location: entry.from_location,
    to_location: entry.to_location,
    party_name: entry.party_name,
    party_rate: entry.party_rate.toString(),
    party_advance: entry.party_advance.toString(),
    party_advance_date: entry.party_advance_date || "",
    party_advance_proof: entry.party_advance_proof || "",
    owner_name: entry.owner_name,
    owner_rate: entry.owner_rate.toString(),
    owner_advance: entry.owner_advance.toString(),
    owner_advance_date: entry.owner_advance_date || "",
    owner_advance_proof: entry.owner_advance_proof || "",
    comment: entry.comment,
  });

  const upd =
    (field: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((p) => ({ ...p, [field]: e.target.value }));

  const handleImageFile =
    (field: "party_advance_proof" | "owner_advance_proof") =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () =>
        setForm((p) => ({ ...p, [field]: reader.result as string }));
      reader.readAsDataURL(file);
    };

  const handleSave = () => {
    updateEntry.mutate(
      {
        billNo: entry.bill_no,
        data: {
          date: form.date,
          gadi_number: form.gadi_number,
          from_location: form.from_location,
          to_location: form.to_location,
          party_name: form.party_name,
          party_rate: Number.parseFloat(form.party_rate) || 0,
          party_advance: Number.parseFloat(form.party_advance) || 0,
          party_advance_date: form.party_advance_date || undefined,
          party_advance_proof: form.party_advance_proof || undefined,
          owner_name: form.owner_name,
          owner_rate: Number.parseFloat(form.owner_rate) || 0,
          owner_advance: Number.parseFloat(form.owner_advance) || 0,
          owner_advance_date: form.owner_advance_date || undefined,
          owner_advance_proof: form.owner_advance_proof || undefined,
          comment: form.comment,
        },
      },
      {
        onSuccess: () => {
          toast.success("Entry update ho gayi!");
          onClose();
        },
        onError: () => toast.error("Update nahi hua."),
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className="max-w-2xl max-h-[90vh] overflow-y-auto"
        data-ocid="records.edit.dialog"
      >
        <DialogHeader>
          <DialogTitle>
            Edit Entry — DFC-{entry.bill_no.toString().padStart(4, "0")}
          </DialogTitle>
          <DialogDescription>
            Koi bhi field badal kar Save karein.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Trip */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Date</Label>
              <Input
                type="date"
                value={form.date}
                onChange={upd("date")}
                className="h-8"
                data-ocid="edit.date.input"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Gadi Number</Label>
              <Input
                value={form.gadi_number}
                onChange={upd("gadi_number")}
                className="h-8"
                data-ocid="edit.gadi.input"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">From</Label>
              <Input
                value={form.from_location}
                onChange={upd("from_location")}
                className="h-8"
                data-ocid="edit.from.input"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">To</Label>
              <Input
                value={form.to_location}
                onChange={upd("to_location")}
                className="h-8"
                data-ocid="edit.to.input"
              />
            </div>
          </div>

          <Separator />

          {/* Party */}
          <p className="text-xs font-semibold uppercase text-muted-foreground tracking-wide">
            Party Details
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Party Name</Label>
              <Input
                value={form.party_name}
                onChange={upd("party_name")}
                className="h-8"
                data-ocid="edit.party_name.input"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Party Rate</Label>
              <Input
                type="number"
                value={form.party_rate}
                onChange={upd("party_rate")}
                className="h-8"
                data-ocid="edit.party_rate.input"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Party Advance</Label>
              <Input
                type="number"
                value={form.party_advance}
                onChange={upd("party_advance")}
                className="h-8"
                data-ocid="edit.party_advance.input"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Party Advance Date</Label>
              <Input
                type="date"
                value={form.party_advance_date}
                onChange={upd("party_advance_date")}
                className="h-8"
                data-ocid="edit.party_advance_date.input"
              />
            </div>
            <div className="space-y-1 col-span-2">
              <Label className="text-xs">Party Advance Proof</Label>
              {form.party_advance_proof ? (
                <div className="relative rounded-md overflow-hidden border border-border">
                  <img
                    src={form.party_advance_proof}
                    alt="Party Proof"
                    className="w-full h-28 object-cover"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setForm((p) => ({ ...p, party_advance_proof: "" }))
                    }
                    className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => partyProofRef.current?.click()}
                  data-ocid="edit.party_proof.upload_button"
                  className="flex items-center gap-2 w-full h-8 px-3 rounded-md border border-dashed border-border text-xs text-muted-foreground hover:bg-muted/50"
                >
                  Upload Screenshot
                </button>
              )}
              <input
                ref={partyProofRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageFile("party_advance_proof")}
              />
            </div>
          </div>

          <Separator />

          {/* Owner */}
          <p className="text-xs font-semibold uppercase text-muted-foreground tracking-wide">
            Owner Details
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Owner Name</Label>
              <Input
                value={form.owner_name}
                onChange={upd("owner_name")}
                className="h-8"
                data-ocid="edit.owner_name.input"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Owner Rate</Label>
              <Input
                type="number"
                value={form.owner_rate}
                onChange={upd("owner_rate")}
                className="h-8"
                data-ocid="edit.owner_rate.input"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Owner Advance</Label>
              <Input
                type="number"
                value={form.owner_advance}
                onChange={upd("owner_advance")}
                className="h-8"
                data-ocid="edit.owner_advance.input"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Owner Advance Date</Label>
              <Input
                type="date"
                value={form.owner_advance_date}
                onChange={upd("owner_advance_date")}
                className="h-8"
                data-ocid="edit.owner_advance_date.input"
              />
            </div>
            <div className="space-y-1 col-span-2">
              <Label className="text-xs">Owner Advance Proof</Label>
              {form.owner_advance_proof ? (
                <div className="relative rounded-md overflow-hidden border border-border">
                  <img
                    src={form.owner_advance_proof}
                    alt="Owner Proof"
                    className="w-full h-28 object-cover"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setForm((p) => ({ ...p, owner_advance_proof: "" }))
                    }
                    className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => ownerProofRef.current?.click()}
                  data-ocid="edit.owner_proof.upload_button"
                  className="flex items-center gap-2 w-full h-8 px-3 rounded-md border border-dashed border-border text-xs text-muted-foreground hover:bg-muted/50"
                >
                  Upload Screenshot
                </button>
              )}
              <input
                ref={ownerProofRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageFile("owner_advance_proof")}
              />
            </div>
          </div>

          <Separator />

          <div className="space-y-1">
            <Label className="text-xs">Comment / Note</Label>
            <Textarea
              value={form.comment}
              onChange={upd("comment")}
              className="min-h-[60px] resize-none"
              data-ocid="edit.comment.textarea"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            data-ocid="records.edit.cancel_button"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={updateEntry.isPending}
            data-ocid="records.edit.save_button"
          >
            {updateEntry.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---- Row ----
interface RowProps {
  entry: TransportEntry;
  index: number;
  onDelete: (billNo: bigint) => void;
  onToggleOwnerPaid: (billNo: bigint) => void;
  onTogglePartyPaid: (billNo: bigint) => void;
  isDeleting: boolean;
}

function EntryRow({
  entry,
  index,
  onDelete,
  onToggleOwnerPaid,
  onTogglePartyPaid,
  isDeleting,
}: RowProps) {
  const [editOpen, setEditOpen] = useState(false);

  return (
    <>
      <TableRow className="shimmer-row" data-ocid="records.row">
        {/* Bill No */}
        <TableCell className="py-4 px-4">
          <span className="inline-block bg-primary/10 text-primary font-mono font-bold text-base px-3 py-1 rounded-md tracking-wide">
            DFC-{entry.bill_no.toString().padStart(4, "0")}
          </span>
        </TableCell>

        {/* Date */}
        <TableCell className="py-4 px-4 text-base font-semibold whitespace-nowrap">
          {entry.date}
        </TableCell>

        {/* Gadi */}
        <TableCell className="py-4 px-4">
          <Badge
            variant="outline"
            className="font-mono font-bold text-sm px-3 py-1"
          >
            {entry.gadi_number}
          </Badge>
        </TableCell>

        {/* Route */}
        <TableCell className="py-4 px-4">
          <div className="flex flex-col gap-1 min-w-[120px]">
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                From
              </span>
              <span className="text-sm font-semibold text-foreground">
                {entry.from_location}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                To
              </span>
              <span className="text-sm font-semibold text-foreground">
                {entry.to_location}
              </span>
            </div>
          </div>
        </TableCell>

        {/* Party */}
        <TableCell className="py-4 px-4 text-base font-bold">
          {entry.party_name}
        </TableCell>

        {/* Party Balance */}
        <TableCell className="py-4 px-4 text-right">
          <PartyBalanceCell
            rate={entry.party_rate}
            advance={entry.party_advance}
            advanceDate={entry.party_advance_date}
            advanceProof={entry.party_advance_proof}
            partyPaid={entry.party_paid || false}
            onTogglePaid={() => onTogglePartyPaid(entry.bill_no)}
          />
        </TableCell>

        {/* Owner */}
        <TableCell className="py-4 px-4 text-base font-bold">
          {entry.owner_name}
        </TableCell>

        {/* Owner Balance */}
        <TableCell className="py-4 px-4 text-right">
          <OwnerBalanceCell
            rate={entry.owner_rate}
            advance={entry.owner_advance}
            advanceDate={entry.owner_advance_date}
            advanceProof={entry.owner_advance_proof}
            ownerPaid={entry.owner_paid || false}
            onTogglePaid={() => onToggleOwnerPaid(entry.bill_no)}
          />
        </TableCell>

        {/* Commission */}
        <TableCell className="py-4 px-4 text-right">
          <CommissionBadge />
        </TableCell>

        {/* Comment */}
        <TableCell className="py-4 px-4 text-sm text-muted-foreground max-w-[180px] truncate">
          {entry.comment || "-"}
        </TableCell>

        {/* Actions */}
        <TableCell className="py-4 px-4">
          <div className="flex items-center gap-1">
            {/* Edit */}
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-muted-foreground hover:text-primary hover:bg-primary/10"
              onClick={() => setEditOpen(true)}
              data-ocid={`records.edit_button.${index}`}
            >
              <Pencil className="w-4 h-4" />
            </Button>

            {/* LR PDF */}
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-xs text-emerald-700 hover:text-emerald-900 hover:bg-emerald-50 font-semibold"
              onClick={() => downloadLR(entry)}
              data-ocid={`records.lr_pdf.button.${index}`}
              title="Download LR PDF"
            >
              <FileText className="w-3.5 h-3.5 mr-1" />
              LR
            </Button>

            {/* Party Bill PDF */}
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-xs text-emerald-700 hover:text-emerald-900 hover:bg-emerald-50 font-semibold"
              onClick={() => downloadBill(entry)}
              data-ocid={`records.party_bill.button.${index}`}
              title="Download Party Bill PDF"
            >
              <FileText className="w-3.5 h-3.5 mr-1" />
              Bill
            </Button>

            {/* Loading Slip PDF */}
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-xs text-red-700 hover:text-red-900 hover:bg-red-50 font-semibold"
              onClick={() => downloadLoadingSlip(entry)}
              data-ocid={`records.loading_slip.button.${index}`}
              title="Download Loading Slip PDF"
            >
              <FileText className="w-3.5 h-3.5 mr-1" />
              Slip
            </Button>

            {/* Delete */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  disabled={isDeleting}
                  data-ocid={`records.delete_button.${index}`}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent data-ocid="records.dialog">
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    Delete Entry DFC-{entry.bill_no.toString().padStart(4, "0")}
                    ?
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
          </div>
        </TableCell>
      </TableRow>

      <EditDialog
        entry={entry}
        open={editOpen}
        onClose={() => setEditOpen(false)}
      />
    </>
  );
}

export default function RecordsTable() {
  const { data: entries = [], isLoading, isError } = useGetAllEntries();
  const deleteEntry = useDeleteEntry();
  const toggleOwnerPaid = useToggleOwnerPaid();
  const togglePartyPaid = useTogglePartyPaid();
  const [deletingId, setDeletingId] = useState<bigint | null>(null);

  const totalCommission = entries.length * COMMISSION_PER_GADI;

  const handleDelete = async (billNo: bigint) => {
    setDeletingId(billNo);
    try {
      const success = await deleteEntry.mutateAsync(billNo);
      if (success) toast.success("Entry deleted.");
      else toast.error("Failed to delete entry.");
    } catch {
      toast.error("An error occurred while deleting.");
    } finally {
      setDeletingId(null);
    }
  };

  const sorted = [...entries].sort((a, b) => Number(b.bill_no - a.bill_no));

  return (
    <div className="space-y-5">
      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
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
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                  {label}
                </p>
                <Icon
                  className={`w-4 h-4 ${highlight ? "text-accent" : "text-muted-foreground"}`}
                />
              </div>
              <p
                className={`font-display font-bold text-2xl leading-tight ${highlight ? "text-accent" : "text-foreground"}`}
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
          <CardTitle className="font-display text-xl flex items-center gap-2">
            <TableProperties className="w-5 h-5 text-primary" />
            Transport Records
          </CardTitle>
          <CardDescription className="text-sm">
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
                    <TableHead className="font-bold text-sm uppercase tracking-wide px-4 py-3 w-28">
                      Bill No
                    </TableHead>
                    <TableHead className="font-bold text-sm uppercase tracking-wide px-4 py-3">
                      Date
                    </TableHead>
                    <TableHead className="font-bold text-sm uppercase tracking-wide px-4 py-3">
                      Gadi
                    </TableHead>
                    <TableHead className="font-bold text-sm uppercase tracking-wide px-4 py-3 min-w-[140px]">
                      Route
                    </TableHead>
                    <TableHead className="font-bold text-sm uppercase tracking-wide px-4 py-3">
                      Party
                    </TableHead>
                    <TableHead className="font-bold text-sm uppercase tracking-wide px-4 py-3 text-right min-w-[180px]">
                      Party Balance
                    </TableHead>
                    <TableHead className="font-bold text-sm uppercase tracking-wide px-4 py-3">
                      Owner
                    </TableHead>
                    <TableHead className="font-bold text-sm uppercase tracking-wide px-4 py-3 text-right min-w-[200px]">
                      Owner Balance
                    </TableHead>
                    <TableHead className="font-bold text-sm uppercase tracking-wide px-4 py-3 text-right">
                      Commission
                    </TableHead>
                    <TableHead className="font-bold text-sm uppercase tracking-wide px-4 py-3">
                      Comment
                    </TableHead>
                    <TableHead className="w-24 px-4 py-3" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sorted.map((entry, idx) => (
                    <EntryRow
                      key={entry.bill_no.toString()}
                      entry={entry}
                      index={idx + 1}
                      onDelete={handleDelete}
                      onToggleOwnerPaid={(billNo) =>
                        toggleOwnerPaid.mutate(billNo)
                      }
                      onTogglePartyPaid={(billNo) =>
                        togglePartyPaid.mutate(billNo)
                      }
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
