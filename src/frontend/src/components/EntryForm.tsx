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
import { Building2, Loader2, MessageSquare, Truck, User } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useActor } from "../hooks/useActor";
import { useAddEntry } from "../hooks/useQueries";

interface EntryFormProps {
  onSuccess?: () => void;
}

export default function EntryForm({ onSuccess }: EntryFormProps) {
  const addEntry = useAddEntry();
  const { actor, isFetching: isActorLoading } = useActor();

  const today = new Date().toISOString().split("T")[0];

  const [form, setForm] = useState({
    date: today,
    gadiNumber: "",
    fromLocation: "",
    toLocation: "",
    partyName: "",
    partyRate: "",
    partyAdvance: "",
    ownerName: "",
    ownerRate: "",
    ownerAdvance: "",
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
      ownerName: "",
      ownerRate: "",
      ownerAdvance: "",
      comment: "",
    });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!actor) {
      toast.error("Server se connect ho raha hai, thodi der mein try karein.");
      return;
    }

    const partyRate = Number.parseFloat(form.partyRate) || 0;
    const partyAdvance = Number.parseFloat(form.partyAdvance) || 0;
    const ownerRate = Number.parseFloat(form.ownerRate) || 0;
    const ownerAdvance = Number.parseFloat(form.ownerAdvance) || 0;
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
        ownerName: form.ownerName,
        ownerRate,
        ownerAdvance,
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

  const isConnecting = isActorLoading && !actor;
  const isDisabled = addEntry.isPending || isConnecting;

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
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
            </div>
          </div>

          <Separator />

          {/* Owner Info */}
          <div>
            <h3 className="font-display text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
              <Truck className="w-3.5 h-3.5" />
              Owner Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
              disabled={isDisabled}
              className="bg-primary text-primary-foreground hover:bg-primary/90 px-8"
              data-ocid="entry.submit_button"
            >
              {isConnecting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connecting...
                </>
              ) : addEntry.isPending ? (
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
