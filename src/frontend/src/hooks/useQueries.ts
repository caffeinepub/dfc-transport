import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { TransportEntry as BackendEntry } from "../backend";
import { useActor } from "./useActor";

export type TransportEntry = BackendEntry;

export function useGetAllEntries() {
  const { actor } = useActor();
  return useQuery<TransportEntry[]>({
    queryKey: ["entries"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllEntries();
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
      return actor.getTotalCommission();
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
      ownerName: string;
      ownerRate: number;
      ownerAdvance: number;
      comment: string;
    }) => {
      if (!actor) throw new Error("Backend not connected");
      return actor.addEntry(
        params.date,
        params.gadiNumber,
        params.fromLocation,
        params.toLocation,
        params.partyName,
        params.partyRate,
        params.partyAdvance,
        params.ownerName,
        params.ownerRate,
        params.ownerAdvance,
        params.comment,
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
      if (!actor) throw new Error("Backend not connected");
      return actor.deleteEntry(billNo);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["entries"] });
      queryClient.invalidateQueries({ queryKey: ["totalCommission"] });
    },
  });
}
