# PROJECT-CONSTITUTION.md

Status: v1.0 (Baseline)

## Purpose
เอกสารนี้เป็น "รัฐธรรมนูญของโครงการ" สำหรับ Human และ AI ทุก Task
ทุกการออกแบบ การพัฒนา และการตัดสินใจต้องอ้างอิงเอกสารชุดนี้ก่อน

## Document Hierarchy

1. PROJECT-BOOT.md
2. Business Blueprint
3. Engineering Blueprint
4. schema.prisma
5. PROJECT-GLOSSARY.md
6. UI-ADAPTIVE-GUIDE.md
7. Development Standards
8. Execution OS (FE / BE / DB / QA)
9. ADR (Architecture Decision Records)

## Source of Truth

Business Rules        -> Business Blueprint
Domain Language       -> PROJECT-GLOSSARY.md
Data Model            -> schema.prisma
Engineering           -> Engineering Blueprint
UI Rules              -> UI-ADAPTIVE-GUIDE.md
Execution             -> Execution OS

## Change Policy

- Business เปลี่ยนก่อน Technology
- ห้ามแก้ schema โดยไม่ตรวจ Business Blueprint
- ห้ามสร้างศัพท์ใหม่โดยไม่เพิ่มใน Glossary
- ห้ามเพิ่มหน้าจอที่ไม่มีคุณค่าต่อผู้ใช้
- ทุก Architecture Decision ต้องบันทึกเป็น ADR

## Definition of Done

ก่อนเริ่ม Feature ใหม่ ต้องตอบได้ว่า

- อยู่ใน Business Blueprint หรือไม่
- ใช้ Domain Language เดียวกันหรือไม่
- schema รองรับหรือยัง
- UI อยู่ภายใต้ Adaptive Guide หรือไม่
- ผ่านมาตรฐาน Development Standards หรือไม่
