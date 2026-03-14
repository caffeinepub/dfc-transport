# DFC Transport

## Current State
- Full React + ICP backend SPA
- Entry form saves to ICP blockchain via `actor.addEntry()`
- PartySummary tab shows party/owner totals (aggregated)
- Image upload fields for advance proof (party & owner) using base64 encoding
- Entry save is failing (likely due to large base64 image strings exceeding ICP message limits)

## Requested Changes (Diff)

### Add
- Party Record detail search page (within Party/Owner tab or as sub-view): user types party name → table shows all matching entries with Date, Truck No, From, To, Party Rate, Advance, Balance columns; totals at bottom: Total Gadi, Total Advance, Total Balance
- Owner Record detail search page: same but filtered by owner name

### Modify
- EntryForm: compress/resize images before base64 encoding to prevent ICP message size overflow. Max image size ~150KB after compression. Use canvas to resize to max 400x400px.
- PartySummary: Add search input at top of Party Records table and Owner Records table. When user types a name, show a detail view (or expand) with all entries for that party/owner (Date, Gadi No, From, To, Party Rate, Advance, Balance for party; Date, Gadi No, From, To, Owner Rate, Advance, Balance for owner) and show totals.

### Remove
- Nothing removed

## Implementation Plan
1. Fix EntryForm image upload: add canvas-based compression before setting base64 state. Max 400x400 pixels, quality 0.7 JPEG.
2. Update PartySummary component:
   - Add search input for party names
   - When a party row is clicked (or search is active), show detail table with all entries for that party
   - Add search input for owner names
   - When an owner row is clicked, show detail table with all entries for that owner
   - Show totals (Total Gadi, Total Advance, Total Balance) at bottom of detail view
3. The detail view reads from the same `useGetAllEntries()` data, filtered by name
