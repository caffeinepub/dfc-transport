import Map "mo:core/Map";
import Order "mo:core/Order";
import Float "mo:core/Float";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import Nat "mo:core/Nat";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  // The stable entries map keeps the original shape (no comment field)
  // so it stays backward-compatible with any previously stored data.
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

  // Public API type includes comment (merged at read time)
  public type TransportEntry = {
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
    comment : Text;
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

  public type UserProfile = {
    name : Text;
  };

  let entries = Map.empty<Nat, TransportEntryStable>();
  let comments = Map.empty<Nat, Text>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  var nextBillNo = 1;

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  func mergeComment(e : TransportEntryStable) : TransportEntry {
    let c = switch (comments.get(e.bill_no)) {
      case (?t) { t };
      case null { "" };
    };
    {
      bill_no = e.bill_no;
      date = e.date;
      gadi_number = e.gadi_number;
      from_location = e.from_location;
      to_location = e.to_location;
      party_name = e.party_name;
      party_rate = e.party_rate;
      party_advance = e.party_advance;
      owner_name = e.owner_name;
      owner_rate = e.owner_rate;
      owner_advance = e.owner_advance;
      comment = c;
      created_at = e.created_at;
    };
  };

  // User profile management
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    userProfiles.get(caller);
  };

  public query ({ caller = _ }) func getUserProfile(user : Principal) : async ?UserProfile {
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    userProfiles.add(caller, profile);
  };

  // Transport management
  public shared func addEntry(
    date : Text,
    gadiNumber : Text,
    fromLocation : Text,
    toLocation : Text,
    partyName : Text,
    partyRate : Float,
    partyAdvance : Float,
    ownerName : Text,
    ownerRate : Float,
    ownerAdvance : Float,
    comment : Text,
  ) : async Nat {
    let billNo = nextBillNo;
    let entry : TransportEntryStable = {
      bill_no = billNo;
      date;
      gadi_number = gadiNumber;
      from_location = fromLocation;
      to_location = toLocation;
      party_name = partyName;
      party_rate = partyRate;
      party_advance = partyAdvance;
      owner_name = ownerName;
      owner_rate = ownerRate;
      owner_advance = ownerAdvance;
      created_at = Time.now();
    };
    entries.add(billNo, entry);
    if (comment != "") { comments.add(billNo, comment) };
    nextBillNo += 1;
    billNo;
  };

  public query func getAllEntries() : async [TransportEntry] {
    entries.values().toArray().map(mergeComment).sort(TransportEntry.compareByBillNoDesc);
  };

  public query func getEntry(billNo : Nat) : async ?TransportEntry {
    switch (entries.get(billNo)) {
      case (null) { null };
      case (?e) { ?mergeComment(e) };
    };
  };

  public shared func deleteEntry(billNo : Nat) : async Bool {
    switch (entries.get(billNo)) {
      case (null) { false };
      case (?_) {
        entries.remove(billNo);
        comments.remove(billNo);
        true;
      };
    };
  };

  public query func getTotalCommission() : async Float {
    entries.values().toArray().foldLeft(
      0.0,
      func(acc : Float, _ : TransportEntryStable) : Float { acc + 2000.0 },
    );
  };
};
