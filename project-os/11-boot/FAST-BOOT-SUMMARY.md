# FAST-BOOT-SUMMARY.md

Status: READY_FOR_EXECUTION  
Purpose: สรุป Boot ทั้งระบบสำหรับ Human / AI Task ใหม่ เพื่อให้เริ่มงานได้เร็วโดยไม่ต้องอ่านทีละไฟล์ด้วยคำสั่ง Go

---

## 1. Boot Result

โปรเจกต์ `laundryphutubberk/laundry` ผ่านการอ่านเอกสาร Boot ระดับ Foundation, Governance และ Execution OS แล้ว

Current readiness:

```text
READY_FOR_EXECUTION ✅
```

หมายความว่า Task ใหม่สามารถเริ่มจากไฟล์นี้เพื่อเข้าใจภาพรวม แล้วค่อยอ่านไฟล์เฉพาะ Domain ที่กำลังจะทำงาน เช่น Backend Execution, Frontend Execution, schema.prisma หรือ Business Blueprint ตามความจำเป็น

---

## 2. Required Fast Boot Order

Task ใหม่ควรอ่านเร็วตามลำดับนี้

```text
1. project-os/11-boot/FAST-BOOT-SUMMARY.md
2. project-os/BOOT-INDEX.md
3. project-os/PROJECT-OS-STRUCTURE.md
4. project-os/00-project-boot/PROJECT-BOOT.md
5. project-os/01-constitution/PROJECT-CONSTITUTION.md
6. Domain-specific execution package ที่เกี่ยวข้องกับงาน
```

หากงานกระทบ Business, Data, API, UI หรือ Architecture ให้เปิดไฟล์ต้นทางตามส่วนที่เกี่ยวข้องด้านล่างก่อนลงมือ

---

## 3. Source of Truth Map

| Area | Source of Truth |
|---|---|
| Business Rules | `project-os/02-business/Laundry-Blueprint.md` |
| Project Authority | `project-os/01-constitution/PROJECT-CONSTITUTION.md` |
| Data Model | `project-os/06-domain-model/schema.prisma` |
| Domain Language | `project-os/04-glossary/PROJECT-GLOSSARY.md` |
| Engineering / Tech Stack | `project-os/03-engineering/Engineering Blueprint.md` |
| UI Rules | `project-os/05-ui-guide/UI-ADAPTIVE-GUIDE.md` |
| Development Rules | `project-os/08-standards/DEVELOPMENT-STANDARDS.md` |
| Change Flow | `project-os/09-pks/CHANGE-POLICY.md` |
| Architecture Decisions | `project-os/10-adr/ADR-0001.md` and future ADR files |
| Backend Execution | `project-os/backend/execution/README.md` |
| Frontend Execution | `project-os/frontend/execution/README.md` |
| AI Rules | `project-os/ai-task-handbook/AI-TASK-HANDBOOK.md` |
| AI Roles | `project-os/ai-task-handbook/PERMANENT-AI-ROLES.md` |

---

## 4. Project Mission

ระบบนี้คือ Laundry Operations & Linen Asset Management Platform

เป้าหมายหลัก:

- ช่วยเจ้าของโรงซักบริหารงานรับผ้า ซัก แยก นับ บันทึก ส่งคืน
- ช่วยรีสอร์ต / โรงแรมมองเห็นสถานะทรัพย์สินผ้าของตัวเอง
- ลดงานกรอกข้อมูลที่ไม่จำเป็น
- เก็บข้อมูล ณ จุดที่ข้อมูลเกิดขึ้นจริง
- ทำให้ Inventory ของรีสอร์ตคำนวณจาก Work / Movement History แทนการกรอกซ้ำ

---

## 5. Primary Users

```text
Laundry Workspace
- เจ้าของโรงซัก
- ผู้จัดการโรงซัก
- พนักงานโรงซัก

Resort Workspace
- เจ้าของรีสอร์ต
- ผู้จัดการรีสอร์ต
- พนักงานรีสอร์ต ตามสิทธิ์ในอนาคต
```

Workspace Isolation เป็นกฎสำคัญที่สุดข้อหนึ่ง

```text
Laundry Workspace = เห็นข้อมูลทุกงานที่โรงซักเป็นเจ้าของ
Resort Workspace = เห็นเฉพาะข้อมูลของ resortId ตัวเอง
```

ห้ามให้ Resort Workspace เห็นข้อมูลรีสอร์ตอื่น

---

## 6. Baseline Business Flow

Flow หลักของระบบต้องยึดตามนี้

```text
รับถุง
↓
โรงซักรับถุง
↓
เปิดถุง
↓
นับชิ้น
↓
แยกประเภท
↓
แยกสี
↓
บันทึกข้อมูล
↓
ส่งกลับ
```

ห้ามเพิ่ม Step ที่ไม่ได้ช่วยให้ผู้ใช้ทำงานจริง ตัดสินใจจริง หรือบริหารจริง

