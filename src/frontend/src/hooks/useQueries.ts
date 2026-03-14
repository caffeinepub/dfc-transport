import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useActor } from "./useActor";

export type TransportEntry = {
  bill_no: bigint;
  date: string;
  gadi_number: string;
  from_location: string;
  to_location: string;
  party_name: string;
  party_rate: number;
  party_advance: number;
  party_advance_date?: string;
  party_advance_proof?: string;
  owner_name: string;
  owner_rate: number;
  owner_advance: number;
  owner_advance_date?: string;
  owner_advance_proof?: string;
  comment: string;
  owner_paid?: boolean;
  party_paid?: boolean;
  created_at?: bigint;
};

export function useGetAllEntries() {
  const { actor } = useActor();
  return useQuery<TransportEntry[]>({
    queryKey: ["entries"],
    queryFn: async () => {
      if (!actor) return [];
      const entries = await actor.getAllEntries();
      return entries.map((e) => ({
        ...e,
        party_advance_date: e.party_advance_date || undefined,
        party_advance_proof: e.party_advance_proof || undefined,
        owner_advance_date: e.owner_advance_date || undefined,
        owner_advance_proof: e.owner_advance_proof || undefined,
      }));
    },
    enabled: !!actor,
  });
}

export function useGetTotalCommission() {
  const { actor } = useActor();
  return useQuery<number>({
    queryKey: ["totalCommission"],
    queryFn: async () => {
      if (!actor) return 0;
      const entries = await actor.getAllEntries();
      return entries.length * 2000;
    },
    enabled: !!actor,
  });
}

export function useAddEntry() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      date: string;
      gadiNumber: string;
      fromLocation: string;
      toLocation: string;
      partyName: string;
      partyRate: number;
      partyAdvance: number;
      partyAdvanceDate?: string;
      partyAdvanceProof?: string;
      ownerName: string;
      ownerRate: number;
      ownerAdvance: number;
      ownerAdvanceDate?: string;
      ownerAdvanceProof?: string;
      comment: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.addEntry(
        params.date,
        params.gadiNumber,
        params.fromLocation,
        params.toLocation,
        params.partyName,
        params.partyRate,
        params.partyAdvance,
        params.partyAdvanceDate || "",
        params.partyAdvanceProof || "",
        params.ownerName,
        params.ownerRate,
        params.ownerAdvance,
        params.ownerAdvanceDate || "",
        params.ownerAdvanceProof || "",
        params.comment,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["entries"] });
      queryClient.invalidateQueries({ queryKey: ["totalCommission"] });
    },
  });
}

export function useUpdateEntry() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      billNo: bigint;
      data: Partial<Omit<TransportEntry, "bill_no">>;
    }) => {
      if (!actor) throw new Error("Not connected");
      const all = await actor.getAllEntries();
      const current = all.find((e) => e.bill_no === params.billNo);
      if (!current) return false;
      const d = params.data;
      return actor.updateEntry(
        params.billNo,
        d.date ?? current.date,
        d.gadi_number ?? current.gadi_number,
        d.from_location ?? current.from_location,
        d.to_location ?? current.to_location,
        d.party_name ?? current.party_name,
        d.party_rate ?? current.party_rate,
        d.party_advance ?? current.party_advance,
        d.party_advance_date ?? current.party_advance_date ?? "",
        d.party_advance_proof ?? current.party_advance_proof ?? "",
        d.owner_name ?? current.owner_name,
        d.owner_rate ?? current.owner_rate,
        d.owner_advance ?? current.owner_advance,
        d.owner_advance_date ?? current.owner_advance_date ?? "",
        d.owner_advance_proof ?? current.owner_advance_proof ?? "",
        d.comment ?? current.comment,
        d.owner_paid ?? current.owner_paid ?? false,
        d.party_paid ?? current.party_paid ?? false,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["entries"] });
      queryClient.invalidateQueries({ queryKey: ["totalCommission"] });
    },
  });
}

export function useDeleteEntry() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (billNo: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.deleteEntry(billNo);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["entries"] });
      queryClient.invalidateQueries({ queryKey: ["totalCommission"] });
    },
  });
}

export function useToggleOwnerPaid() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (billNo: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.toggleOwnerPaid(billNo);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["entries"] });
    },
  });
}

export function useTogglePartyPaid() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (billNo: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.togglePartyPaid(billNo);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["entries"] });
    },
  });
}
