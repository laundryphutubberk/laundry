const {z}=require('zod');
const timezone=z.string().trim().min(1).max(100).refine(value=>{try{Intl.DateTimeFormat('en-US',{timeZone:value});return true;}catch{return false;}},'Invalid timezone');
const nullableText=(max)=>z.string().trim().max(max).nullable().optional();
const workspaceSettingsBodySchema=z.object({tenantDisplayName:z.string().trim().min(1).max(200).optional(),legalName:nullableText(250),timezone:timezone.optional(),workspaceDisplayName:nullableText(200),branchName:z.string().trim().min(1).max(200).optional(),branchAddress:nullableText(1000),branchTimezone:timezone.nullable().optional()}).strict().refine(value=>Object.keys(value).length>0,'At least one setting is required');
const parseRequest=(schema,value)=>{const result=schema.safeParse(value);if(!result.success)throw Object.assign(new Error('Invalid workspace settings'),{statusCode:400,details:result.error.flatten()});return result.data;};
module.exports={parseRequest,workspaceSettingsBodySchema};