---

## 7. Core Business Rules

1. Resort เห็นเฉพาะข้อมูลของตัวเองเท่านั้น
2. จำนวนจริงถูกบันทึกที่โรงซักหลังเปิดถุงและนับชิ้น
3. ห้ามบังคับรีสอร์ตนับชิ้นก่อนส่ง ถ้ากระบวนการจริงส่งเป็นถุง
4. ห้ามเพิ่ม Step ที่ไม่สร้างคุณค่าต่อการทำงานหรือการตัดสินใจ
5. Issue ต้องถูกบันทึกชัดเจน เช่น ผ้าเสีย ผ้าหาย จำนวนไม่ตรง
6. Inventory ต้องคำนวณจาก Work / Movement History ไม่กรอกซ้ำ
7. Work Detail คือหน้าปฏิบัติงานหลักของพนักงาน

---

## 8. Domain Model Summary

`schema.prisma` คือ Source of Truth ของ Data Model

Core domain objects:

```text
User
Resort
LaundryItemType
LaundryWork
LaundryBag
LaundryCountLine
LinenMovement
LinenInventorySummary
IssueReport
WorkStatusLog
LaundryMachine
LaundryMachineLoadRule
WashLoadPlan
```

Core principles:

```text
LaundryWork = operational center / aggregate root
LaundryBag = intake unit
LaundryCountLine = real count captured at laundry
LinenMovement = movement history
LinenInventorySummary = calculated summary
IssueReport = explicit issue record
resortId = isolation key for Resort Workspace
```

---

## 9. Accepted Architecture Decisions

ADR-0001 is accepted.

Baseline decisions:

```text
- Web Application
- Adaptive Workspace
- Lean Production Flow
- Laundry Work เป็น Aggregate Root
- Inventory คำนวณจาก Movement
- Resort Workspace แยกข้อมูลด้วย resortId
```

ถ้ามีการเปลี่ยนเรื่องเหล่านี้ ต้องสร้าง ADR ใหม่

---

## 10. Engineering Baseline

Technology baseline:

```text
Frontend: React 19, Vite, Zustand, React Router, Tailwind, shadcn/ui
Backend: Node.js, Express, Prisma
Database: PostgreSQL
Storage: Cloudinary
API: REST
Authentication: JWT
Deployment: Docker
```

Business Blueprint ต้องไม่ผูกกับ Technology  
ถ้า Technology เปลี่ยน ให้แก้ Engineering Blueprint / ADR ไม่ใช่แก้ Business Blueprint โดยไม่จำเป็น

---

## 11. UI Baseline

UI strategy:

```text
One Codebase
One Business Logic
One API
One Component
Multiple Layouts
```

Breakpoints:

```text
Desktop >= 1280
Tablet 768-1279
Mobile < 768
```

Rules:

- ห้ามสร้าง Desktop/Mobile component แยกถ้าเป็น business component เดียวกัน
- Desktop ใช้ Sidebar
- Mobile ใช้ Drawer หรือ Bottom Navigation
- ทุกหน้าต้องเริ่มจาก "งานที่ต้องทำ"
- Touch UI ต้องปุ่มใหญ่ ใช้งานมือเดียว ลดการพิมพ์ และเน้น Scan / Tap

---

## 12. Development Standards

Architecture:

```text
Feature-first
Component reuse
One Codebase
One API Contract
```

Coding:

```text
ใช้ TypeScript เมื่อเริ่มโปรเจกต์
หลีกเลี่ยง Business Logic ใน UI
State แยกจาก View
Small reusable components
```

Database:

```text
Prisma เป็น Source of Truth
Migration ทุกครั้งต้อง review
```

API:

```text
REST naming คงที่
ไม่เปลี่ยน response โดยไม่เพิ่ม version เมื่อจำเป็น
```

Documentation:

```text
Feature ใหม่ต้องอัปเดต Business Blueprint ถ้ากระทบ Business
Feature ใหม่ต้องอัปเดต schema.prisma ถ้ากระทบข้อมูล
Feature ใหม่ต้องอัปเดต Glossary ถ้ามีคำใหม่
```

---

## 13. Change Policy

การเปลี่ยนแปลงต้องไหลจากบนลงล่าง

```text
Business Blueprint
↓
Project Constitution
↓
schema.prisma
↓
Contracts
↓
Engineering Blueprint
↓
Execution OS
↓
Implementation
```

ห้ามให้ Implementation เปลี่ยน Business โดยไม่ผ่าน Chief Architect

---

## 14. ADR Rule

ต้องสร้างหรืออัปเดต ADR เมื่อมีการเปลี่ยนแปลงสำคัญ เช่น

- เปลี่ยน schema
- เปลี่ยน API Contract
- เปลี่ยน Permission
- เปลี่ยน Workspace Boundary
- เปลี่ยน Technology หลัก
- เพิ่มหรือลด Business Flow สำคัญ

