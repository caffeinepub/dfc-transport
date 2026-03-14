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

function numberToWords(num: number): string {
  if (num === 0) return "Zero";
  const ones = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];
  const tens = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];
  function convert(n: number): string {
    if (n < 20) return ones[n];
    if (n < 100)
      return tens[Math.floor(n / 10)] + (n % 10 ? ` ${ones[n % 10]}` : "");
    if (n < 1000)
      return `${ones[Math.floor(n / 100)]} Hundred${n % 100 ? ` ${convert(n % 100)}` : ""}`;
    if (n < 100000)
      return `${convert(Math.floor(n / 1000))} Thousand${n % 1000 ? ` ${convert(n % 1000)}` : ""}`;
    if (n < 10000000)
      return `${convert(Math.floor(n / 100000))} Lakh${n % 100000 ? ` ${convert(n % 100000)}` : ""}`;
    return `${convert(Math.floor(n / 10000000))} Crore${n % 10000000 ? ` ${convert(n % 10000000)}` : ""}`;
  }
  const intPart = Math.floor(Math.abs(num));
  return `${convert(intPart)} Only`;
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
  doc.line(135, 180, 200, 185);

  doc.setFontSize(9);
  doc.text("This is a computer generated Lorry Receipt.", 105, 198, {
    align: "center",
  });

  doc.save(`${bill}_LR.pdf`);
}

