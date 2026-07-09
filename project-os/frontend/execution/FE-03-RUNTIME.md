# FE-03-RUNTIME.md

Status: BASELINE

Task: Frontend Runtime Architecture

Purpose: กำหนดมาตรฐาน Frontend Runtime Architecture สำหรับทุก Feature โดยยึด Scanner Architecture และ Backend Contract เป็นฐาน เพื่อให้ทุก Feature มี Runtime Boundary, State Flow, Projection Flow และ Action Flow ที่เหมือนกัน

---

## 1. Scope

เอกสารนี้กำหนดมาตรฐาน Frontend Runtime สำหรับ Feature Runtime เท่านั้น

ครอบคลุม:

- Runtime Engine
- Workflow Engine
- Projection
- Policy
- Runtime Host
- Controller Hook
- Runtime State Flow
- API → Projection Flow
- Projection → UI Flow
- Action → Policy → Engine Flow
- Runtime Boundary ราย Feature
- Naming Standard

ไม่ครอบคลุม:

- React UI จริง
- Business Logic จริง
- Backend implementation
- Database implementation
- การแก้ Runtime ปัจจุบัน

---

## 2. Runtime Architecture Principle

Frontend Runtime ต้องทำหน้าที่เป็นชั้นประสานงานระหว่าง Backend Contract, Feature State และ UI

หลักการ:

- Backend Contract เป็นแหล่งข้อมูลจากระบบจริง
- Runtime Engine จัดการ state transition เชิง technical เท่านั้น
- Workflow Engine จัดลำดับ workflow ตาม contract และ status ที่ backend ส่งมา
- Projection แปลงข้อมูล runtime ให้ UI อ่านง่าย
- Policy ตรวจสิทธิ์และเงื่อนไขการกระทำก่อนส่งเข้า Engine
- Runtime Host เป็นขอบเขตการประกอบ Runtime สำหรับ Feature
- Controller Hook เป็น public interface ระหว่าง UI กับ Runtime

Runtime ห้ามสร้าง Business Rule ใหม่เอง

หากต้องใช้ Business Rule ที่ไม่มีใน Blueprint, Contract หรือ schema ต้องหยุดและยกระดับกลับไปยัง Chief Architect

---

## 3. Scanner Architecture Alignment

Scanner Architecture หมายถึง Frontend ต้องรองรับการทำงานที่เริ่มจาก scan / tap / action event แล้วไหลเข้าสู่ runtime อย่างเป็นระบบ

มาตรฐาน flow:

```text
Scanner / User Action
↓
Controller Hook
↓
Policy
↓
Runtime Engine
↓
Backend API Contract
↓
Runtime State
↓
Projection
↓
UI
```

Scanner หรือ UI event ห้ามเขียน state mutation โดยตรง

ทุก action ต้องผ่าน Controller Hook และ Policy ก่อนเข้า Engine

---

## 4. Runtime Layers

```text
Feature UI
↓
Runtime Host
↓
Controller Hook
↓
Policy
↓
Runtime Engine / Workflow Engine
↓
API Client / Backend Contract
↓
Runtime State
↓
Projection
↓
Feature UI
```

---

## 5. Runtime Engine Standard

Runtime Engine คือชั้นจัดการ runtime state และ technical transition ของ Feature

หน้าที่:

- รับ command จาก Controller Hook
- เรียก API ตาม Backend Contract
- จัดการ loading / error / success state
- อัปเดต runtime state หลัง API response
- ส่ง event ให้ Workflow Engine เมื่อจำเป็น
- ไม่ render UI
- ไม่ถือ Business Rule ที่ไม่ได้มาจาก contract

ข้อห้าม:

- ห้าม import React component
- ห้ามมี JSX
- ห้ามเขียน decision เชิงธุรกิจใหม่เอง
- ห้ามรู้ layout หรือ visual state ของ UI

ตัวอย่างชื่อไฟล์:

```text
laundryWorks.engine.ts
laundryBags.engine.ts
issues.engine.ts
inventory.engine.ts
resorts.engine.ts
workspace.engine.ts
dashboard.engine.ts
```

---

## 6. Workflow Engine Standard

