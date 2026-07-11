const { z } = require('zod');
const parse = (schema, value) => { const result=schema.safeParse(value); if(!result.success){const error=Object.assign(new Error('Invalid request payload'),{statusCode:400,details:result.error.flatten()});throw error;} return result.data; };
const workId = z.object({ workId: z.coerce.number().int().positive() }); const issueId=z.object({issueId:z.coerce.number().int().positive()}); const claimId=z.object({claimId:z.coerce.number().int().positive()});
const createBody=z.object({claimReason:z.string().trim().min(1).max(2000)}); const optionalReview=z.object({reviewNote:z.string().trim().min(1).max(2000).optional()}); const rejectBody=z.object({reviewNote:z.string().trim().min(1).max(2000)}); const resolveBody=z.object({resolutionNote:z.string().trim().min(1).max(2000)});
module.exports={parse,workId,issueId,claimId,createBody,optionalReview,rejectBody,resolveBody};
