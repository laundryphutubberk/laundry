# DEVELOPMENT-STANDARDS.md

## Architecture
- Feature-first
- Component reuse
- One Codebase
- One API Contract

## Coding
- ใช้ TypeScript เมื่อเริ่มโปรเจกต์
- หลีกเลี่ยง Business Logic ใน UI
- State แยกจาก View
- Small reusable components

## Database
- Prisma เป็น Source of Truth ของโครงสร้างข้อมูล
- Migration ทุกครั้งต้อง review

## API
- REST naming คงที่
- ไม่เปลี่ยน Response โดยไม่เพิ่ม version เมื่อจำเป็น

## UI
- Adaptive Workspace
- Task-Oriented UI
- Mobile และ Desktop ใช้ Component เดียวกัน

## Documentation
ทุก Feature ใหม่ต้องอัปเดต
- Business Blueprint (ถ้ากระทบธุรกิจ)
- schema.prisma (ถ้ากระทบข้อมูล)
- Glossary (ถ้ามีคำใหม่)
