# Laundry schema.prisma v1.0

ไฟล์นี้เป็น schema.prisma ตัวตั้งต้นสำหรับโปรเจกต์ Laundry Operations & Linen Asset Management Platform

## Included

- Workspace isolation model
- Laundry Work / Bag / Count Line
- Linen Inventory Summary / Movement
- Issue Report
- Work Status Log
- Laundry Machine
- Laundry Machine Load Rule
- Wash Load Plan

## Production Planning Principle

เจ้าของโรงซักกำหนดเกณฑ์น้ำหนักที่เหมาะสมของแต่ละเครื่องเอง:

- minWeightKg = ต่ำกว่าค่านี้ถือว่าน้อยไป
- targetKg = น้ำหนักเป้าหมาย
- maxWeightKg = เกินค่านี้ถือว่ามากไป

ระบบใช้เกณฑ์นี้เพื่อช่วยพนักงานจัด Load ให้พอดี
