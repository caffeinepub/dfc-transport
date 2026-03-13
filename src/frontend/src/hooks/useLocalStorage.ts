// localStorage-based data store for DFC Transport

const STORAGE_KEY = "dfcData";

export interface LocalEntry {
  bill_no: bigint;
  date: string;
  gadi_number: string;
  from_location: string;
  to_location: string;
  party_name: string;
  party_rate: number;
  party_advance: number;
  owner_name: string;
  owner_rate: number;
  owner_advance: number;
  comment: string;
}

function serialize(entries: LocalEntry[]): string {
  return JSON.stringify(
    entries.map((e) => ({ ...e, bill_no: e.bill_no.toString() })),
  );
}

function deserialize(raw: string): LocalEntry[] {
  try {
    const arr = JSON.parse(raw);
    return arr.map((e: Record<string, unknown>) => ({
      ...e,
      bill_no: BigInt(e.bill_no as string),
      comment: (e.comment as string) || "",
    }));
  } catch {
    return [];
  }
}

export function getAllEntries(): LocalEntry[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  return deserialize(raw);
}

export function addEntry(params: {
  date: string;
  gadiNumber: string;
  fromLocation: string;
  toLocation: string;
  partyName: string;
  partyRate: number;
  partyAdvance: number;
  ownerName: string;
  ownerRate: number;
  ownerAdvance: number;
  comment: string;
}): LocalEntry {
  const entries = getAllEntries();
  const billNo = BigInt(entries.length + 1);
  const entry: LocalEntry = {
    bill_no: billNo,
    date: params.date,
    gadi_number: params.gadiNumber,
    from_location: params.fromLocation,
    to_location: params.toLocation,
    party_name: params.partyName,
    party_rate: params.partyRate,
    party_advance: params.partyAdvance,
    owner_name: params.ownerName,
    owner_rate: params.ownerRate,
    owner_advance: params.ownerAdvance,
    comment: params.comment,
  };
  entries.push(entry);
  localStorage.setItem(STORAGE_KEY, serialize(entries));
  return entry;
}

export function deleteEntry(billNo: bigint): boolean {
  const entries = getAllEntries();
  const filtered = entries.filter((e) => e.bill_no !== billNo);
  if (filtered.length === entries.length) return false;
  localStorage.setItem(STORAGE_KEY, serialize(filtered));
  return true;
}

export function getTotalCommission(): number {
  return getAllEntries().length * 2000;
}
