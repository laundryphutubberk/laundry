# BACKEND-FEATURE-FIRST-MIGRATION-STATUS.md

Status: Active  
Branch: `backend-feature-first-migration`  
Purpose: Track Layer-first to Feature-first backend migration progress.

---

## Migration Standard

Accepted module skeleton:

```text
backend/src/modules/<module>/
  index.js
  <module>.routes.js        # only when route exists
  <module>.controller.js    # only when controller exists
  <module>.service.js       # when service exists
  <module>.repository.js    # when repository exists
  <module>.validation.js    # only when validator exists
  <module>.business.js      # only when business rules exist
```

Principle:

```text
Minimum Required + Expand When Needed
```

---

## Rules Followed

During this migration:

- Do not copy from `src.zip` into the repo.
- Use real existing repo files as the migration source.
- Move one module at a time.
- Do not change Prisma schema.
- Do not change API URL contract.
- Do not change response contract.
- Do not change business logic intentionally.
- Do not create empty modules without confirmed legacy source files.
- Only add optional files when the old layer already had equivalent responsibility.

---

## Migrated Modules

### 1. `laundry-work`

Target:

```text
backend/src/modules/laundry-work/
  index.js
  laundry-work.routes.js
  laundry-work.controller.js
  laundry-work.service.js
  laundry-work.repository.js
  laundry-work.validation.js
  laundry-work.business.js
```

Legacy source removed:

```text
backend/src/routes/laundryWorks.routes.js
backend/src/controllers/laundryWorks.controller.js
backend/src/services/laundryWorks.service.js
backend/src/repositories/laundryWorks.repository.js
backend/src/repositories/laundryWorksBusiness.repository.js
backend/src/domain/laundryWorks.business.js
backend/src/validators/laundryWorks.validator.js
```

Route registry updated to use `../modules/laundry-work`.

---

### 2. `laundry-bag`

Target:

```text
backend/src/modules/laundry-bag/
  index.js
  laundry-bag.routes.js
  laundry-bag.controller.js
  laundry-bag.service.js
  laundry-bag.repository.js
  laundry-bag.validation.js
  laundry-bag.business.js
```

Legacy source removed:

```text
backend/src/routes/laundryBags.routes.js
backend/src/controllers/laundryBags.controller.js
backend/src/services/laundryBags.service.js
backend/src/repositories/laundryBags.repository.js
backend/src/domain/laundryBags.business.js
backend/src/validators/laundryBags.validator.js
```

Route registry updated to use `../modules/laundry-bag`.

---

### 3. `laundry-count-line`

Target:

```text
backend/src/modules/laundry-count-line/
  index.js
  laundry-count-line.service.js
  laundry-count-line.repository.js
  laundry-count-line.business.js
```

Legacy source removed:

```text
backend/src/services/laundryCountLines.service.js
backend/src/repositories/laundryCountLines.repository.js
backend/src/domain/laundryCountLines.business.js
```

No API route added. This remains an internal module.

---

### 4. `issue-report`

Target:

```text
backend/src/modules/issue-report/
  index.js
  issue-report.service.js
  issue-report.repository.js
  issue-report.business.js
```

Legacy source removed:

```text
backend/src/services/issueReports.service.js
backend/src/repositories/issueReports.repository.js
backend/src/domain/issueReports.business.js
```

No API route added. This remains an internal module.

---

### 5. `wash-load-plan`

Target:

```text
backend/src/modules/wash-load-plan/
  index.js
  wash-load-plan.service.js
  wash-load-plan.repository.js
  wash-load-plan.business.js
```

Legacy source removed:

```text
backend/src/services/washLoadPlans.service.js
backend/src/repositories/washLoadPlans.repository.js
backend/src/domain/washLoadPlans.business.js
```

No API route added. This remains an internal module.

---

### 6. `resort`

Target:

```text
backend/src/modules/resort/
  index.js
  resort.service.js
  resort.repository.js
  resort.business.js
```

Legacy source removed:

```text
backend/src/services/resorts.service.js
backend/src/repositories/resorts.repository.js
backend/src/domain/resorts.business.js
```

No API route added. This remains an internal/service-ready module.

---

### 7. `linen-movement`

Target:

```text
backend/src/modules/linen-movement/
  index.js
  linen-movement.service.js
  linen-movement.repository.js
  linen-movement.business.js
```

Legacy source removed:

```text
backend/src/services/linenMovements.service.js
backend/src/repositories/linenMovements.repository.js
backend/src/domain/linenMovements.business.js
```

No API route added. This remains an internal ledger module.

---

### 8. `laundry-machine-load-rule`

Target:

```text
backend/src/modules/laundry-machine-load-rule/
  index.js
  laundry-machine-load-rule.service.js
  laundry-machine-load-rule.repository.js
  laundry-machine-load-rule.business.js
```

Legacy source removed:

```text
backend/src/services/laundryMachineLoadRules.service.js
backend/src/repositories/laundryMachineLoadRules.repository.js
backend/src/domain/laundryMachineLoadRules.business.js
```

No API route added. This remains an internal master-data module.

---

## Remaining Legacy Areas To Verify Locally

The GitHub Connector does not expose a reliable directory listing through the current fetch action.

Before final merge, verify locally whether these legacy folders are empty or still contain files:

```text
backend/src/controllers/
backend/src/services/
backend/src/repositories/
backend/src/domain/
backend/src/validators/
backend/src/routes/
```

Expected after successful migration:

```text
backend/src/routes/index.js            # remains as route registry
backend/src/controllers/               # removable if empty
backend/src/services/                  # removable if empty
backend/src/repositories/              # removable if empty
backend/src/domain/                    # removable if empty
backend/src/validators/                # removable if empty
```

Do not remove folders blindly until local file listing confirms they are empty.

---

## Verification Checklist

Run locally on the branch:

```text
npm install
npm test
npm run dev
```

Manual checks:

```text
GET /api/health
GET /api/laundry/works
POST /api/laundry/works
GET /api/laundry/works/:workId
PATCH /api/laundry/works/:workId/status
GET /api/laundry/works/:workId/bags
POST /api/laundry/works/:workId/bags
GET /api/laundry/works/:workId/bags/:bagId
```

Import checks:

```text
No imports from ../controllers for migrated modules
No imports from ../services for migrated modules
No imports from ../repositories for migrated modules
No imports from ../domain for migrated modules
No imports from ../validators for migrated modules
```

---

## Known Branch State

The migration branch may diverge from `main` while documentation or other commits continue on `main`.

Before merge:

```text
1. Rebase or merge latest main into backend-feature-first-migration.
2. Resolve conflicts if any.
3. Run verification checklist.
4. Only then open or merge PR.
```

---

## Next Safe Step

Recommended next action:

```text
Local verification pass
  -> confirm no legacy files remain
  -> run tests/dev server
  -> fix import errors only
  -> update this status file
```
