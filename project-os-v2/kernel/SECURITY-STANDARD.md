# Security and Privacy Standard

Status: DRAFT

## Principle

Security is a design input for every business flow, not a final release checklist.

## Required Threat Questions

- Who is the actor and how is identity established?
- Which tenant, organization, or workspace owns the resource?
- Can request input override trusted scope?
- Which roles may read, create, change, delete, approve, or export?
- What data is sensitive, regulated, secret, or personally identifiable?
- What happens when identifiers are guessed or requests are replayed?
- What must be audited without exposing sensitive content?

## Mandatory Boundaries

- Authenticate before resolving protected scope.
- Authorize every protected resource operation on the backend.
- Derive isolation from trusted actor context.
- Validate all external input at the boundary.
- Use least privilege for roles, credentials, services, and database access.
- Keep secrets outside source control and client bundles.
- Avoid sensitive values in logs, errors, URLs, analytics, and evidence.
- Define upload type, size, storage, access, retention, and malware-risk policies when files are accepted.

## Security-Significant Changes

Authentication, authorization, tenancy, workspace boundaries, public exposure, sensitive-data classification, cryptography, and retention changes require explicit review and may require an ADR.

## Evidence

Security claims require observed negative and positive cases, including cross-scope rejection where isolation applies. Documentation-only review is not runtime security evidence.
