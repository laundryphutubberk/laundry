# Platform Asset Inventory

| Candidate | Classification | Responsibility | Dependencies | Difficulty | Cross-project value | Platform name | Priority |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Workspace Shell | READY | Responsive authenticated composition/navigation | Router, session projection, UI layer | Medium | High | `PlatformWorkspaceShell` | 1 |
| Remember Device | READY | Session issue, rotation, revocation, cookie policy | Database, hashing, cookies | Medium | High | `PlatformDeviceSessions` | 1 |
| Date range engine | READY | Validated local ranges and presets | Timezone/date utilities | Low | High | `PlatformDateRange` | 1 |
| Verification harness | READY | Architecture, policy, HTTP, regression gates | Node scripts, fixtures | Medium | High | `PlatformVerificationKit` | 1 |
| Authentication | NEEDS STABILIZATION | Password/Google identity and sessions | User model, environment, Google | High | High | `PlatformIdentity` | 2 |
| RBAC helpers | NEEDS STABILIZATION | Visibility and command authorization | Legacy claims, membership transition | Medium | High | `PlatformAuthorization` | 2 |
| Search/filter/pagination | NEEDS STABILIZATION | Bounded query/page contracts | Capability validators/repositories | Medium | High | `PlatformQueryControls` | 2 |
| Loading/error/empty framework | NEEDS STABILIZATION | Async states and retry semantics | UI design system | Low | High | `PlatformAsyncStates` | 2 |
| Confirmation dialog | NEEDS STABILIZATION | Accessible transition confirmation | Local dialogs/prompts | Low | High | `PlatformConfirmDialog` | 2 |
| Master Data CRUD | NEEDS STABILIZATION | Scoped searchable status-managed catalogs | Tenant scope, policies | Medium | High | `PlatformMasterData` | 2 |
| Workspace Configuration | DOMAIN COUPLED | Tenant/workspace/branch profile | Tenant schema, membership | Medium | Medium | `WorkspaceConfiguration` | 3 |
| Reports | DOMAIN COUPLED | Laundry operational aggregates | Work, issue, item, resort | High | Medium | `OperationalReports` | 3 |
| Issue Center | DOMAIN COUPLED | Cross-work issue monitoring | Laundry issue lifecycle | Medium | Medium | `OperationalIssueCenter` | 3 |
| Queue Engine | DOMAIN COUPLED | Today/pending/ready projections | Laundry statuses/time rules | Medium | Medium | `OperationalQueues` | 3 |
| Status presentation | DOMAIN COUPLED | Labels, badges, transitions | Laundry lifecycle enums | Low | Medium | `LaundryStatusPresentation` | 3 |

## Inventory groups

- **Already reusable:** device-session security, date ranges, verification patterns, responsive shell behavior.
- **Needs stabilization:** identity boundaries, membership-aligned RBAC, query controls, async states, confirmations, scoped master data.
- **Future assets:** extracted workspace/identity/authorization/verification/UI packages and Laundry domain adapters.

No extraction is performed in this freeze.