// ── INVOICE / PARTY BILL PDF (screenshot format) ──────────────────────────────
function downloadBill(entry: TransportEntry) {
  // biome-ignore lint/suspicious/noExplicitAny: jsPDF loaded via CDN
  const { jsPDF } = (window as any).jspdf;
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const bill = billLabel(entry.bill_no);
  const pageW = 210;
  const margin = 12;
  const contentW = pageW - margin * 2;

  const partyRate = entry.party_rate;
  const partyAdv = entry.party_advance;
  const partyBal = partyRate - partyAdv;
  const billNo = entry.bill_no.toString();

  // ── OUTER BORDER ────────────────────────────────────────────────────────────
  doc.setLineWidth(0.8);
  doc.rect(margin, 8, contentW, 275);

  // ── COMPANY NAME (red bold) ──────────────────────────────────────────────────
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(200, 0, 0);
  doc.text("DEEPANSHU FRIGHT CARRIER", pageW / 2, 18, { align: "center" });

  // ── TAG LINE ─────────────────────────────────────────────────────────────────
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(0, 0, 0);
  doc.text(
    "FLEET OWNERS & TRANSPORT CONTRACTORS & COMMISSION AGENT",
    pageW / 2,
    25,
    { align: "center" },
  );

  // ── ADDRESS ──────────────────────────────────────────────────────────────────
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text(
    "102, 1st FLOOR, RIDDHI ARCADE, NEAR MARUTI CHAMBER, STEEL MARKET, KALAMBOLI,",
    pageW / 2,
    30,
    { align: "center" },
  );
  doc.text(
    "NAVI MUMBAI-410218   E-mail: deepanshufrightcarrier@gmail.com",
    pageW / 2,
    35,
    { align: "center" },
  );
  doc.text("MOBILE NO.  9817783604 / 9817983604", pageW / 2, 40, {
    align: "center",
  });

  // ── INVOICE TITLE BAR ────────────────────────────────────────────────────────
  doc.setLineWidth(0.4);
  doc.setFillColor(240, 240, 240);
  doc.rect(margin, 43, contentW, 8, "FD");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  doc.text("INVOICE", pageW / 2, 49, { align: "center" });

  // ── M/S + BILL NO + DATE BOX ─────────────────────────────────────────────────
  // M/S on left
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("M/S.", margin + 2, 59);
  doc.setFont("helvetica", "normal");
  doc.text(entry.party_name || "-", margin + 12, 59);

  // Right side box for BILL NO
  doc.setLineWidth(0.3);
  doc.rect(pageW - margin - 60, 51, 60, 10);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("BILL NO :-", pageW - margin - 58, 58);
  doc.setFont("helvetica", "normal");
  doc.text(billNo, pageW - margin - 30, 58);

  // DATE box below
  doc.rect(pageW - margin - 60, 61, 60, 10);
  doc.setFont("helvetica", "bold");
  doc.text("DATE     :-", pageW - margin - 58, 68);
  doc.setFont("helvetica", "normal");
  doc.text(entry.date, pageW - margin - 30, 68);

  // ── TABLE HEADER ─────────────────────────────────────────────────────────────
  const tableTop = 73;
  const colWidths = [18, 15, 27, 59, 17, 17, 33]; // total=186=contentW // Date, LRNo, VehicleNo, Particulars, Weight, Rate, Amount
  const colX: number[] = [];
  let cx = margin;
  for (const w of colWidths) {
    colX.push(cx);
    cx += w;
  }
  const tableRight = cx;
  const rowH = 8;

  doc.setFillColor(230, 230, 230);
  doc.rect(margin, tableTop, contentW, rowH, "FD");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(0, 0, 0);
  const headers = [
    "Date",
    "L.R.No",
    "Vehicle No.",
    "PARTICULARS",
    "Weight",
    "Rate",
    "Amount",
  ];
  headers.forEach((h, i) => {
    const isRight = i >= 4;
    if (isRight) {
      doc.text(h, colX[i] + colWidths[i] - 2, tableTop + 5.5, {
        align: "right",
      });
    } else {
      doc.text(h, colX[i] + 2, tableTop + 5.5);
    }
  });
  // vertical lines for header
  for (let i = 1; i < colX.length; i++) {
    doc.line(colX[i], tableTop, colX[i], tableTop + rowH);
  }
  doc.line(tableRight, tableTop, tableRight, tableTop + rowH);

  // ── TABLE ROW(S) ─────────────────────────────────────────────────────────────
  // We print one main row per entry. Show route as Particulars.
  const particulars =
    `${entry.from_location} TO ${entry.to_location}`.toUpperCase();
  const dataRowH = 18;
  const rowTop = tableTop + rowH;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.rect(margin, rowTop, contentW, dataRowH);

  // Date
  doc.text(entry.date, colX[0] + 2, rowTop + 6);
  // LR No (blank or bill)
  doc.text("", colX[1] + 2, rowTop + 6);
  // Vehicle No
  doc.setFont("helvetica", "bold");
  doc.text(entry.gadi_number || "-", colX[2] + 2, rowTop + 6);
  doc.setFont("helvetica", "normal");
  // Particulars
  const partLines = doc.splitTextToSize(particulars, colWidths[3] - 4);
  doc.text(partLines, colX[3] + 2, rowTop + 5);
  // Weight
  doc.text("Fix", colX[4] + colWidths[4] - 2, rowTop + 6, { align: "right" });
  // Rate
  doc.text("Fix", colX[5] + colWidths[5] - 2, rowTop + 6, { align: "right" });
  // Amount
  doc.setFont("helvetica", "bold");
  doc.text(
    `${partyRate.toLocaleString("en-IN")}.00`,
    colX[6] + colWidths[6] - 2,
    rowTop + 6,
    { align: "right" },
  );
  doc.setFont("helvetica", "normal");

  // vertical lines for data row
  for (let i = 1; i < colX.length; i++) {
    doc.line(colX[i], rowTop, colX[i], rowTop + dataRowH);
  }
  doc.line(tableRight, rowTop, tableRight, rowTop + dataRowH);

  // ── TOTALS SECTION ───────────────────────────────────────────────────────────
  const afterTable = rowTop + dataRowH;
  const totalsX = colX[5]; // starts at Rate column
  const totalsW = tableRight - totalsX;
  const totRowH = 8;

  // EPAN on left
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.rect(margin, afterTable, totalsX - margin, totRowH * 3);
  doc.text("EPAN NO :- HFVPD2026A", margin + 2, afterTable + 5.5);

  // Total
  doc.rect(totalsX, afterTable, totalsW, totRowH);
  doc.text("Total", totalsX + 2, afterTable + 5.5);
  doc.setFont("helvetica", "normal");
  doc.text(
    `${partyRate.toLocaleString("en-IN")}.00`,
    tableRight - 2,
    afterTable + 5.5,
    { align: "right" },
  );

  // Less Adv
  doc.setFont("helvetica", "bold");
  doc.rect(totalsX, afterTable + totRowH, totalsW, totRowH);
  doc.text("Less Adv.", totalsX + 2, afterTable + totRowH + 5.5);
  doc.setFont("helvetica", "normal");
  doc.text(
    `${partyAdv.toLocaleString("en-IN")}.00`,
    tableRight - 2,
    afterTable + totRowH + 5.5,
    { align: "right" },
  );

  // Balance
  doc.setFont("helvetica", "bold");
  doc.rect(totalsX, afterTable + totRowH * 2, totalsW, totRowH);
  doc.text("Balance", totalsX + 2, afterTable + totRowH * 2 + 5.5);
  doc.setFont("helvetica", "normal");
  doc.text(
    `${partyBal.toLocaleString("en-IN")}.00`,
    tableRight - 2,
    afterTable + totRowH * 2 + 5.5,
    { align: "right" },
  );

  // ── RS IN WORDS ──────────────────────────────────────────────────────────────
  const wordsY = afterTable + totRowH * 3;
  doc.setLineWidth(0.3);
  doc.rect(margin, wordsY, contentW, 10);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("RS. IN WORDS :-", margin + 2, wordsY + 4);
  doc.setFont("helvetica", "normal");
  doc.text(numberToWords(partyBal), margin + 38, wordsY + 4);

  // ── BANK DETAILS + SIGNATURE ─────────────────────────────────────────────────
  const bankY = wordsY + 10;
  const bankW = 90;
  doc.rect(margin, bankY, bankW, 42);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("Bank Details.", margin + bankW / 2, bankY + 6, { align: "center" });
  doc.line(margin, bankY + 8, margin + bankW, bankY + 8);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text("BANK NAME - HDFCBANK", margin + 4, bankY + 15);
  doc.line(margin, bankY + 17, margin + bankW, bankY + 17);
  doc.text("BRANCH : KALAMBOLI", margin + 4, bankY + 24);
  doc.line(margin, bankY + 26, margin + bankW, bankY + 26);
  doc.text("ACCOUNT No- 50200110750491", margin + 4, bankY + 33);
  doc.line(margin, bankY + 35, margin + bankW, bankY + 35);
  doc.text("IFSC CODE- HDFC0002822", margin + 4, bankY + 41);

  // For DFC on right
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(180, 0, 0);
  doc.text("For . DEEPANSHU FRIGHT CARRIER", pageW - margin - 2, bankY + 12, {
    align: "right",
  });
  doc.setTextColor(0, 0, 0);

  // ── AUTHORISED SIGNATORY ─────────────────────────────────────────────────────
  const sigY = bankY + 42;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("AUTHORISED  SIGNATORY", pageW - margin - 2, sigY, {
    align: "right",
  });

  // ── NOTES SECTION ────────────────────────────────────────────────────────────
  const noteY = sigY + 6;
  doc.rect(margin, noteY, contentW, 28);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text("Subject To Mumbai Jurisdiction", margin + 2, noteY + 5);
  doc.setFont("helvetica", "normal");
  doc.text("Note :", margin + 2, noteY + 10);
  doc.text(
    "1. Payment should be made within 15 Days From the date of Bill",
    margin + 4,
    noteY + 15,
  );
  doc.text(
    "2. Interest will be charged @ 18% P.A. if Bill is Not paid within 15 Days.",
    margin + 4,
    noteY + 20,
  );
  doc.text(
    "3. Please Pay by Account Payee Cheque Only.",
    margin + 4,
    noteY + 25,
  );

  doc.save(`${bill}_Invoice.pdf`);
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

  // ── LOGO (top-left) ──────────────────────────────────────────────
  try {
    await new Promise<void>((resolve) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        doc.addImage(img, "PNG", margin, 6, 28, 22);
        resolve();
      };
      img.onerror = () => resolve();
      img.src = "/assets/uploads/IMG_20260302_162344-1.png";
    });
  } catch (_) {}

  // ── COMPANY NAME (red, bold, large) ──────────────────────────────
  doc.setTextColor(180, 0, 0);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("DEEPANSHU FRIGHT CARRIER", pageW / 2, 14, { align: "center" });

  // ── SISTER CONCERN ───────────────────────────────────────────────
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("SISTER CONCERN ; SHIVANI ROADLINES", pageW / 2, 21, {
    align: "center",
  });

  // ── ADDRESS / CONTACT ────────────────────────────────────────────
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.text(
    "Mumbai Office : 102 , Ridhi Arcade , Plot No.857 C , Near RTO Office , Steel Market , Kalamboli , Mumbai 410218",
    pageW / 2,
    27,
    { align: "center" },
  );
  doc.text(
    "Mobile No. 9817783604 / 9817983604    Email_id : deepanshufrightcarrier@gmail.com",
    pageW / 2,
    32,
    { align: "center" },
  );

  // ── DIVIDER ──────────────────────────────────────────────────────
  doc.setLineWidth(0.8);
  doc.line(margin, 36, pageW - margin, 36);

  // ── LOADING SLIP TITLE ───────────────────────────────────────────
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("Loading Slip", pageW / 2, 43, { align: "center" });
  doc.setLineWidth(0.4);
  doc.line(pageW / 2 - 20, 45, pageW / 2 + 20, 45);

  // ── SLIP NO / DATE ───────────────────────────────────────────────
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  let y = 54;
  doc.text("Loading slip  No.", margin, y);
  doc.text(bill, margin + 38, y);
  doc.setFont("helvetica", "bold");
  doc.text("Date", pageW - margin - 40, y);
  doc.setFont("helvetica", "normal");
  doc.text(entry.date, pageW - margin - 25, y);

  // ── TO / M/S ─────────────────────────────────────────────────────
  y += 9;
  doc.text("TO ,", margin, y);
  y += 6;
  doc.text("M/S ,", margin, y);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text(entry.party_name || "-", margin + 18, y);
  const partyNameWidth = doc.getTextWidth(entry.party_name || "-");
  doc.setLineWidth(0.3);
  doc.line(margin + 18, y + 1, margin + 18 + partyNameWidth + 4, y + 1);

  // ── DEAR SIR PARAGRAPH ───────────────────────────────────────────
  y += 12;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("Dear Sir,", margin, y);
  y += 6;
  const para1 =
    "        As  Per Telephonic / Personal  Discussion  with  you, here we";
  const para2 = "are sending  herewith  our Vehicle no ";
  const vehicleNo = entry.gadi_number || "-";
  const para3 = " of Owner Name";
  const para4 = `${entry.owner_name || "__________________"}  with Driver  __________________`;
  const para5 = `from Station  ${entry.from_location || "__________"}    To    ${entry.to_location || "__________"}`;
  const para6 =
    "having mobile no  __________________  kindly load the same & handover the";
  const para7 = "necessary  transit paper  for the same  & obliged.";

  doc.text(para1, margin, y);
  y += 5.5;
  doc.text(para2, margin, y);
  const p2w = doc.getTextWidth(para2);
  doc.setFont("helvetica", "bold");
  doc.text(vehicleNo, margin + p2w, y);
  const vw = doc.getTextWidth(vehicleNo);
  doc.setFont("helvetica", "normal");
  doc.text(para3, margin + p2w + vw, y);
  y += 5.5;
  doc.text(para4, margin, y);
  y += 5.5;
  doc.setFont("helvetica", "bold");
  doc.text(para5, margin, y);
  doc.setFont("helvetica", "normal");
  y += 5.5;
  doc.text(para6, margin, y);
  y += 5.5;
  doc.text(para7, margin, y);

  // ── FREIGHT DESCRIPTION TABLE ─────────────────────────────────────
  y += 8;
  const tableX = margin;
  const tableW = pageW - margin * 2;
  const leftW = tableW * 0.55;

  doc.setLineWidth(0.5);
  doc.rect(tableX, y, tableW, 46);

  doc.setFillColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.rect(tableX, y, tableW, 8);
  doc.text("FREIGHT DESCRIPTION", tableX + leftW / 2, y + 5.5, {
    align: "center",
  });
  doc.line(tableX + leftW, y, tableX + leftW, y + 46);

  doc.setFontSize(9);
  doc.text("Said to contain", tableX + 4, y + 13);
  doc.text("As per Challan", tableX + leftW * 0.55, y + 13);
  doc.line(tableX, y + 16, tableX + leftW, y + 16);

  doc.setFont("helvetica", "normal");
  doc.text("DETENTION RS.", tableX + leftW + 4, y + 13);
  doc.line(tableX + leftW + 38, y + 14, tableX + tableW - 4, y + 14);

  doc.text("GUARANTEE WT", tableX + leftW + 4, y + 23);
  doc.line(tableX + leftW + 38, y + 24, tableX + tableW - 4, y + 24);

  doc.text("ACTUAL  WT", tableX + leftW + 4, y + 33);
  doc.line(tableX + leftW + 38, y + 34, tableX + tableW - 4, y + 34);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("FREIGHT RS.", tableX + 4, y + 23);
  doc.setFont("helvetica", "normal");
  doc.text(
    `${freight.toLocaleString("en-IN")}/-`,
    tableX + leftW * 0.55,
    y + 23,
  );
  doc.line(tableX, y + 26, tableX + leftW, y + 26);

  doc.setFont("helvetica", "bold");
  doc.text("ADVANCE RS.", tableX + 4, y + 33);
  doc.setFont("helvetica", "normal");
  doc.text(
    `${advance.toLocaleString("en-IN")}/-`,
    tableX + leftW * 0.55,
    y + 33,
  );
  doc.line(tableX, y + 36, tableX + leftW, y + 36);

  doc.setFont("helvetica", "bold");
  doc.text("BALANCE RS.", tableX + 4, y + 43);
  doc.setFont("helvetica", "normal");
  doc.text(
    `${balance.toLocaleString("en-IN")}/-`,
    tableX + leftW * 0.55,
    y + 43,
  );

  // ── PAYMENT ROW ──────────────────────────────────────────────────
  y += 46;
  doc.setLineWidth(0.5);
  doc.rect(tableX, y, tableW, 10);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("Payment Done at", tableX + 4, y + 6.5);
  doc.setFont("helvetica", "normal");
  doc.text("IMPS / NEFT", tableX + 38, y + 6.5);
  doc.rect(tableX + 72, y + 2, 5, 5);
  doc.text("To Pay", tableX + 79, y + 6.5);
  doc.rect(tableX + 100, y + 2, 5, 5);
  doc.text("Adv- Balance", tableX + 107, y + 6.5);

  // ── THANKING YOU / FOR COMPANY ───────────────────────────────────
  y += 16;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("Thanking You", tableX, y);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(180, 0, 0);
  doc.text("For   DEEPANSHU FRIGHT CARRIER", pageW - margin, y, {
    align: "right",
  });
  doc.setTextColor(0, 0, 0);

  // ── PAN NO ───────────────────────────────────────────────────────
  y += 8;
  doc.setTextColor(180, 0, 0);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("PAN NO:- HFVPD2026A", tableX, y);
  doc.setTextColor(0, 0, 0);

  // ── BANK DETAILS ─────────────────────────────────────────────────
  y += 7;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("Bank Detals :", tableX, y);
  doc.setFont("helvetica", "normal");
  y += 6;
  doc.text("Bank Name : HDFC BANK", tableX, y);
  y += 5.5;
  doc.text("Bank A/c No.50200110750491", tableX, y);
  y += 5.5;
  doc.text("IFSC CODE : HDFC0002822", tableX, y);

  const sigY = y + 2;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("Authorised Signatory", pageW - margin, sigY, { align: "right" });

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

            {/* Party Bill / Invoice PDF */}
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-xs text-blue-700 hover:text-blue-900 hover:bg-blue-50 font-semibold"
              onClick={() => downloadBill(entry)}
              data-ocid={`records.party_bill.button.${index}`}
              title="Download Invoice PDF"
            >
              <FileText className="w-3.5 h-3.5 mr-1" />
              Invoice
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
