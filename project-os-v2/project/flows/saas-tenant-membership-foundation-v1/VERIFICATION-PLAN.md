# Verification Plan

Automated gates cover Prisma validation/generation/deploy/status; pilot records; exactly one bootstrap owner; mappings/exclusions; repeat deploy without duplicate bootstrap; database constraints; scoped repositories; lifecycle policy; auth compatibility; frontend lint/build; Project OS verify; and `git diff --check`.

Human verification is NOT_EXECUTED and must confirm unchanged auth, workspace/onboarding isolation, logout, restart persistence, storage hygiene, and mobile layout before commit authorization.
