import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface UserProfile {
    name: string;
}
export interface TransportEntry {
    owner_advance: number;
    date: string;
    bill_no: bigint;
    created_at: bigint;
    gadi_number: string;
    party_name: string;
    party_rate: number;
    party_advance: number;
    to_location: string;
    owner_name: string;
    owner_rate: number;
    from_location: string;
    comment: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addEntry(date: string, gadiNumber: string, fromLocation: string, toLocation: string, partyName: string, partyRate: number, partyAdvance: number, ownerName: string, ownerRate: number, ownerAdvance: number, comment: string): Promise<bigint>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    deleteEntry(billNo: bigint): Promise<boolean>;
    getAllEntries(): Promise<Array<TransportEntry>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getEntry(billNo: bigint): Promise<TransportEntry | null>;
    getTotalCommission(): Promise<number>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    _initializeAccessControlWithSecret(userSecret: string): Promise<void>;
}
