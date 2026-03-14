import Map "mo:core/Map";
import Order "mo:core/Order";
import Float "mo:core/Float";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import Nat "mo:core/Nat";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  // ── Legacy stable types (kept for migration, must not be renamed) ──────────
  type TransportEntryStable = {
    bill_no : Nat;
    date : Text;
    gadi_number : Text;
    from_location : Text;
    to_location : Text;
    party_name : Text;
    party_rate : Float;
    party_advance : Float;
    owner_name : Text;
    owner_rate : Float;
    owner_advance : Float;
    created_at : Int;
  };

  // ── Current full type ───────────────────────────────────────────────────────
  public type TransportEntry = {
    bill_no : Nat;
    date : Text;
    gadi_number : Text;
    from_location : Text;
    to_location : Text;
    party_name : Text;
    party_rate : Float;
    party_advance : Float;
    party_advance_date : Text;
    party_advance_proof : Text;
    owner_name : Text;
    owner_rate : Float;
    owner_advance : Float;
    owner_advance_date : Text;
    owner_advance_proof : Text;
    comment : Text;
    owner_paid : Bool;
    party_paid : Bool;
    created_at : Int;
  };

  module TransportEntry {
    public func compareByBillNoDesc(e1 : TransportEntry, e2 : TransportEntry) : Order.Order {
      switch (Nat.compare(e1.bill_no, e2.bill_no)) {
        case (#greater) { #less };
        case (#less) { #greater };
        case (#equal) { #equal };
      };
    };
  };

  public type UserProfile = { name : Text };

  // ── Stable maps (entries & comments keep original types for upgrade compat) ─
  let entries     = Map.empty<Nat, TransportEntryStable>();
  let comments    = Map.empty<Nat, Text>();
  let newEntries  = Map.empty<Nat, TransportEntry>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  var nextBillNo = 1;

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // ── Migration: on first upgrade, merge legacy entries+comments → newEntries ─
  system func postupgrade() {
    for (e in entries.values()) {
      // Skip if already in newEntries
      if (newEntries.get(e.bill_no) == null) {
        let c = switch (comments.get(e.bill_no)) {
          case (?t) t;
          case null "";
        };
        let upgraded : TransportEntry = {
          bill_no           = e.bill_no;
          date              = e.date;
          gadi_number       = e.gadi_number;
          from_location     = e.from_location;
          to_location       = e.to_location;
          party_name        = e.party_name;
          party_rate        = e.party_rate;
          party_advance     = e.party_advance;
          party_advance_date  = "";
          party_advance_proof = "";
          owner_name        = e.owner_name;
          owner_rate        = e.owner_rate;
          owner_advance     = e.owner_advance;
          owner_advance_date  = "";
          owner_advance_proof = "";
          comment           = c;
          owner_paid        = false;
          party_paid        = false;
          created_at        = e.created_at;
        };
        newEntries.add(e.bill_no, upgraded);
        if (e.bill_no >= nextBillNo) {
          nextBillNo := e.bill_no + 1;
        };
      };
    };
  };

  // ── Helpers ─────────────────────────────────────────────────────────────────
  func nextId() : Nat {
    // nextBillNo may still be 1 if we just upgraded from a legacy state;
    // use max of newEntries size + 1 and nextBillNo as a safety net.
    let n = nextBillNo;
    nextBillNo += 1;
    n;
  };

  // ── User profile management ─────────────────────────────────────────────────
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    userProfiles.get(caller);
  };

  public query ({ caller = _ }) func getUserProfile(user : Principal) : async ?UserProfile {
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    userProfiles.add(caller, profile);
  };

  // ── Transport management ────────────────────────────────────────────────────
  public shared func addEntry(
    date : Text,
    gadiNumber : Text,
    fromLocation : Text,
    toLocation : Text,
    partyName : Text,
    partyRate : Float,
    partyAdvance : Float,
    partyAdvanceDate : Text,
    partyAdvanceProof : Text,
    ownerName : Text,
    ownerRate : Float,
    ownerAdvance : Float,
    ownerAdvanceDate : Text,
    ownerAdvanceProof : Text,
    comment : Text,
  ) : async Nat {
    let billNo = nextId();
    let entry : TransportEntry = {
      bill_no             = billNo;
      date;
      gadi_number         = gadiNumber;
      from_location       = fromLocation;
      to_location         = toLocation;
      party_name          = partyName;
      party_rate          = partyRate;
      party_advance       = partyAdvance;
      party_advance_date  = partyAdvanceDate;
      party_advance_proof = partyAdvanceProof;
      owner_name          = ownerName;
      owner_rate          = ownerRate;
      owner_advance       = ownerAdvance;
      owner_advance_date  = ownerAdvanceDate;
      owner_advance_proof = ownerAdvanceProof;
      comment;
      owner_paid          = false;
      party_paid          = false;
      created_at          = Time.now();
    };
    newEntries.add(billNo, entry);
    billNo;
  };

  public shared func updateEntry(
    billNo : Nat,
    date : Text,
    gadiNumber : Text,
    fromLocation : Text,
    toLocation : Text,
    partyName : Text,
    partyRate : Float,
    partyAdvance : Float,
    partyAdvanceDate : Text,
    partyAdvanceProof : Text,
    ownerName : Text,
    ownerRate : Float,
    ownerAdvance : Float,
    ownerAdvanceDate : Text,
    ownerAdvanceProof : Text,
    comment : Text,
    ownerPaid : Bool,
    partyPaid : Bool,
  ) : async Bool {
    switch (newEntries.get(billNo)) {
      case (null) { false };
      case (?existing) {
        newEntries.add(billNo, {
          bill_no             = billNo;
          date;
          gadi_number         = gadiNumber;
          from_location       = fromLocation;
          to_location         = toLocation;
          party_name          = partyName;
          party_rate          = partyRate;
          party_advance       = partyAdvance;
          party_advance_date  = partyAdvanceDate;
          party_advance_proof = partyAdvanceProof;
          owner_name          = ownerName;
          owner_rate          = ownerRate;
          owner_advance       = ownerAdvance;
          owner_advance_date  = ownerAdvanceDate;
          owner_advance_proof = ownerAdvanceProof;
          comment;
          owner_paid          = ownerPaid;
          party_paid          = partyPaid;
          created_at          = existing.created_at;
        });
        true;
      };
    };
  };

  public shared func toggleOwnerPaid(billNo : Nat) : async Bool {
    switch (newEntries.get(billNo)) {
      case (null) { false };
      case (?e) {
        newEntries.add(billNo, { e with owner_paid = not e.owner_paid });
        true;
      };
    };
  };

  public shared func togglePartyPaid(billNo : Nat) : async Bool {
    switch (newEntries.get(billNo)) {
      case (null) { false };
      case (?e) {
        newEntries.add(billNo, { e with party_paid = not e.party_paid });
        true;
      };
    };
  };

  public query func getAllEntries() : async [TransportEntry] {
    newEntries.values().toArray().sort(TransportEntry.compareByBillNoDesc);
  };

  public query func getEntry(billNo : Nat) : async ?TransportEntry {
    newEntries.get(billNo);
  };

  public shared func deleteEntry(billNo : Nat) : async Bool {
    switch (newEntries.get(billNo)) {
      case (null) { false };
      case (?_) { newEntries.remove(billNo); true };
    };
  };

  public query func getTotalCommission() : async Float {
    newEntries.values().toArray().foldLeft(
      0.0,
      func(acc : Float, _ : TransportEntry) : Float { acc + 2000.0 },
    );
  };
};
