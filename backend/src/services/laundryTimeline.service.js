const works = require('../repositories/laundryWorks.repository');
const { assertLaundryStaffActor } = require('../policies/authorization.policy');
const { buildRequiredActorResortScopedWhere } = require('../policies/workspace.policy');

const titles = {
  BAG_RECEIVED: 'รับถุงผ้า', FACTORY_RECEIVED: 'โรงซักรับถุง', BAG_OPENED: 'เปิดถุง', ITEM_COUNTED: 'นับผ้าเสร็จ',
  TYPE_SORTED: 'แยกประเภทเสร็จ', COLOR_SORTED: 'แยกสีเสร็จ', DATA_RECORDED: 'บันทึกข้อมูลแล้ว', RETURNED: 'ส่งกลับรีสอร์ต', CLOSED: 'ปิดงาน', CANCELLED: 'ยกเลิกงาน',
};
const entry = (source, id, eventType, occurredAt, title, description, actor) => ({ id: `${source}:${id}:${eventType}`, eventType, occurredAt, title, description, actor: actor || null, source: { entityType: source, entityId: id } });

const getLaundryWorkTimeline = async (workId, context = {}) => {
  const actor = assertLaundryStaffActor(context.actor);
  const work = await works.findLaundryWorkById({ workId, where: buildRequiredActorResortScopedWhere({ actor }) });
  if (!work) { const error = new Error('Laundry Work not found'); error.statusCode = 404; throw error; }
  const events = [entry('WORK', work.id, 'WORK_CREATED', work.createdAt, 'สร้างงานซัก', work.workNo)];
  for (const log of work.statusLogs || []) events.push(entry('STATUS_LOG', log.id, log.toStatus, log.changedAt, titles[log.toStatus] || log.toStatus, log.note, log.changedByName));
  for (const bag of work.bags || []) {
    events.push(entry('BAG', bag.id, 'BAG_RECEIVED', bag.createdAt, 'รับถุงผ้า', bag.bagNo));
    if (bag.openedAt) events.push(entry('BAG', bag.id, 'BAG_OPENED', bag.openedAt, 'เปิดถุงผ้า', bag.bagNo));
  }
  for (const issue of work.issues || []) {
    events.push(entry('ISSUE', issue.id, 'ISSUE_CREATED', issue.reportedAt || issue.createdAt, 'บันทึกปัญหา', issue.description));
    if (issue.status === 'RESOLVED' && issue.resolvedAt) events.push(entry('ISSUE', issue.id, 'ISSUE_RESOLVED', issue.resolvedAt, 'แก้ไขปัญหาแล้ว', issue.description));
    if (issue.status === 'CANCELLED') events.push(entry('ISSUE', issue.id, 'ISSUE_CANCELLED', issue.updatedAt, 'ยกเลิกปัญหา', issue.description));
  }
  for (const image of work.images || []) {
    events.push(entry('IMAGE', image.id, 'IMAGE_CREATED', image.createdAt, 'เพิ่มรูปภาพ', image.caption || image.originalName));
    if (image.deletedAt) events.push(entry('IMAGE', image.id, 'IMAGE_DELETED', image.deletedAt, 'นำรูปภาพออก', image.caption || image.originalName));
  }
  return events.filter((item) => item.occurredAt).sort((a, b) => new Date(a.occurredAt) - new Date(b.occurredAt) || a.id.localeCompare(b.id));
};
module.exports = { getLaundryWorkTimeline };
