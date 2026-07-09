# FE-06 — Frontend Backend Integration Standard

Status: BASELINE
Execution Domain: FE-06 Integration
Document Type: Architecture Standard
Handoff Target: FE-07 Quality

---

## 1. Purpose

FE-06 defines the frontend-wide standard for integrating with backend APIs.

This document establishes the architecture boundary between:

- Backend Contracts
- FE-03 Runtime
- FE-05 State
- Feature UI domains
- Server state and request lifecycle

This document does not implement APIs, modify runtime, or add business logic.

---

## 2. Source of Truth

Frontend integration must preserve the following source-of-truth order:

1. Business Blueprint for business rules and workflow meaning
2. Engineering Blueprint for technology and architecture constraints
3. `schema.prisma` for domain model and data authority
4. Backend Contracts for request/response shape
5. FE-03 Runtime for runtime context and actor/workspace availability
6. FE-05 State for client state and server-state ownership rules
7. Feature execution documents for feature-specific API usage

If a frontend integration decision conflicts with backend contracts or domain model, the contract/domain model wins.

---

## 3. Non-Goals

FE-06 must not:

- Write API implementation
- Modify backend routes
- Modify FE-03 Runtime
- Modify FE-05 State
- Add business logic in API clients
- Invent fields that do not exist in backend contracts or schema
- Bypass workspace or actor boundaries
- Couple feature UI directly to raw transport details

---

## 4. API Client Boundary

The API client is the only frontend boundary allowed to communicate with backend HTTP endpoints.

### Responsibilities

The API client may own:

- Base URL resolution
- Request serialization
- Response envelope normalization
- Request metadata attachment
- Auth token attachment
- Workspace metadata attachment
- Transport-level error normalization
- Request cancellation support
- Upload transport coordination

### Non-Responsibilities

The API client must not own:

- Business decisions
- UI rendering decisions
- Feature-specific state mutations
- Derived business calculations
- Domain rule overrides
- Runtime state changes
- Navigation decisions except auth/session failure handoff

Feature code must call feature-owned API modules, not raw HTTP helpers directly.

---

## 5. Backend Response Envelope

All backend responses consumed by frontend should be normalized into a consistent envelope before reaching feature UI.

### Success Envelope

```ts
type ApiSuccess<T> = {
  ok: true
  data: T
  meta?: ApiResponseMeta
}
```

### Error Envelope

```ts
type ApiFailure = {
  ok: false
  error: ApiError
  meta?: ApiResponseMeta
}
```

### Error Shape

```ts
type ApiError = {
  code: string
  message: string
  status?: number
  fieldErrors?: Record<string, string[]>
  requestId?: string
  retryable?: boolean
}
```

### Response Meta

```ts
type ApiResponseMeta = {
  requestId?: string
  receivedAt?: string
  source?: 'backend' | 'client-normalized'
}
```

Raw backend response shapes must not leak into components.

---

## 6. Request Metadata

Every backend request should carry metadata that supports traceability, workspace isolation, and debugging.

Standard metadata:

```ts
type RequestMetadata = {
  requestId: string
  actorId?: number | string
  actorRole?: string
  workspaceType?: 'LAUNDRY' | 'RESORT'
  resortId?: number
  feature: string
  action: string
  createdAt: string
}
```

### Rules

- `requestId` must be generated per request.
- `feature` must identify the frontend feature owner.
- `action` must identify the user/system action.
- `actorId`, `actorRole`, `workspaceType`, and `resortId` must come from approved runtime/auth state.
- Request metadata must not be manually invented inside UI components.

---

## 7. Error Handling

Frontend integration must classify errors before exposing them to UI.

### Standard Error Categories

| Category | Meaning | UI Treatment |
|---|---|---|
| `NETWORK_ERROR` | Request did not reach backend or connection failed | Retry option, non-destructive message |
| `UNAUTHORIZED` | Actor is not authenticated | Hand off to auth/session flow |
| `FORBIDDEN` | Actor lacks permission or workspace access | Block action, explain access boundary |
| `NOT_FOUND` | Resource does not exist or is outside workspace | Empty or not-found state |
| `VALIDATION_ERROR` | Backend rejected submitted input | Map to form fields |
| `CONFLICT` | Backend state changed or violates current state | Ask user to refresh or reload data |
| `SERVER_ERROR` | Backend failed unexpectedly | Safe generic message and requestId |
| `UNKNOWN_ERROR` | Error cannot be classified | Safe generic message and requestId |

### Rules