Workflow Engine คือชั้นจัดการ workflow state ตาม status / transition ที่ backend contract อนุญาต

หน้าที่:

- อ่าน current status จาก runtime state
- แปลง backend status เป็น frontend workflow state
- ตรวจ transition availability จาก contract
- ส่ง workflow metadata ให้ Projection
- ไม่ตัดสิน Business Rule เอง

Workflow Engine ต้องยึด WorkStatus และ contract เป็นหลัก

ตัวอย่าง workflow source:

- WorkStatus
- BagStatus
- IssueStatus
- MovementType
- WorkspaceType

---

## 7. Projection Standard

Projection คือชั้นแปลง Runtime State ให้ UI ใช้งานง่าย โดยไม่เปลี่ยน truth ของข้อมูล

หน้าที่:

- รวมข้อมูลที่ UI ต้องแสดง
- สร้าง derived display state
- map status เป็น label / visibility / disabled state
- เตรียม list, summary, dashboard view model
- ซ่อนรายละเอียด backend ที่ UI ไม่ต้องรู้

Projection ห้าม:

- เรียก API
- mutate runtime state
- สร้าง Business Rule ใหม่
- ยิง side effect

ตัวอย่างชื่อไฟล์:

```text
LaundryWorksProjection.ts
LaundryBagsProjection.ts
IssuesProjection.ts
InventoryProjection.ts
ResortsProjection.ts
WorkspaceProjection.ts
DashboardProjection.ts
```

---

## 8. Policy Standard

Policy คือชั้นตรวจว่า action หนึ่ง ๆ ทำได้หรือไม่ได้ ก่อนส่งเข้า Engine

หน้าที่:

- ตรวจ workspace boundary
- ตรวจ role / permission จาก authenticated runtime context
- ตรวจ required state ก่อน action
- ตรวจว่าข้อมูลพร้อมส่ง API หรือไม่
- ส่งผลลัพธ์เป็น allow / deny / reason

Policy ต้องใช้ข้อมูลจาก:

- Backend Contract
- Runtime State
- Auth / Workspace Context
- schema.prisma enums
- Business Blueprint ที่ถูกแปลงเป็น contract แล้ว

Policy ห้าม:

- เรียก API โดยตรง
- render UI
- เปลี่ยน state เอง
- เพิ่ม Business Rule ที่ไม่มี contract รองรับ

ตัวอย่างชื่อไฟล์:

```text
laundryWorks.policy.ts
laundryBags.policy.ts
issues.policy.ts
inventory.policy.ts
resorts.policy.ts
workspace.policy.ts
dashboard.policy.ts
```

---

## 9. Runtime Host Standard

Runtime Host คือ React boundary ที่ประกอบ runtime dependencies ให้ Feature UI

หน้าที่:

- สร้าง runtime context เฉพาะ Feature
- ผูก Engine, Policy, Projection และ Controller Hook เข้าด้วยกัน
- จัดการ lifecycle ระดับ Feature
- ส่งค่า runtime ให้ children ผ่าน provider หรือ hook

ข้อกำหนด:

- Runtime Host มี React ได้
- Runtime Host ห้ามมีหน้าตา UI เชิง business
- Runtime Host ห้าม contain layout หลักของหน้า
- Runtime Host ห้ามเขียน Business Logic จริง

ตัวอย่างชื่อไฟล์:

```text
LaundryWorksRuntimeHost.tsx
LaundryBagsRuntimeHost.tsx
IssuesRuntimeHost.tsx
InventoryRuntimeHost.tsx
ResortsRuntimeHost.tsx
WorkspaceRuntimeHost.tsx
DashboardRuntimeHost.tsx
```

---

## 10. Controller Hook Standard

Controller Hook คือ public interface ที่ UI ใช้ติดต่อ Runtime

หน้าที่:

- expose state ที่ผ่าน Projection แล้ว
- expose action handler ที่ผ่าน Policy แล้ว
- ซ่อนรายละเอียด Engine / API จาก UI
- รวม loading / error / action state ให้ UI ใช้

Controller Hook ต้องเป็นจุดเดียวที่ UI เรียก action ของ Feature

ตัวอย่างชื่อไฟล์:

