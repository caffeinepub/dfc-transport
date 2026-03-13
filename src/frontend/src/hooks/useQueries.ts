import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  type LocalEntry,
  getAllEntries,
  getTotalCommission,
  addEntry as lsAddEntry,
  deleteEntry as lsDeleteEntry,
  toggleOwnerPaid as lsToggleOwnerPaid,
  togglePartyPaid as lsTogglePartyPaid,
  updateEntry as lsUpdateEntry,
} from "./useLocalStorage";

export type TransportEntry = LocalEntry;

export function useGetAllEntries() {
  return useQuery<TransportEntry[]>({
    queryKey: ["entries"],
    queryFn: () => getAllEntries(),
  });
}

export function useGetTotalCommission() {
  return useQuery<number>({
    queryKey: ["totalCommission"],
    queryFn: () => getTotalCommission(),
  });
}

export function useAddEntry() {
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
      return lsAddEntry(params);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["entries"] });
      queryClient.invalidateQueries({ queryKey: ["totalCommission"] });
    },
  });
}

export function useUpdateEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      billNo: bigint;
      data: Partial<Omit<TransportEntry, "bill_no">>;
    }) => {
      return lsUpdateEntry(params.billNo, params.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["entries"] });
      queryClient.invalidateQueries({ queryKey: ["totalCommission"] });
    },
  });
}

export function useDeleteEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (billNo: bigint) => {
      return lsDeleteEntry(billNo);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["entries"] });
      queryClient.invalidateQueries({ queryKey: ["totalCommission"] });
    },
  });
}

export function useToggleOwnerPaid() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (billNo: bigint) => {
      return lsToggleOwnerPaid(billNo);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["entries"] });
    },
  });
}

export function useTogglePartyPaid() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (billNo: bigint) => {
      return lsTogglePartyPaid(billNo);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["entries"] });
    },
  });
}
