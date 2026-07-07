# Laundry Operations & Linen Asset Management Platform — Blueprint v1.0

Status: BASELINE  
Purpose: เอกสารอ้างอิงหลักสำหรับวางแผนและพัฒนา App โรงซักผ้าอุตสาหกรรม  
Primary Customer: เจ้าของโรงซัก  
Secondary Customer: เจ้าของรีสอร์ต / โรงแรม  
Design Principle: Lean Production Flow + Linen Asset Visibility

---

## 1. Mission

ระบบนี้ออกแบบมาเพื่อช่วยให้เจ้าของโรงซักบริหารงานรับ–ซัก–ส่งคืนผ้าได้สะดวกขึ้น และช่วยให้เจ้าของรีสอร์ตเห็นข้อมูลทรัพย์สินผ้าของตนเองได้ชัดเจน เช่น:

- มีผ้าทั้งหมดเท่าไร
- อยู่ที่รีสอร์ตเท่าไร
- อยู่โรงซักเท่าไร
- มีปัญหาเท่าไร
- ส่งกลับแล้วเท่าไร

ระบบต้องลดงานกรอกข้อมูลที่ไม่จำเป็น และเก็บเฉพาะข้อมูลที่ใช้บริหารหรือตัดสินใจได้จริง

---

## 2. Core Philosophy

### Reality-Driven Design

ระบบต้องตามกระบวนการทำงานจริงของโรงซัก ไม่ใช่บังคับให้หน้างานทำงานตามระบบที่ซับซ้อนเกินจำเป็น

### Lean Data Capture

เก็บข้อมูลเท่าที่จำเป็นและเกิดประโยชน์จริง

ไม่เก็บข้อมูลเพราะ “เผื่อไว้”

### Single Data Capture Principle

ข้อมูลหนึ่งชุดควรถูกบันทึกเพียงครั้งเดียว ณ จุดที่ข้อมูลนั้นเกิดขึ้นจริง

ตัวอย่าง:

- รีสอร์ตส่งผ้าเป็นถุง ไม่ได้นับชิ้น → ระบบไม่ควรบังคับรีสอร์ตนับชิ้น
- โรงซักเปิดถุงแล้วนับชิ้น → จุดนี้คือจุดบันทึกจำนวนผ้าจริง
- Inventory ของรีสอร์ตคำนวณจากข้อมูลที่เกิดขึ้นในงาน ไม่ให้ผู้ใช้กรอกซ้ำ

### Decision-Driven Screens

หน้าจอทุกหน้าต้องตอบคำถามการตัดสินใจจริงของผู้ใช้

ถ้าหน้าจอหรือฟิลด์ใดไม่ได้ช่วยตัดสินใจหรือทำงานต่อ ควรตัดออก

---

## 3. Workspace Model

ระบบแบ่งเป็น 2 Workspace หลัก

### Laundry Workspace

ผู้ใช้หลัก:

- เจ้าของโรงซัก
- ผู้จัดการโรงซัก
- พนักงานโรงซัก

เห็นข้อมูล:

- ทุกรีสอร์ต
- ทุกงาน
- ทุกถุง
- รายการผ้าที่นับแล้ว
- งานที่มีปัญหา
- งานพร้อมส่งกลับ
- รายงานรวม
- ข้อมูลการดำเนินงานภายในโรงซัก

เป้าหมาย:

ช่วยเจ้าของโรงซักบริหารงานทั้งหมดของโรงซัก

### Resort Workspace

ผู้ใช้หลัก:

- เจ้าของรีสอร์ต
- ผู้จัดการรีสอร์ต

เห็นเฉพาะข้อมูลของรีสอร์ตตัวเองเท่านั้น

เห็นข้อมูล:

- ผ้าทั้งหมดของรีสอร์ตตัวเอง
- อยู่ที่รีสอร์ตเท่าไร
- อยู่โรงซักเท่าไร
- มีปัญหาเท่าไร
- ประวัติงานซักของตัวเอง
- รายงานของตัวเอง

ไม่เห็น:

- ข้อมูลรีสอร์ตอื่น
- ข้อมูลลูกค้ารายอื่น
- งานภายในของโรงซักที่ไม่เกี่ยวข้อง
- ข้อมูลบริหารรวมของโรงซัก

---

## 4. Workspace Isolation Principle

ทุก Query, Dashboard, Report, API และ UI ต้องกรองตาม Workspace

```text
Laundry Workspace
เห็นทุกข้อมูลที่โรงซักเป็นเจ้าของ

Resort Workspace
เห็นเฉพาะข้อมูลของ resortId ตัวเอง
```

ห้ามให้ Resort Workspace เข้าถึงข้อมูลของรีสอร์ตอื่นโดยเด็ดขาด

---

## 5. Simplified Production Flow

โฟลว์หลักของระบบเหลือเท่านี้

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

หมายเหตุ:

“บันทึกข้อมูล” หมายถึงการยืนยันข้อมูลที่นับ/แยกแล้วให้กลายเป็นข้อมูลอ้างอิงของงานและ Inventory

