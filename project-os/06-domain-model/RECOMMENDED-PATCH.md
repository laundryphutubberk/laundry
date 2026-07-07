# Recommended Prisma Patch

## LaundryItemType

```prisma
weightPerPieceKg Decimal? @db.Decimal(6,3)
```

## LaundryWork

```prisma
washLoadPlans WashLoadPlan[]
```

## New Enum

```prisma
enum WashLoadStatus {
  DRAFT
  PLANNED
  IN_PROGRESS
  COMPLETED
  CANCELLED
}
```

## LaundryMachine

```prisma
model LaundryMachine {
  id           Int      @id @default(autoincrement())
  code         String   @unique
  name         String
  capacityKg   Decimal  @db.Decimal(6,2)
  displayOrder Int      @default(0)
  active       Boolean  @default(true)

  washLoadPlans WashLoadPlan[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

## WashLoadPlan

```prisma
model WashLoadPlan {
  id                  Int      @id @default(autoincrement())

  workId              Int
  work                LaundryWork @relation(fields:[workId],references:[id],onDelete:Cascade)

  machineId           Int
  machine             LaundryMachine @relation(fields:[machineId],references:[id])

  loadNo              Int
  estimatedPieceCount Int
  totalWeightKg       Decimal @db.Decimal(8,2)

  status              WashLoadStatus @default(DRAFT)

  note                String?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([workId,loadNo])
  @@index([workId])
  @@index([machineId])
  @@index([status])
}
```
