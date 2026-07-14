const { prisma } = require('../core/prisma');

const workWhere = (range) => ({ createdAt: { gte: range.start, lt: range.endExclusive } });

const overview = async (range) => {
  const works = workWhere(range);
  const [totalWorks, statuses, resorts, bags, countAggregate, weightedLines, unweightedLineCount, issues, claims] = await Promise.all([
    prisma.laundryWork.count({ where: works }),
    prisma.laundryWork.groupBy({ by: ['currentStatus'], where: works, _count: { _all: true } }),
    prisma.laundryWork.findMany({ where: works, distinct: ['resortId'], select: { resortId: true } }),
    prisma.laundryBag.count({ where: { work: works } }),
    prisma.laundryCountLine.aggregate({ where: { work: works }, _sum: { quantity: true } }),
    prisma.laundryCountLine.findMany({ where: { work: works, itemType: { weightPerPieceKg: { not: null } } }, select: { quantity: true, itemType: { select: { weightPerPieceKg: true } } } }),
    prisma.laundryCountLine.count({ where: { work: works, itemType: { weightPerPieceKg: null } } }),
    prisma.issueReport.groupBy({ by: ['status'], where: { work: works }, _count: { _all: true } }),
    prisma.laundryClaim.groupBy({ by: ['status'], where: { issue: { work: works } }, _count: { _all: true } }),
  ]);
  return { totalWorks, statuses, totalResorts: resorts.length, totalBags: bags, totalItemCount: countAggregate._sum.quantity || 0, totalWeightKg: weightedLines.reduce((sum, line) => sum + (line.quantity * Number(line.itemType.weightPerPieceKg)), 0), weightComplete: unweightedLineCount === 0, issues, claims };
};

const trends = async (range) => prisma.$queryRaw`
  WITH days AS (
    SELECT generate_series(${range.startDate}::date, ${range.endDate}::date, interval '1 day') AS report_day
  ), created AS (
    SELECT date("createdAt" AT TIME ZONE 'Asia/Bangkok') AS report_day, count(*)::int AS count FROM "LaundryWork"
    WHERE "createdAt" >= ${range.start} AND "createdAt" < ${range.endExclusive} GROUP BY 1
  ), closed AS (
    SELECT date("closedAt" AT TIME ZONE 'Asia/Bangkok') AS report_day, count(*)::int AS count FROM "LaundryWork"
    WHERE "closedAt" >= ${range.start} AND "closedAt" < ${range.endExclusive} GROUP BY 1
  ), cancelled AS (
    SELECT date("changedAt" AT TIME ZONE 'Asia/Bangkok') AS report_day, count(DISTINCT "workId")::int AS count FROM "WorkStatusLog"
    WHERE "toStatus" = 'CANCELLED' AND "changedAt" >= ${range.start} AND "changedAt" < ${range.endExclusive} GROUP BY 1
  ) SELECT to_char(days.report_day, 'YYYY-MM-DD') AS date, coalesce(created.count,0)::int AS created, coalesce(closed.count,0)::int AS closed, coalesce(cancelled.count,0)::int AS cancelled
  FROM days LEFT JOIN created ON created.report_day=days.report_day LEFT JOIN closed ON closed.report_day=days.report_day LEFT JOIN cancelled ON cancelled.report_day=days.report_day ORDER BY days.report_day`;

const resorts = async (range, query) => {
  const where = query.search ? { name: { contains: query.search, mode: 'insensitive' } } : {};
  const all = await prisma.resort.findMany({ where, select: { id: true, name: true }, take: 500 });
  const ids = all.map((item) => item.id);
  if (!ids.length) return [];
  const works = await prisma.laundryWork.groupBy({ by: ['resortId', 'currentStatus'], where: { ...workWhere(range), resortId: { in: ids } }, _count: { _all: true } });
  const bags = await prisma.laundryBag.groupBy({ by: ['resortId'], where: { resortId: { in: ids }, work: workWhere(range) }, _count: { _all: true } });
  const lines = await prisma.laundryCountLine.groupBy({ by: ['resortId'], where: { resortId: { in: ids }, work: workWhere(range) }, _sum: { quantity: true } });
  const issues = await prisma.issueReport.groupBy({ by: ['resortId'], where: { resortId: { in: ids }, work: workWhere(range) }, _count: { _all: true } });
  return all.map((resort) => {
    const grouped = works.filter((row) => row.resortId === resort.id); const status = Object.fromEntries(grouped.map((row) => [row.currentStatus, row._count._all]));
    return { resortId: resort.id, resortName: resort.name, totalWorks: grouped.reduce((sum,row)=>sum+row._count._all,0), activeWorks: grouped.filter(row=>!['CLOSED','CANCELLED'].includes(row.currentStatus)).reduce((sum,row)=>sum+row._count._all,0), closedWorks: status.CLOSED || 0, bags: bags.find(row=>row.resortId===resort.id)?._count._all || 0, itemCount: lines.find(row=>row.resortId===resort.id)?._sum.quantity || 0, issueCount: issues.find(row=>row.resortId===resort.id)?._count._all || 0 };
  });
};

const items = async (range, query) => {
  const where = query.search ? { OR: [{ name: { contains: query.search, mode: 'insensitive' } }, { category: { contains: query.search, mode: 'insensitive' } }] } : {};
  const types = await prisma.laundryItemType.findMany({ where, select: { id: true, name: true, category: true, active: true, weightPerPieceKg: true }, take: 500 });
  const grouped = types.length ? await prisma.laundryCountLine.groupBy({ by: ['itemTypeId'], where: { itemTypeId: { in: types.map(type=>type.id) }, work: workWhere(range) }, _sum: { quantity: true }, _count: { workId: true } }) : [];
  const workCounts = types.length ? await prisma.laundryCountLine.findMany({ where: { itemTypeId: { in: types.map(type=>type.id) }, work: workWhere(range) }, distinct: ['itemTypeId','workId'], select: { itemTypeId: true, workId: true } }) : [];
  return types.map((type) => { const row=grouped.find(item=>item.itemTypeId===type.id); const quantity=row?._sum.quantity || 0; return { itemTypeId:type.id, name:type.name, category:type.category, active:type.active, quantity, weightKg:type.weightPerPieceKg===null?null:quantity*Number(type.weightPerPieceKg), workCount:workCounts.filter(item=>item.itemTypeId===type.id).length }; });
};

const issueSummary = async (range) => {
  const where = { work: workWhere(range) };
  const [byStatus, byType, topResorts] = await Promise.all([
    prisma.issueReport.groupBy({ by:['status'], where, _count:{_all:true} }), prisma.issueReport.groupBy({ by:['issueType'], where, _count:{_all:true} }), prisma.issueReport.groupBy({ by:['resortId'], where, _count:{_all:true}, orderBy:{_count:{resortId:'desc'}}, take:5 }),
  ]);
  const resorts = topResorts.length ? await prisma.resort.findMany({ where:{id:{in:topResorts.map(row=>row.resortId)}}, select:{id:true,name:true} }) : [];
  return { byStatus, byType, topResorts:topResorts.map(row=>({resortId:row.resortId,resortName:resorts.find(item=>item.id===row.resortId)?.name || '',issueCount:row._count._all})) };
};

module.exports = { overview, trends, resorts, items, issueSummary };
