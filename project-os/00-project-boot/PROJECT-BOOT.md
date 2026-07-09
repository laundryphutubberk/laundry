# PROJECT-BOOT.md

## Purpose

เอกสารเริ่มต้นสำหรับทุก Human / AI Project Boot

Project Boot มีหน้าที่ทำให้ Human และ AI เข้าใจความจริงพื้นฐานของโครงการเท่านั้น ก่อนที่จะรับ Mission จาก Human

Project Boot ไม่ใช่การเลือก Task, Domain, Execution Package หรือ Current Work แทน Human

---

## Boot Boundary

Project Boot ต้องอ่านเพื่อเข้าใจ:

1. Project Constitution
2. Business Blueprint
3. Engineering Blueprint
4. schema.prisma
5. PROJECT-GLOSSARY.md
6. UI-ADAPTIVE-GUIDE.md
7. Development Standards

Project Boot ต้องไม่ทำสิ่งต่อไปนี้ก่อน Human มอบหมาย Mission:

- ห้ามเลือก FE / BE / DB / QA เอง
- ห้ามเลือก Execution Task เอง
- ห้ามอ่าน Execution Package เพื่อสรุปว่างานปัจจุบันคืออะไร
- ห้ามใช้ BOOT-REPORT.md เป็นตัวกำหนด Current Task
- ห้ามเริ่ม implementation

---

## Boot Output

หลัง Project Boot สำเร็จ สถานะต้องเป็น:

```text
PROJECT_READY
WAITING_FOR_MISSION
```

และต้องรายงานว่า:

```text
Mission: NOT_ASSIGNED
Execution Domain: UNRESOLVED
Current Task: NONE
```

---

## Mission Assignment Rule

Human เท่านั้นที่มี authority ในการกำหนด Mission หลัง Project Boot

ตัวอย่าง Mission Assignment:

```text
วันนี้ทำ Backend
วันนี้ทำ Frontend
วันนี้ออกแบบ Schema
วันนี้ Review Architecture
วันนี้ตรวจมาตรฐาน Project OS
```

หลังจาก Human กำหนด Mission แล้ว จึงเข้าสู่:

```text
Mission Resolution
→ Domain Resolution
→ Execution Package Boot
→ Execution
```

---

## Core Principles

- Business ก่อน Technology
- Single Source of Truth
- Lean Data Capture
- One Codebase
- Adaptive Workspace
- Workspace Isolation
- Task-Oriented UI
- Human Authority Before Execution
- Mission Resolution Before Domain Resolution

หากเอกสารขัดแย้งกัน:

Business Blueprint มีลำดับความสำคัญสูงกว่า Engineering Blueprint
