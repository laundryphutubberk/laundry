# Project Kernel Standard (PKS) v1.0

## Purpose

PKS คือมาตรฐานโครงสร้างโปรเจกต์สำหรับการพัฒนาซอฟต์แวร์ร่วมกันระหว่าง Human และ AI

ไม่ใช่ Template สำหรับโค้ด แต่เป็นมาตรฐานการเริ่มต้น การแบ่งหน้าที่ การอ้างอิงเอกสาร และการทำงานแบบขนาน

## Standard Layers

```text
01 Project Constitution
02 Project Boot
03 Business Blueprint
04 Engineering Blueprint
05 Domain Model / schema.prisma
06 Contracts
07 Development Standards
08 Execution OS
09 AI Task Handbook
10 ADR
```

## Rule

ทุกโปรเจกต์ใหม่ควรเริ่มจาก PKS แล้วเปลี่ยนเฉพาะเนื้อหาภายในตาม Business Domain
