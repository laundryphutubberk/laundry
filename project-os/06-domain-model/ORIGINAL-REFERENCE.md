# schema.prisma Patch

## LaundryItemType

เพิ่มฟิลด์

```prisma
weightPerPieceKg Float?
```

---

## LaundryWork

เพิ่ม relation

```prisma
washLoadPlans WashLoadPlan[]
```

// Laundry Operations & Linen Asset Management Platform
// schema.prisma v1.0
//
// Primary design:
// - Laundry Work is the operational center.
// - Bag is logistics intake unit.
// - Count Line is the real item count captured at laundry.
// - Inventory Summary is derived from movement history.
// - Resort workspace must be isolated by resortId.
// - Issues must be explicit.

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum UserRole {
  LAUNDRY_OWNER
  LAUNDRY_MANAGER
  LAUNDRY_STAFF
  RESORT_OWNER
  RESORT_STAFF
}

enum WorkspaceType {
  LAUNDRY
  RESORT
}

enum WorkStatus {
  DRAFT
  BAG_RECEIVED
  FACTORY_RECEIVED
  BAG_OPENED
  ITEM_COUNTED
  TYPE_SORTED
  COLOR_SORTED
  DATA_RECORDED
  RETURNED
  CLOSED
  CANCELLED
}

enum BagStatus {
  RECEIVED
  OPENED
  COUNTED
  CLOSED
}

enum MovementType {
  COUNTED_AT_LAUNDRY
  ISSUE_REPORTED
  RETURNED_TO_RESORT
  ADJUSTMENT
}

enum IssueType {
  DAMAGED
  MISSING
  COUNT_MISMATCH
  RETURN_MISMATCH
  OTHER
}

enum IssueStatus {
  OPEN
  REVIEWING
  RESOLVED
  CANCELLED
}

model User {
  id            Int           @id @default(autoincrement())
  email         String        @unique
  passwordHash  String
  displayName   String?
  role          UserRole
  workspaceType WorkspaceType

  resortId      Int?
  resort        Resort?       @relation(fields: [resortId], references: [id])

  active        Boolean       @default(true)
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt

  createdWorks  LaundryWork[] @relation("WorkCreatedBy")
  issueReports  IssueReport[] @relation("IssueReportedBy")
}

