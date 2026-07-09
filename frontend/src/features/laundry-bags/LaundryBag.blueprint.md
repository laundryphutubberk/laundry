# Laundry Bag Blueprint

Status: ACTIVE
Phase: FW-02-A

## Purpose
Own bag intake and bag-level operational workflow inside Laundry Work.

## User Goals
- View bags under a Laundry Work
- Receive or register bag information
- Understand bag status
- Open bag into count workflow
- Keep bag data separate from inventory data

## Business Rule
Laundry Bag is the intake unit. It is not the inventory unit.

## Primary Screens
- Bag List Section inside Laundry Work Detail
- Bag Detail Panel
- Bag Receive / Create Panel

## Runtime Ownership
- Bag workflow eligibility
- Bag visibility within Laundry Work
- Bag action policy

## State Ownership
- Selected bag
- Bag UI filters
- Bag draft form state

## API Mapping
- List bags by workId
- Get bag detail
- Create bag
- Update bag status when backend contract is available

## UI Component Plan
- LaundryBagList
- LaundryBagCard
- LaundryBagStatusBadge
- ReceiveBagPanel
- LaundryBagRuntimeHost

## Integration Plan
Bag UI must compose into Laundry Work Detail and must not own Laundry Work status transitions directly.

## Quality Gate
Bag workflows must preserve Laundry Work ownership and workspace isolation.

## Regression Lock Criteria
Bag creation, listing, selection, and visibility are stable within Laundry Work Detail.