- Components must not parse raw HTTP errors.
- API client normalizes transport errors.
- Feature API modules may map contract-specific errors into feature-safe messages.
- Error messages must not expose backend internals.
- Destructive retry must require explicit user action.

---

## 8. Validation Error Mapping

Backend validation errors must be mapped to form-safe field errors before reaching form UI.

### Standard Mapping

```ts
type ValidationErrorMap = Record<string, string[]>
```

### Rules

- Backend field names are the source of truth.
- Feature forms may adapt backend field names to UI field names through an explicit mapper.
- Unknown field errors must be placed in a form-level error bucket.
- Validation mapping must not change business meaning.
- Validation errors must not be swallowed.

### Form-Level Bucket

```ts
type FormErrorState = {
  fieldErrors: Record<string, string[]>
  formErrors: string[]
}
```

---

## 9. Auth / Actor Integration

API requests that require identity must receive actor context from the approved auth/runtime boundary.

### Actor Context

```ts
type ActorContext = {
  actorId: number | string
  role: string
  workspaceType: 'LAUNDRY' | 'RESORT'
  resortId?: number
  token?: string
}
```

### Rules

- Auth token attachment belongs to API client boundary.
- UI components must not manually attach tokens.
- Actor role must not be trusted from component props.
- Workspace-sensitive requests must include actor/workspace context.
- Missing actor context must fail before request dispatch unless endpoint is explicitly public.

---

## 10. Workspace-Aware Requests

The system has two workspace modes:

- Laundry Workspace
- Resort Workspace

Frontend requests must preserve workspace isolation.

### Rules

- Laundry Workspace may request laundry-owned operational views according to backend contract.
- Resort Workspace must only request data for its own `resortId`.
- `resortId` for Resort Workspace must come from authenticated runtime/actor context.
- UI route params must not override authenticated `resortId`.
- Feature API modules must declare whether each request is workspace-scoped.
- Workspace mismatch must be treated as `FORBIDDEN` or blocked client-side before dispatch when detectable.

### Workspace Request Policy

```ts
type WorkspaceRequestPolicy =
  | { scope: 'LAUNDRY' }
  | { scope: 'RESORT'; resortId: number }
  | { scope: 'PUBLIC' }
```

---

## 11. Feature API Ownership

Each feature owns its feature API module.

### Ownership Rule

Feature UI must call:

```text
Feature UI → Feature API Module → Shared API Client → Backend Contract
```

Feature UI must not call:

```text
Feature UI → fetch/axios/direct HTTP
```

### Feature API Module Responsibilities

- Declare endpoint usage
- Declare request payload shape based on backend contract
- Declare response data shape based on backend contract
- Attach feature/action metadata
- Map validation errors into feature form field names when needed
- Expose feature-safe function names

### Shared API Client Responsibilities

- Transport
- Auth headers
- Workspace headers/metadata
- Envelope normalization
- Transport error classification

---

## 12. Server State Boundary

Server state is data owned by backend and retrieved through contracts.

### Server State Examples

- Laundry Work lists/details
- Laundry Bag lists/details
- Count Lines
- Linen Inventory Summary
- Linen Movements
- Issue Reports
- Machine and wash-load planning records

### Boundary Rules

- Server state must not be duplicated as permanent client truth.
- Client state may cache server state, but backend remains authoritative.
- UI-only state remains in UI/state layer.
- Mutations must invalidate or refresh affected server state according to FE-05 state rules.
- Derived server facts must come from backend or documented selectors, not ad-hoc component calculations.

---

## 13. Integration Flow

Standard request lifecycle:

```text
User Action / Runtime Event
↓
Feature UI
↓
Feature API Module
↓
Shared API Client
↓
Request Metadata + Auth + Workspace Context
↓
Backend Contract
↓
Response Envelope Normalization
↓
Feature API Result
↓
FE-05 State / Component Consumption
↓
UI State: Success / Empty / Loading / Error
```

### Mutation Flow

```text
Validate UI input
↓
Map to backend contract payload
↓
Attach metadata/auth/workspace
↓
Send mutation
↓
Normalize response/error
↓
Update or invalidate server state boundary
↓
Render final UI state
```

---

## 14. Retry / Loading / Empty / Error Rules

### Loading

- Loading state begins when request is dispatched.
- Loading must be scoped to the feature action, not the whole app unless truly global.
- Mutations must prevent duplicate submit when unsafe.

### Empty

- Empty state means request succeeded but returned no data.
- Empty must not be shown for failed requests.
- Empty copy should explain what the user can do next.

### Error