ADR format:

```text
# ADR-000X — Title
Status: Proposed / Accepted / Rejected
Context
Decision
Consequences
Owner
Date
```

---

## 15. AI Task Rules

AI ทุก Task ต้องยึดกฎนี้

- ห้ามเดา Business Rule
- ห้ามสร้างศัพท์ใหม่โดยไม่เพิ่ม Glossary
- ห้ามแก้ข้าม Domain โดยไม่มีคำสั่ง
- ห้ามอ้างว่าสร้างไฟล์หรือ Commit ถ้าไม่ได้เกิดขึ้นจริง
- ถ้าไม่แน่ใจ ให้หยุดและถาม Chief Architect

Role principle:

```text
AI ไม่ใช่เจ้าของทิศทางโปรเจกต์
Chief Architect เป็นเจ้าของทิศทาง
```

---

## 16. Permanent Role Map

```text
Chief Architect      → Human
Business Architect   → Business Blueprint / Rules
Data Architect       → schema.prisma / DB
Frontend Architect   → FE Execution
Backend Architect    → BE Execution
QA Architect         → Quality / Test
Release Architect    → Delivery
```

หนึ่ง Task ควรรับผิดชอบ Domain เดิมต่อเนื่อง เพื่อลด Context Switching

---

## 17. Execution OS Summary

### Backend Execution

File:

```text
project-os/backend/execution/README.md
```

BE phases:

```text
BE-01 Runtime Foundation
BE-02 Repository Foundation
BE-03 REST API Layer
BE-04 Architecture Normalization
BE-05 Business Layer
BE-06 Validation
BE-07 Policy and Domain Rules
BE-08 Transaction and Consistency
BE-09 Observability
BE-10 Production Readiness
```

### Frontend Execution

File:

```text
project-os/frontend/execution/README.md
```

FE phases:

```text
FE-01 Foundation
FE-02 Architecture
FE-03 Runtime
FE-04 UI Composition
FE-05 State
FE-06 Integration
FE-07 Quality
FE-08 Delivery
FE-09 Governance
```

Execution flow for both FE and BE:

```text
OS Standards
→ Execution Package
→ Milestone
→ Atomic Commit
→ Implementation
→ Verification
→ Review
→ Merge
→ Freeze
```

---

## 18. Parallel Execution Rule

งานขนานทำได้เฉพาะเมื่อ Package ไม่ใช้ mutable ownership ของไฟล์หรือ contract เดียวกัน

ถ้าสอง Task ต้องแก้ไฟล์เดียวกัน:

```text
1. ต้องกำหนด owner เดียว
2. อีก Task ต้องรอ
3. หรือประสานงาน
4. หรือ split scope ให้ชัดเจน
```

---

## 19. Fast Boot Checklist for New Task

ก่อนเริ่ม Task ใหม่ ให้ตอบคำถามนี้ให้ได้

```text
1. Task นี้อยู่ใน Domain ไหน? Business / Data / Backend / Frontend / QA / Release
2. Source of Truth ที่เกี่ยวข้องคือไฟล์ไหน?
3. มีผลต่อ Business Blueprint หรือไม่?
4. มีผลต่อ schema.prisma หรือไม่?
5. มีผลต่อ API Contract หรือไม่?
6. มีผลต่อ Workspace Boundary หรือไม่?
7. มีผลต่อ UI Adaptive Rule หรือไม่?
8. ต้องสร้าง ADR หรือไม่?
9. มีไฟล์ไหนเป็น allowed files / forbidden files?
10. มี Task อื่นถือ ownership ไฟล์เดียวกันหรือไม่?
```

ถ้าตอบไม่ได้ ให้หยุดและถาม Chief Architect ก่อน Implementation

---

## 20. Current Boot Status

```text
Foundation Boot       ✅ Complete
Governance Boot       ✅ Complete
AI Role Boot          ✅ Complete
Backend Execution     ✅ Complete
Frontend Execution    ✅ Complete
Overall Status        READY_FOR_EXECUTION ✅
```

---

## 21. Maintenance Rule

อัปเดตไฟล์นี้เมื่อมีการเปลี่ยนแปลงต่อไปนี้

- เปลี่ยน Business Flow สำคัญ
- เปลี่ยน schema.prisma
- เพิ่ม / เปลี่ยน Execution Package
- เปลี่ยน FE / BE Phase Index
- เปลี่ยน Workspace Boundary
- เพิ่ม ADR สำคัญ
- เปลี่ยน Boot Order
- เปลี่ยน Project OS Structure

ไฟล์นี้เป็น Fast Boot Summary ไม่ใช่แหล่งความจริงแทนเอกสารต้นทาง  
ถ้ามีความขัดแย้ง ให้ยึด Source of Truth ตามตารางในหัวข้อ 3
