# Capability Freeze

| Capability | Status | Stable boundary and reason |
| --- | --- | --- |
| Authentication | Stable | Password login, session bootstrap, logout, and guarded workspace routing are verified. |
| Google identity | Stable | Verification, login, linking, conflict handling, and production registration gating are verified. |
| Remember Device | Stable | HttpOnly session creation, rotation, reuse detection, revocation, expiry, and cookie policy are verified. |
| Workspace Shell | Stable | One responsive shell owns desktop/mobile navigation, account actions, focus, safe areas, and overflow. |
| Operational Queues | Stable | All, today, pending, and ready views reuse the Laundry Work list contract. |
| Resort Management | Stable | Scoped list/search/pagination and authorized create/update/status operations are verified. |
| Laundry Item Catalog | Stable | Scoped list/search/pagination and authorized create/update/status operations are verified. |
| Issue Center | Stable | Global monitoring reuses the embedded issue lifecycle and work-detail route. |
| Reports | Stable | Read-only scoped summaries remain management-only. |
| Workspace Settings | Stable | Read access is membership-scoped; mutation remains OWNER-only and excludes deployment secrets. |
| Security | Stable | Identity-method invariants, sessions, and account navigation are verified. |
| Bag flow | Stable | Bag registration and lifecycle remain embedded in Laundry Work detail. |
| Count flow | Stable | Intake/count recording remains work-scoped with existing validation and policy. |
| Issue flow | Stable | Create, resolve, and reopen retain the existing lifecycle and policy. |
| Claim flow | Stable | Create/review/approve/reject/resolve remains work- and issue-scoped. |
| Return flow | Stable | Return packing retains the operational work policy. |
| Closure flow | Stable | Closure retains existing operational completion invariants. |

## Follow-up and deferred

- **Needs follow-up:** authenticated real-device Campaign Acceptance Test across supported widths and production roles. This is acceptance evidence, not missing implementation.
- **Needs follow-up:** shared loading/error/empty presentation requires a dedicated UI-system decision; current local states are functional.
- **Deferred:** reusable-module extraction.
- **Deferred:** activation or retirement of FE-01 blueprint placeholders; they are preserved reference assets outside runtime registration.