---

## 6. Work Status

สถานะงานหลัก:

```text
BAG_RECEIVED
FACTORY_RECEIVED
BAG_OPENED
ITEM_COUNTED
TYPE_SORTED
COLOR_SORTED
DATA_RECORDED
RETURNED
CLOSED
```

สถานะปัญหา:

```text
ISSUE_REPORTED
DAMAGED_REPORTED
MISSING_REPORTED
COUNT_DISCREPANCY
RETURN_DISCREPANCY
CANCELLED
```

---

## 7. Core Domain Objects

### Resort

ข้อมูลลูกค้า / รีสอร์ต

Fields:

- resortId
- name
- contactName
- contactPhone
- address
- active

### Laundry Work

งานซักหลัก

Fields:

- workId
- workNo
- resortId
- receivedDate
- bagCount
- currentStatus
- issueCount
- createdAt
- updatedAt
- closedAt

### Laundry Bag

ถุงผ้าที่รับมา

Fields:

- bagId
- workId
- bagNo
- resortId
- receivedAt
- openedAt
- status
- note

หมายเหตุ:

ถุงเป็นหน่วยของการรับเข้า ไม่ใช่หน่วย Inventory

### Laundry Item Type

ประเภทผ้า

Fields:

- itemTypeId
- name
- category
- active

ตัวอย่าง:

- ผ้าห่ม
- ผ้านวม
- ผ้าม่าน
- ปลอกหมอน
- ผ้าปูที่นอน
- ผ้าเช็ดตัว

### Laundry Count Line

รายการผ้าที่นับได้หลังเปิดถุง

Fields:

- lineId
- workId
- bagId optional
- resortId
- itemTypeId
- colorGroup
- quantity
- issueQuantity
- note

นี่คือข้อมูลหลักที่ใช้สร้าง Inventory Movement

### Linen Inventory Summary

ข้อมูลสรุปผ้าของรีสอร์ต

Fields:

- resortId
- itemTypeId
- colorGroup
- totalKnownQty
- atResortQty
- atLaundryQty
- issueQty
- returnedQty

หมายเหตุ:

Inventory Summary ควรคำนวณจาก Movement / Work History ไม่ใช่ให้กรอกเองซ้ำ ๆ

### Linen Movement

ประวัติการเคลื่อนไหวผ้า

Fields:

- movementId
- resortId
- workId
- itemTypeId
- colorGroup
- movementType
- quantity
- occurredAt

Movement Types:

```text
COUNTED_AT_LAUNDRY
ISSUE_REPORTED
RETURNED_TO_RESORT
ADJUSTMENT
```

### Issue Report

รายงานปัญหา

Fields:

- issueId
- workId
- resortId
- itemTypeId optional
- colorGroup optional
- issueType
- quantity
- description
- status
- reportedAt
- resolvedAt

Issue Types:

```text
DAMAGED
MISSING
COUNT_MISMATCH
OTHER
```

---

## 8. Main Screens

### Laundry Owner Dashboard

ตอบคำถาม:

- ตอนนี้มีงานอยู่ในระบบกี่งาน
- อยู่ขั้นตอนไหนบ้าง
- งานไหนพร้อมส่งกลับ
- รีสอร์ตไหนมีผ้าอยู่โรงซักมาก
- งานไหนมีปัญหา
- วันนี้ส่งกลับแล้วกี่งาน

Widgets:

- งานทั้งหมด
- รอเปิดถุง
- นับชิ้นแล้ว
- แยกแล้ว
- บันทึกข้อมูลแล้ว
- พร้อมส่งกลับ
- ส่งกลับแล้ว
- งานมีปัญหา

### Work Detail

หน้าหลักของพนักงานโรงซัก

แสดง Timeline:

```text
✅ รับถุง
✅ เปิดถุง
✅ นับชิ้น
🟡 แยกประเภท
⬜ แยกสี
⬜ บันทึกข้อมูล
⬜ ส่งกลับ
```

แสดงข้อมูล:

- รีสอร์ต
- จำนวนถุง
- รายการผ้าที่นับได้
- จำนวนรวม
- รายการมีปัญหา
- หมายเหตุ

### Count & Sort Panel

ใช้ในหน้า Work Detail

ทำหน้าที่:

- บันทึกจำนวนผ้า
- เลือกประเภทผ้า
- เลือกสี
- ระบุจำนวนมีปัญหา
- เพิ่มหมายเหตุ

### Resort Linen Dashboard

สำหรับเจ้าของรีสอร์ต

ตอบคำถาม:

- ผ้าของฉันมีทั้งหมดเท่าไร
- อยู่ที่รีสอร์ตเท่าไร
- อยู่โรงซักเท่าไร
- มีปัญหาเท่าไร
- ประเภทไหนใกล้ขาด
- ประวัติส่งซักเป็นอย่างไร

ไม่ต้องแสดงกระบวนการภายในละเอียดของโรงซัก

### Issue Management

สำหรับโรงซัก