model Resort {
  id          Int      @id @default(autoincrement())
  name        String
  contactName String?
  contactPhone String?
  address     String?
  active      Boolean  @default(true)

  users       User[]
  works       LaundryWork[]
  bags        LaundryBag[]
  countLines  LaundryCountLine[]
  movements   LinenMovement[]
  inventory   LinenInventorySummary[]
  issues      IssueReport[]

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model LaundryItemType {
  id          Int      @id @default(autoincrement())
  name        String
  category    String?
  active      Boolean  @default(true)

  countLines  LaundryCountLine[]
  movements   LinenMovement[]
  inventory   LinenInventorySummary[]
  issues      IssueReport[]

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@unique([name, category])
}

model LaundryWork {
  id            Int        @id @default(autoincrement())
  workNo        String     @unique

  resortId      Int
  resort        Resort     @relation(fields: [resortId], references: [id])

  bagCount      Int        @default(0)
  currentStatus WorkStatus @default(DRAFT)
  issueCount    Int        @default(0)

  receivedDate  DateTime?
  returnedAt    DateTime?
  closedAt      DateTime?

  createdById   Int?
  createdBy     User?      @relation("WorkCreatedBy", fields: [createdById], references: [id])

  bags          LaundryBag[]
  countLines    LaundryCountLine[]
  movements     LinenMovement[]
  issues        IssueReport[]
  statusLogs    WorkStatusLog[]

  note          String?
  createdAt     DateTime   @default(now())
  updatedAt     DateTime   @updatedAt

  @@index([resortId])
  @@index([currentStatus])
  @@index([receivedDate])
}

model LaundryBag {
  id          Int       @id @default(autoincrement())

  workId      Int
  work        LaundryWork @relation(fields: [workId], references: [id], onDelete: Cascade)

  resortId    Int
  resort      Resort    @relation(fields: [resortId], references: [id])

  bagNo       String
  status      BagStatus @default(RECEIVED)

  receivedAt  DateTime?
  openedAt    DateTime?
  note        String?

  countLines  LaundryCountLine[]

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@unique([workId, bagNo])
  @@index([resortId])
  @@index([status])
}

model LaundryCountLine {
  id            Int       @id @default(autoincrement())

  workId        Int
  work          LaundryWork @relation(fields: [workId], references: [id], onDelete: Cascade)

  bagId         Int?
  bag           LaundryBag? @relation(fields: [bagId], references: [id])

  resortId      Int
  resort        Resort    @relation(fields: [resortId], references: [id])

  itemTypeId    Int
  itemType      LaundryItemType @relation(fields: [itemTypeId], references: [id])

  colorGroup    String?
  quantity      Int       @default(0)
  issueQuantity Int       @default(0)
  note          String?

  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  @@index([workId])
  @@index([bagId])
  @@index([resortId])
  @@index([itemTypeId])
  @@index([colorGroup])
}

model LinenMovement {
  id            Int       @id @default(autoincrement())

  resortId      Int
  resort        Resort    @relation(fields: [resortId], references: [id])

  workId        Int?
  work          LaundryWork? @relation(fields: [workId], references: [id])

  itemTypeId    Int
  itemType      LaundryItemType @relation(fields: [itemTypeId], references: [id])

  colorGroup    String?
  movementType  MovementType
  quantity      Int

  occurredAt    DateTime  @default(now())
  note          String?

  @@index([resortId])
  @@index([workId])
  @@index([itemTypeId])
  @@index([movementType])
  @@index([occurredAt])
}

model LinenInventorySummary {
  id             Int      @id @default(autoincrement())

  resortId       Int
  resort         Resort   @relation(fields: [resortId], references: [id])

  itemTypeId     Int
  itemType       LaundryItemType @relation(fields: [itemTypeId], references: [id])

  colorGroup     String?

  totalKnownQty  Int      @default(0)
  atResortQty    Int      @default(0)
  atLaundryQty   Int      @default(0)
  issueQty       Int      @default(0)
  returnedQty    Int      @default(0)

  calculatedAt   DateTime @default(now())
  updatedAt      DateTime @updatedAt

  @@unique([resortId, itemTypeId, colorGroup])
  @@index([resortId])
  @@index([itemTypeId])
}

model IssueReport {
  id            Int       @id @default(autoincrement())

  workId        Int
  work          LaundryWork @relation(fields: [workId], references: [id], onDelete: Cascade)

  resortId      Int
  resort        Resort    @relation(fields: [resortId], references: [id])

  itemTypeId    Int?
  itemType      LaundryItemType? @relation(fields: [itemTypeId], references: [id])

  colorGroup    String?
  issueType     IssueType
  quantity      Int       @default(0)
  description   String?
  status        IssueStatus @default(OPEN)

  reportedById  Int?
  reportedBy    User?     @relation("IssueReportedBy", fields: [reportedById], references: [id])

  reportedAt    DateTime  @default(now())
  resolvedAt    DateTime?

  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  @@index([workId])
  @@index([resortId])
  @@index([itemTypeId])
  @@index([status])
}

model WorkStatusLog {
  id            Int       @id @default(autoincrement())

  workId        Int
  work          LaundryWork @relation(fields: [workId], references: [id], onDelete: Cascade)

  fromStatus    WorkStatus?
  toStatus      WorkStatus
  changedById   Int?
  changedByName String?
  changedAt     DateTime  @default(now())
  note          String?

  @@index([workId])
  @@index([toStatus])
  @@index([changedAt])
}


---

## New Model

```prisma
model LaundryMachine {
  id          Int      @id @default(autoincrement())
  name        String
  capacityKg  Float
  active      Boolean  @default(true)

  washLoadPlans WashLoadPlan[]

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model WashLoadPlan {
  id            Int      @id @default(autoincrement())

  workId        Int
  work          LaundryWork @relation(fields: [workId], references: [id], onDelete: Cascade)

  machineId     Int
  machine       LaundryMachine @relation(fields: [machineId], references: [id])

  totalWeightKg Float
  loadNo        Int
  note          String?

  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@index([workId])
  @@index([machineId])
}
```

## Business Notes

- ใช้สำหรับช่วยจัดรอบซัก
- ไม่แทนข้อมูลการนับผ้า
- สามารถสร้างอัตโนมัติจากจำนวนชิ้นและน้ำหนักมาตรฐาน
