# User Identity Persistence Verification Plan

Status: ACTIVE

- Create identity for an existing User and allow multiple subjects for one User.
- Reject duplicate subject ownership and silent reassignment with controlled conflicts.
- Confirm same email snapshot does not merge different subjects or Users.
- Update snapshots through stable provider subject without changing ownership.
- Exclude unlinked identities from active lookup and preserve final-method boundary information.
- Confirm User authorization integrity, absence of sensitive credentials and cascade deletion.
- Regress Stage A sessions, Google verification foundation and backend runtime.