ใช้ดู:

- งานที่มีปัญหา
- ประเภทปัญหา
- จำนวนที่มีปัญหา
- รีสอร์ตที่เกี่ยวข้อง
- สถานะแก้ไข

### Reports

รายงานหลัก:

- ผ้าอยู่โรงซักตามรีสอร์ต
- ปริมาณงานตามช่วงเวลา
- งานส่งกลับแล้ว
- ปัญหาตามรีสอร์ต
- Inventory summary ของแต่ละรีสอร์ต

---

## 9. What We Will Not Build Initially

ไม่ทำใน MVP:

- ระบบบัญชีเต็มรูปแบบ
- ระบบคิดเงินซับซ้อน
- RFID / IoT
- Mobile App แยกเต็มรูปแบบ
- Route optimization
- การติดตามรายถุงแบบละเอียดเกินจำเป็น
- การบันทึกเครื่องซัก / โปรแกรมซัก / คนพับ หากไม่ได้ใช้ตัดสินใจจริง
- การบังคับรีสอร์ตนับชิ้นก่อนส่ง

---

## 10. Critical Business Rules

### Rule 1 — Resort Sees Only Own Data

Resort Workspace ต้องถูกกรองด้วย resortId เสมอ

### Rule 2 — Count Happens at Laundry

จำนวนชิ้นจริงถูกบันทึกเมื่อโรงซักเปิดถุงและนับชิ้น

### Rule 3 — No Useless Steps

ห้ามเพิ่ม Step ที่ไม่ได้ใช้บริหารหรือตัดสินใจจริง

### Rule 4 — Issue Must Be Explicit

ผ้าที่เสียหาย หาย หรือจำนวนผิดปกติ ต้องบันทึกเป็น Issue

### Rule 5 — Inventory Is Calculated

Inventory ของรีสอร์ตต้องคำนวณจาก Work / Movement History ไม่ใช่กรอกซ้ำ

### Rule 6 — Work Detail Is the Main Operation Screen

กระบวนการรับถุงจนส่งกลับควรอยู่ในหน้า Work Detail เดียว ไม่แยกเป็นหน้าจอจำนวนมากโดยไม่จำเป็น

---

## 11. MVP Scope

MVP ต้องมี:

- Login แยก Laundry / Resort
- Laundry Dashboard
- Resort Dashboard
- Resort Management
- Create Laundry Work
- Receive Bags
- Open Bag
- Count Items
- Sort Type
- Sort Color
- Record Data
- Return Work
- Issue Report
- Linen Inventory Summary
- Basic Reports

---

## 12. FE Task Mapping

### FE-01 Foundation
สร้าง vocabulary และหลักการ Lean Production Flow / Workspace Isolation

### FE-02 Architecture
กำหนด Workspace, Route, Page, Surface และ Module Map

### FE-03 Runtime
กำหนด Work Status Lifecycle และ transition rules

### FE-04 UI Composition
ออกแบบ Dashboard, Work Detail, Timeline, Count & Sort Panel, Resort Linen Dashboard

### FE-05 State
จัดการ Work State, Count Line State, Inventory Summary State, Issue State, Workspace Scope State

### FE-06 Integration
กำหนด API contracts และ error boundaries

### FE-07 Quality
ตรวจ business rules, workspace isolation, inventory calculation, issue flow

### FE-08 Delivery
กำหนด MVP release checklist

### FE-09 Governance
กำหนดกฎการเปลี่ยน status, issue adjustment, และ workspace access control

---

## 13. Suggested Routes

Laundry Workspace:

```text
/laundry/dashboard
/laundry/works
/laundry/works/new
/laundry/works/:workId
/laundry/issues
/laundry/resorts
/laundry/reports
/laundry/settings
```

Resort Workspace:

```text
/resort/dashboard
/resort/inventory
/resort/history
/resort/issues
/resort/reports
```

---

## 14. Definition of Success

ระบบ v1 สำเร็จเมื่อ:

1. โรงซักสร้างงานรับถุงได้
2. โรงซักเปิดถุงและนับชิ้นได้
3. ระบบแยกประเภทและสีได้
4. ระบบบันทึกข้อมูลและสร้าง Inventory Summary ได้
5. โรงซักส่งกลับได้
6. เจ้าของโรงซักเห็นงานทั้งหมดและสถานะรวมได้
7. เจ้าของรีสอร์ตเห็นเฉพาะผ้าของตัวเองได้
8. เจ้าของรีสอร์ตเห็นผ้าทั้งหมด / อยู่โรงซัก / มีปัญหาได้
9. ปัญหาผ้าถูกบันทึกอย่างชัดเจน
10. ไม่มีขั้นตอนที่เพิ่มภาระโดยไม่เกิดประโยชน์จริง

---

## 15. Baseline Decision

Blueprint นี้ถือเป็นฐานหลักของระบบ

อนาคตสามารถเพิ่มหรือลดฟีเจอร์ได้ แต่ต้องยึด Flow หลักนี้เป็นแกน:

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
