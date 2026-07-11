const { prisma } = require('../core/prisma'); const db = (client) => client || prisma;
const include = { issue: { select: { id: true, workId: true, resortId: true, issueType: true, quantity: true, description: true, status: true, work: { select: { id: true, workNo: true, currentStatus: true, resortId: true } } } } };
const findIssue = ({ issueId, where, client }) => db(client).issueReport.findFirst({ where: { ...where, id: Number(issueId) }, include: { work: true, claim: true } });
const findById = ({ claimId, where, client }) => db(client).laundryClaim.findFirst({ where: { ...where, id: Number(claimId) }, include });
const listByWork = ({ workId, where, client }) => db(client).laundryClaim.findMany({ where: { issue: { ...where, workId: Number(workId) } }, include, orderBy: [{ createdAt: 'desc' }, { id: 'desc' }] });
const create = ({ data, client }) => db(client).laundryClaim.create({ data, include });
const transition = async ({ claimId, expectedStatus, data, client }) => { const d=db(client); const changed=await d.laundryClaim.updateMany({where:{id:Number(claimId),status:expectedStatus},data}); if(!changed.count)return null; return d.laundryClaim.findUnique({where:{id:Number(claimId)},include}); };
const transaction = (callback) => prisma.$transaction(callback);
module.exports = { findIssue, findById, listByWork, create, transition, transaction };
