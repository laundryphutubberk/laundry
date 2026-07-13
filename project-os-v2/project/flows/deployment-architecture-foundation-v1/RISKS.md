# Risks

- Dashboard state cannot be proven by offline repository verification.
- Preview URLs may change, requiring deliberate CORS and OAuth-origin management.
- A Preview frontend can regress if its compiled backend URL is stale or incompatible.
- Application rollback does not reverse database migrations.
- Shared development database state can create cross-preview interference.
