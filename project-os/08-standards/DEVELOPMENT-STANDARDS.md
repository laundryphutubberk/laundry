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

### Prisma 7 Runtime Standard
- Backend runtime uses Prisma 7.
- `DATABASE_URL` is configured through `backend/prisma.config.ts`.
- `backend/prisma/schema.prisma` must include `generator client`.
- `backend/prisma/schema.prisma` must keep `datasource db` provider-only for PostgreSQL.
- Do not add `url = env("DATABASE_URL")` to `schema.prisma`.
- Prisma Client must use `@prisma/adapter-pg` for direct PostgreSQL runtime connections.
- Do not use `datasourceUrl` in the PrismaClient constructor.
- After schema/runtime changes, run `npx prisma generate` and `npm run verify:runtime` from `backend/`.

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
