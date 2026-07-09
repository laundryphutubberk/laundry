# BOOT

## Boot Principle

Boot คือการทำให้ Human และ AI เข้าใจบทบาท ขอบเขต และความจริงพื้นฐานของโครงการ ไม่ใช่การอ่านเอกสารทั้งหมด และไม่ใช่การเลือกงานแทน Human

เป้าหมายคือ Boot ให้สั้นที่สุด แต่ถูกต้องที่สุด และหยุดที่สถานะพร้อมรับ Mission

---

## Boot Layers

```text
Kernel Boot
→ Project Boot
→ PROJECT_READY
→ WAITING_FOR_MISSION
→ Human Mission Assignment
→ Mission Resolution
→ Domain Resolution
→ Execution Package Boot
→ Execution
```

---

## Required Project Boot Read Order

Project Boot อ่านเฉพาะเอกสารพื้นฐานของโครงการ:

1. Project Constitution
2. Project Boot
3. Business Blueprint
4. Engineering Blueprint
5. Domain Model (schema.prisma)
6. PROJECT-GLOSSARY.md
7. UI-ADAPTIVE-GUIDE.md
8. Development Standards

Project Boot ยังไม่อ่าน Contracts หรือ Execution Domain เพื่อเลือกงานปัจจุบัน เว้นแต่ Human มอบหมาย Mission แล้ว

---

## Mission Resolution Read Order

หลังจาก Human มอบหมาย Mission แล้วเท่านั้น จึงอ่านเอกสารเฉพาะงาน:

1. Execution Domain
2. Contracts
3. ADR ที่เกี่ยวข้อง
4. Task Handbook ที่เกี่ยวข้อง
5. Existing BOOT-REPORT เฉพาะ Mission นั้น หากต้องใช้เป็นหลักฐานหรือ gap record

---

## Boot Questions

หลัง Project Boot ต้องตอบได้ว่า:

- Project นี้แก้ปัญหาอะไร
- ผู้ใช้หลักคือใคร
- Business Workflow คืออะไร
- Source of Truth คืออะไร
- กฎ Project / Business / Engineering / UI / Development สำคัญคืออะไร

หลัง Human มอบหมาย Mission แล้ว จึงต้องตอบเพิ่มว่า:

- กำลังเข้า Domain ไหน
- ขอบเขตของ Domain นี้คืออะไร
- Contract ไหนเกี่ยวข้อง
- ไฟล์ไหนแก้ได้ / ห้ามแก้
- Checklist ใดต้องผ่านก่อน implementation

---

## Readiness States

| State | Meaning |
|---|---|
| `KERNEL_READY` | Collaboration kernel พร้อม แต่ยังไม่โหลด project context |
| `PROJECT_READY` | เข้าใจ project-level source of truth แล้ว |
| `WAITING_FOR_MISSION` | Boot สำเร็จ แต่ Human ยังไม่ได้มอบหมาย Mission |
| `MISSION_RESOLVED` | Human มอบหมาย Mission แล้ว และ AI เข้าใจเป้าหมาย |
| `DOMAIN_READY` | อ่าน Execution Domain / Contracts ที่เกี่ยวข้องแล้ว |
| `EXECUTION_READY` | พร้อมเริ่มงานจริงตาม Mission Contract |
| `BOOT_DEGRADED` | ข้อมูล project-level บางส่วนหายหรือไม่ชัด |
| `BLOCKED_BY_BOOT_GAP` | ไม่ควรดำเนินงานต่อจนกว่าช่องว่าง boot จะถูกแก้ |

---

## BOOT-REPORT Rule

`project-os/11-boot/BOOT-REPORT.md` เป็น Mission / Execution Artifact ไม่ใช่ Project Boot Input หลัก

ห้ามใช้ BOOT-REPORT เพื่อสรุปว่า Current Task คืออะไร ก่อน Human มอบหมาย Mission

ใช้ BOOT-REPORT ได้เมื่อ:

- Human มอบหมาย Mission แล้ว
- ต้องตรวจ gap ของ Mission นั้น
- ต้องใช้เป็นหลักฐานของการ boot / verification ก่อนหน้า
- ต้องบันทึก boot gap ใหม่หลังพบความไม่ครบถ้วน

---

## Execution Rule

ห้ามเริ่ม implementation จาก Project Boot เพียงอย่างเดียว

Execution เริ่มได้ต่อเมื่อ:

- Human มอบหมาย Mission แล้ว
- Mission Resolution เสร็จแล้ว
- Domain / Contract ที่เกี่ยวข้องถูกอ่านแล้ว
- ขอบเขต allowed / forbidden files ชัดเจนแล้ว
- Mission Contract มี evidence requirement ที่ตรวจสอบได้