```text
useLaundryWorksController.ts
useLaundryBagsController.ts
useIssuesController.ts
useInventoryController.ts
useResortsController.ts
useWorkspaceController.ts
useDashboardController.ts
```

---

## 11. Runtime State Flow

```text
Initial Runtime State
↓
Load Command
↓
Runtime Engine
↓
API Client
↓
Backend Response
↓
Normalize Runtime State
↓
Projection
↓
Controller Hook
↓
UI
```

Runtime state ต้องเก็บ truth จาก backend แบบไม่ผูกกับ visual layout

State ที่ควรมี:

- entities
- selectedId หรือ currentId
- loading state
- error state
- lastUpdatedAt
- action status
- workspace scope

State ที่ไม่ควรมี:

- CSS class
- layout-specific flag ที่ไม่เกี่ยวกับ runtime
- duplicated backend truth
- Business Rule ที่ยังไม่มี contract

---

## 12. API → Projection Flow

```text
Backend API Response
↓
Contract Validation / DTO Shape
↓
Runtime Engine Normalize
↓
Runtime State
↓
Projection Build View Model
↓
Controller Hook exposes projected state
```

หลักการ:

- API response ต้องถูกถือเป็น source จาก backend contract
- Engine normalize ข้อมูลเพื่อ state เท่านั้น
- Projection สร้าง view model สำหรับ UI เท่านั้น
- UI ห้ามอ่าน raw API response โดยตรง

---

## 13. Projection → UI Flow

```text
Runtime State
↓
Projection
↓
View Model
↓
Controller Hook
↓
UI Component
```

UI ต้องรับข้อมูลที่พร้อมแสดงจาก Controller Hook

UI ห้าม:

- map backend status เอง
- calculate inventory เอง
- เช็ค workspace isolation เองเป็นชั้นหลัก
- เรียก engine โดยตรง
- เรียก API โดยตรง

---

## 14. Action → Policy → Engine Flow

```text
UI / Scanner Action
↓
Controller Hook Action
↓
Policy Check
↓
Allowed?
├── No  → return deny reason / controller error state
└── Yes → Runtime Engine Command
          ↓
          API Call
          ↓
          State Update
          ↓
          Projection Refresh
```

ทุก action ต้องผ่าน Policy ก่อน Engine

ห้าม bypass policy เพื่อความสะดวกของ UI

---

## 15. Runtime Boundary by Feature

### 15.1 laundry-works

Boundary:

- Laundry Work list
- Work detail runtime state
- Work status runtime mapping
- Work action command boundary
- Work-level projection

Allowed runtime responsibility:

- load works
- load work detail
- prepare work timeline projection
- expose allowed work actions from policy

Not allowed:

- calculate inventory truth
- manage bag internals beyond work relation
- decide business transition without contract

---

### 15.2 laundry-bags

Boundary:

- Bag intake runtime
- Bag open state
- Bag count relation
- Bag-level projection

Allowed runtime responsibility:

- load bags by workId
- expose bag status projection
- pass bag actions through policy

Not allowed:

- treat bag as inventory unit
- calculate resort linen inventory
- duplicate Laundry Work status logic

---

### 15.3 issues

Boundary:

- Issue list
- Issue detail
- Issue status projection
- Issue action policy

Allowed runtime responsibility:

- load issues
- load issues by workId / resortId according to workspace scope
- expose issue visibility and action availability

Not allowed:

- infer issue quantity from UI-only state
- resolve issue without backend contract
- mix issue truth into inventory without movement contract

---

### 15.4 inventory

Boundary:

- Linen Inventory Summary projection
- Movement-derived display state
- Resort inventory visibility

Allowed runtime responsibility:

- load inventory summary
- load movement history when contract exists
- present inventory projection

Not allowed:

- manually create inventory truth from UI
- calculate final inventory outside backend/contract unless explicitly defined as frontend projection only
- bypass resortId isolation

---

### 15.5 resorts

Boundary:

- Resort list
- Resort detail projection
- Resort active/inactive state display

Allowed runtime responsibility:

- load resorts for Laundry Workspace
- expose resort selection for Work creation flow
- project resort metadata

Not allowed:

- expose other resort data inside Resort Workspace
- mix resort management with laundry work workflow engine

---

### 15.6 workspace

