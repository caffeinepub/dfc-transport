import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  Building2,
  Camera,
  Loader2,
  MessageSquare,
  Truck,
  User,
  X,
} from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { useAddEntry } from "../hooks/useQueries";

interface EntryFormProps {
  onSuccess?: () => void;
}

const COMMISSION = 2000;

function ImageUploadField({
  label,
  value,
  onChange,
  ocid,
}: {
  label: string;
  value: string;
  onChange: (base64: string) => void;
  ocid: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => onChange(reader.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium">{label}</Label>
      {value ? (
        <div className="relative rounded-md overflow-hidden border border-border">
          <img src={value} alt={label} className="w-full h-24 object-cover" />
          <button
            type="button"
            onClick={() => {
              onChange("");
              if (inputRef.current) inputRef.current.value = "";
            }}
            className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5 hover:bg-black/80"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          data-ocid={ocid}
          className="flex items-center gap-2 w-full h-9 px-3 rounded-md border border-dashed border-border text-xs text-muted-foreground hover:bg-muted/50 transition-colors"
        >
          <Camera className="w-3.5 h-3.5" />
          Upload Screenshot
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
      />
    </div>
  );
}

export default function EntryForm({ onSuccess }: EntryFormProps) {
  const addEntry = useAddEntry();

  const today = new Date().toISOString().split("T")[0];

  const [form, setForm] = useState({
    date: today,
    gadiNumber: "",
    fromLocation: "",
    toLocation: "",
    partyName: "",
    partyRate: "",
    partyAdvance: "",
    partyAdvanceDate: "",
    partyAdvanceProof: "",
    ownerName: "",
    ownerRate: "",
    ownerAdvance: "",
    ownerAdvanceDate: "",
    ownerAdvanceProof: "",
    comment: "",
  });

  const update =
    (field: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const resetForm = () =>
    setForm({
      date: today,
      gadiNumber: "",
      fromLocation: "",
      toLocation: "",
      partyName: "",
      partyRate: "",
      partyAdvance: "",
      partyAdvanceDate: "",
      partyAdvanceProof: "",
      ownerName: "",
      ownerRate: "",
      ownerAdvance: "",
      ownerAdvanceDate: "",
      ownerAdvanceProof: "",
      comment: "",
    });

  const partyRate = Number.parseFloat(form.partyRate) || 0;
  const partyAdvance = Number.parseFloat(form.partyAdvance) || 0;
  const ownerRate = Number.parseFloat(form.ownerRate) || 0;
  const ownerAdvance = Number.parseFloat(form.ownerAdvance) || 0;
  const partyBalance = partyRate - partyAdvance;
  const ownerBalance = ownerRate - ownerAdvance;
  const ownerBalanceAfterCommission = ownerBalance - COMMISSION;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const entryDate = form.date || today;

    addEntry.mutate(
      {
        date: entryDate,
        gadiNumber: form.gadiNumber,
        fromLocation: form.fromLocation,
        toLocation: form.toLocation,
        partyName: form.partyName,
        partyRate,
        partyAdvance,
        partyAdvanceDate: form.partyAdvanceDate || undefined,
        partyAdvanceProof: form.partyAdvanceProof || undefined,
        ownerName: form.ownerName,
        ownerRate,
        ownerAdvance,
        ownerAdvanceDate: form.ownerAdvanceDate || undefined,
        ownerAdvanceProof: form.ownerAdvanceProof || undefined,
        comment: form.comment,
      },
      {
        onSuccess: () => {
          toast.success("Entry save ho gayi!");
          resetForm();
          onSuccess?.();
        },
        onError: (err) => {
          console.error("Save error:", err);
          toast.error("Entry save nahi hui. Dobara try karein.");
        },
      },
    );
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card className="shadow-card border-border">
        <CardHeader className="pb-4">
          <CardTitle className="font-display text-lg flex items-center gap-2">
            <Truck className="w-5 h-5 text-primary" />
            Add Daily Transport Entry
          </CardTitle>
          <CardDescription>
            Fill in transport details to create a new bill entry.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Trip Info */}
          <div>
            <h3 className="font-display text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
              <Building2 className="w-3.5 h-3.5" />
              Trip Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="date" className="text-xs font-medium">
                  Date
                </Label>
                <Input
                  id="date"
                  type="date"
                  value={form.date}
                  onChange={update("date")}
                  data-ocid="entry.date.input"
                  className="h-9"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="gadi" className="text-xs font-medium">
                  Gadi Number
                </Label>
                <Input
                  id="gadi"
                  placeholder="e.g. RJ14-GB-1234"
                  value={form.gadiNumber}
                  onChange={update("gadiNumber")}
                  data-ocid="entry.gadi.input"
                  className="h-9"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="from" className="text-xs font-medium">
                  From
                </Label>
                <Input
                  id="from"
                  placeholder="Origin city"
                  value={form.fromLocation}
                  onChange={update("fromLocation")}
                  data-ocid="entry.from.input"
                  className="h-9"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="to" className="text-xs font-medium">
                  To
                </Label>
                <Input
                  id="to"
                  placeholder="Destination city"
                  value={form.toLocation}
                  onChange={update("toLocation")}
                  data-ocid="entry.to.input"
                  className="h-9"
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Party Info */}
          <div>
            <h3 className="font-display text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
              <User className="w-3.5 h-3.5" />
              Party Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="partyName" className="text-xs font-medium">
                  Party Name
                </Label>
                <Input
                  id="partyName"
                  placeholder="Party / Client name"
                  value={form.partyName}
                  onChange={update("partyName")}
                  data-ocid="entry.party_name.input"
                  className="h-9"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="partyRate" className="text-xs font-medium">
                  Party Rate (Rs)
                </Label>
                <Input
                  id="partyRate"
                  type="number"
                  placeholder="0"
                  min="0"
                  step="1"
                  value={form.partyRate}
                  onChange={update("partyRate")}
                  data-ocid="entry.party_rate.input"
                  className="h-9"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">
                  Party Balance (Rs)
                </Label>
                <div
                  data-ocid="entry.party_balance.panel"
                  className={`h-9 px-3 flex items-center rounded-md border text-sm font-semibold ${
                    partyBalance < 0
                      ? "bg-red-50 border-red-200 text-red-600"
                      : "bg-green-50 border-green-200 text-green-700"
                  }`}
                >
                  ₹{partyBalance.toLocaleString("en-IN")}
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="partyAdvance" className="text-xs font-medium">
                  Party Advance (Rs)
                </Label>
                <Input
                  id="partyAdvance"
                  type="number"
                  placeholder="0"
                  min="0"
                  step="1"
                  value={form.partyAdvance}
                  onChange={update("partyAdvance")}
                  data-ocid="entry.party_advance.input"
                  className="h-9"
                />
              </div>
              <div className="space-y-1.5">
                <Label
                  htmlFor="partyAdvanceDate"
                  className="text-xs font-medium"
                >
                  Party Advance Date
                </Label>
                <Input
                  id="partyAdvanceDate"
                  type="date"
                  value={form.partyAdvanceDate}
                  onChange={update("partyAdvanceDate")}
                  data-ocid="entry.party_advance_date.input"
                  className="h-9"
                />
              </div>
              <ImageUploadField
                label="Party Advance Proof"
                value={form.partyAdvanceProof}
                onChange={(v) =>
                  setForm((p) => ({ ...p, partyAdvanceProof: v }))
                }
                ocid="entry.party_advance_proof.upload_button"
              />
            </div>
          </div>

          <Separator />

          {/* Owner Info */}
          <div>
            <h3 className="font-display text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
              <Truck className="w-3.5 h-3.5" />
              Owner Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="ownerName" className="text-xs font-medium">
                  Owner Name
                </Label>
                <Input
                  id="ownerName"
                  placeholder="Vehicle owner name"
                  value={form.ownerName}
                  onChange={update("ownerName")}
                  data-ocid="entry.owner_name.input"
                  className="h-9"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ownerRate" className="text-xs font-medium">
                  Owner Rate (Rs)
                </Label>
                <Input
                  id="ownerRate"
                  type="number"
                  placeholder="0"
                  min="0"
                  step="1"
                  value={form.ownerRate}
                  onChange={update("ownerRate")}
                  data-ocid="entry.owner_rate.input"
                  className="h-9"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Owner Balance</Label>
                <div
                  data-ocid="entry.owner_balance.panel"
                  className="flex flex-col gap-1"
                >
                  <div
                    className={`h-9 px-3 flex items-center rounded-md border text-sm font-semibold ${
                      ownerBalance < 0
                        ? "bg-red-50 border-red-200 text-red-600"
                        : "bg-green-50 border-green-200 text-green-700"
                    }`}
                  >
                    ₹{ownerBalance.toLocaleString("en-IN")}
                  </div>
                  <div
                    className={`px-3 py-1 flex items-center justify-between rounded-md border text-xs font-semibold ${
                      ownerBalanceAfterCommission < 0
                        ? "bg-red-50 border-red-200 text-red-500"
                        : "bg-orange-50 border-orange-200 text-orange-600"
                    }`}
                  >
                    <span className="text-[10px] font-normal text-muted-foreground">
                      After ₹2000 cut:
                    </span>
                    <span>
                      ₹{ownerBalanceAfterCommission.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ownerAdvance" className="text-xs font-medium">
                  Owner Advance (Rs)
                </Label>
                <Input
                  id="ownerAdvance"
                  type="number"
                  placeholder="0"
                  min="0"
                  step="1"
                  value={form.ownerAdvance}
                  onChange={update("ownerAdvance")}
                  data-ocid="entry.owner_advance.input"
                  className="h-9"
                />
              </div>
              <div className="space-y-1.5">
                <Label
                  htmlFor="ownerAdvanceDate"
                  className="text-xs font-medium"
                >
                  Owner Advance Date
                </Label>
                <Input
                  id="ownerAdvanceDate"
                  type="date"
                  value={form.ownerAdvanceDate}
                  onChange={update("ownerAdvanceDate")}
                  data-ocid="entry.owner_advance_date.input"
                  className="h-9"
                />
              </div>
              <ImageUploadField
                label="Owner Advance Proof"
                value={form.ownerAdvanceProof}
                onChange={(v) =>
                  setForm((p) => ({ ...p, ownerAdvanceProof: v }))
                }
                ocid="entry.owner_advance_proof.upload_button"
              />
            </div>
          </div>

          <Separator />

          {/* Comment */}
          <div>
            <h3 className="font-display text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
              <MessageSquare className="w-3.5 h-3.5" />
              Comment / Note
            </h3>
            <div className="space-y-1.5">
              <Label htmlFor="comment" className="text-xs font-medium">
                Note (Optional)
              </Label>
              <Textarea
                id="comment"
                placeholder="Agar koi galti ho ya note likhna ho to yahan likhein..."
                value={form.comment}
                onChange={update("comment")}
                data-ocid="entry.comment.textarea"
                className="min-h-[80px] resize-none"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              disabled={addEntry.isPending}
              className="bg-primary text-primary-foreground hover:bg-primary/90 px-8"
              data-ocid="entry.submit_button"
            >
              {addEntry.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Entry"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