- Error state means request failed or was blocked.
- Error UI must use normalized error category.
- Error UI should include `requestId` when available.

### Retry

- Retry is allowed for safe reads and retryable network/server errors.
- Retry must not automatically repeat destructive mutations unless backend contract explicitly supports idempotency.
- Retry must preserve request metadata and generate a new request attempt identifier if supported.

---

## 15. API Naming Standard

Feature API functions must be named by business action, not transport details.

### Pattern

```text
<verb><DomainObject><Qualifier?>
```

### Examples

```text
listLaundryWorks
getLaundryWorkDetail
createLaundryWork
openLaundryBag
recordLaundryCountLines
reportLaundryIssue
listResortInventorySummary
planWashLoad
```

### Rules

- Use domain language from Business Blueprint and Glossary.
- Avoid names like `callApi`, `postData`, `fetchStuff`, or `submitForm`.
- Read functions should use `list`, `get`, or `search`.
- Mutation functions should use business verbs such as `create`, `open`, `record`, `report`, `return`, `close`, `plan`, or `update`.
- Function names must not expose backend route structure unless route name is also the domain language.

---

## 16. Upload / Signature / Proof Handling

Upload-related integration must remain transport-safe and contract-driven.

### Rules

- Upload transport belongs to API client or upload-specific feature API module.
- UI components may select files but must not own upload contract behavior.
- Signature/proof data must come from backend-approved contract.
- Upload progress is UI state; uploaded asset identity is server state.
- Failed upload must preserve safe retry behavior where supported.
- Upload metadata must include requestId and feature/action metadata.

---

## 17. Backend Contract Usage

Frontend must consume backend through documented contracts.

### Rules

- Endpoint payloads must follow backend contract names and required fields.
- Frontend must not create optimistic fields not backed by contract/schema.
- Contract mismatch must be recorded as blocker or handoff note.
- Contract evolution must be coordinated before frontend usage changes.

---

## 18. FE-03 Runtime Integration Boundary

FE-06 may read runtime-provided context through approved interfaces only.

### Allowed Runtime Inputs

- Current actor identity
- Current role
- Current workspace type
- Current resortId when applicable
- Session/auth token if provided through approved auth boundary
- Runtime request/session correlation if available

### Rules

- FE-06 must not modify runtime.
- FE-06 must not hydrate runtime.
- FE-06 must not create new runtime authority.
- Runtime context is consumed as input for requests only.

---

## 19. FE-05 State Integration Boundary

FE-06 hands normalized server results to the state layer or directly to feature consumption according to FE-05 ownership rules.

### Rules

- FE-06 does not own durable client state.
- FE-06 does not define stores.
- FE-06 does not mutate global state directly from shared API client.
- Feature API modules may return normalized results for FE-05-managed server state flows.
- Cache invalidation, refresh rules, and local UI state ownership belong to FE-05.

---

## 20. Security and Privacy Rules

- Never trust workspace scope from UI alone.
- Never expose another resort's data in frontend state.
- Never log auth tokens.
- Never display raw backend stack traces.
- Never allow component props to override authenticated actor/workspace context.
- Keep requestId safe for support/debugging.

---

## 21. Handoff to FE-07 Quality

FE-07 Quality should validate that frontend integration follows this standard.

### FE-07 Checklist

- API calls pass through feature API modules.
- Shared API client owns transport concerns only.
- Response envelope is normalized.
- Error categories are consistently mapped.
- Validation errors reach field/form-level UI safely.
- Auth context is sourced from approved runtime/auth boundary.
- Workspace-aware requests cannot leak Resort data.
- Server state boundary is respected.
- Loading/empty/error/retry states are explicit.
- API names follow business action naming.
- Upload/signature/proof handling is contract-driven.

---

## 22. Completion Criteria

FE-06 is complete when:

- Integration boundary is documented.
- API client boundary is defined.
- Backend response envelope is defined.
- Request metadata is defined.
- Error and validation mapping are defined.
- Auth/actor integration is defined.
- Workspace-aware request rules are defined.
- Feature API ownership is defined.
- Server state boundary is defined.
- Integration flow is defined.
- Retry/loading/empty/error rules are defined.
- API naming standard is defined.
- Handoff to FE-07 Quality is defined.

---

## 23. Blockers / Follow-Up

- Backend Contract files were not found during FE-06 document creation through available connector search. This document defines the frontend integration standard and requires concrete backend contracts to be checked before feature implementation.
- FE-05 concrete document path was not found during connector lookup. FE-06 therefore treats FE-05 as the owner of state/cache/invalidation policy without redefining it.