Boundary:

- Workspace identity
- Workspace scope
- Current user workspace context
- Cross-feature workspace policy support

Allowed runtime responsibility:

- provide workspaceType
- provide resortId when workspace is RESORT
- provide role and access metadata from auth contract
- enforce workspace boundary through shared policy support

Not allowed:

- render feature-specific UI
- override backend authorization
- allow Resort Workspace to access another resortId

---

### 15.7 dashboard

Boundary:

- Dashboard summary projection
- Work status summary
- Issue summary
- Inventory summary display input

Allowed runtime responsibility:

- load dashboard contract response
- project widgets for Laundry Dashboard
- project widgets for Resort Dashboard

Not allowed:

- become source of truth for works / issues / inventory
- duplicate feature engines
- calculate business-critical totals without backend contract

---

## 16. Naming Standard

### Engine

```text
<feature>.engine.ts
```

Examples:

```text
laundryWorks.engine.ts
laundryBags.engine.ts
issues.engine.ts
inventory.engine.ts
resorts.engine.ts
workspace.engine.ts
dashboard.engine.ts
```

### Policy

```text
<feature>.policy.ts
```

Examples:

```text
laundryWorks.policy.ts
laundryBags.policy.ts
issues.policy.ts
inventory.policy.ts
resorts.policy.ts
workspace.policy.ts
dashboard.policy.ts
```

### Projection

```text
<Feature>Projection.ts
```

Examples:

```text
LaundryWorksProjection.ts
LaundryBagsProjection.ts
IssuesProjection.ts
InventoryProjection.ts
ResortsProjection.ts
WorkspaceProjection.ts
DashboardProjection.ts
```

### Runtime Host

```text
<Feature>RuntimeHost.tsx
```

Examples:

```text
LaundryWorksRuntimeHost.tsx
LaundryBagsRuntimeHost.tsx
IssuesRuntimeHost.tsx
InventoryRuntimeHost.tsx
ResortsRuntimeHost.tsx
WorkspaceRuntimeHost.tsx
DashboardRuntimeHost.tsx
```

### Controller Hook

```text
use<Feature>Controller.ts
```

Examples:

```text
useLaundryWorksController.ts
useLaundryBagsController.ts
useIssuesController.ts
useInventoryController.ts
useResortsController.ts
useWorkspaceController.ts
useDashboardController.ts
```

---

## 17. Folder Placement Standard

Recommended runtime folder shape per feature:

```text
src/features/<feature>/runtime/
├── <feature>.engine.ts
├── <feature>.policy.ts
├── <Feature>Projection.ts
├── <Feature>RuntimeHost.tsx
└── use<Feature>Controller.ts
```

Shared runtime utilities:

```text
src/runtime/
├── contracts/
├── scanner/
├── workflow/
├── policy/
└── projection/
```

This is a standard only. This task does not create or modify runtime implementation files.

---

## 18. Runtime Contract Dependency

Frontend Runtime must depend on Backend Contract, not backend implementation details

Allowed dependencies:

- DTO / response shape from contract
- enum names aligned with schema.prisma
- endpoint action semantics
- error shape
- authorization / workspace metadata

Disallowed dependencies:

- database query detail
- Prisma internal implementation
- backend service private logic
- inferred business rule from UI behavior

---

## 19. Done Criteria

FE-03 is done when:

- `project-os/frontend/execution/FE-03-RUNTIME.md` exists
- Runtime Engine standard is defined
- Workflow Engine standard is defined
- Projection standard is defined
- Policy standard is defined
- Runtime Host standard is defined
- Controller Hook standard is defined
- Runtime State Flow is defined
- API → Projection Flow is defined
- Projection → UI Flow is defined
- Action → Policy → Engine Flow is defined
- Runtime Boundary is defined for required features
- Naming Standard is defined
- No React UI is written
- No real Business Logic is added
- No current Runtime implementation is changed

---

## 20. Handoff to FE-04

FE-04 may use this document to design UI Composition rules for:

- Dashboard
- Work Detail
- Timeline
- Count & Sort Panel
- Resort Linen Dashboard

FE-04 must consume Runtime through Controller Hook and Projection only

UI must not bypass Runtime Architecture
