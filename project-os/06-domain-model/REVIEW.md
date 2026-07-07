# Review

พบประเด็นที่ควรปรับ

1. `weightPerPieceKg` ควรเก็บเป็น Decimal แทน Float หากต้องการความแม่นยำด้านน้ำหนัก
2. `WashLoadPlan` ควรมี `status` เพื่อรองรับ Draft/Planned/InProgress/Completed
3. ควรมี `estimatedPieceCount` เพื่อเก็บจำนวนชิ้นที่ใช้วางแผน ไม่ต้องคำนวณย้อนหลังทุกครั้ง
4. `LaundryMachine` ควรมี `code` และ `displayOrder`
5. ไม่ควรผูก `WashLoadPlan` กับการนับผ้าโดยตรง ให้เป็น Production Planning Layer แยกจาก Runtime
6. แนวคิดโดยรวมถูกต้องและสอดคล้องกับโครงสร้างเดิม
