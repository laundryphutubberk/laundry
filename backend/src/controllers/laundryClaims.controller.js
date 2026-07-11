const {sendSuccess}=require('../core/httpResponse');const {getRequestPolicyContext}=require('../core/policyContext');const service=require('../services/laundryClaims.service');const v=require('../validators/laundryClaims.validator');
const wrap=(handler)=>async(req,res,next)=>{try{return await handler(req,res)}catch(error){return next(error)}};
const list=wrap(async(req,res)=>sendSuccess(res,await service.listClaims(v.parse(v.workId,req.params).workId,getRequestPolicyContext(req))));
const detail=wrap(async(req,res)=>sendSuccess(res,await service.getClaim(v.parse(v.claimId,req.params).claimId,getRequestPolicyContext(req))));
const create=wrap(async(req,res)=>sendSuccess(res,await service.createClaim(v.parse(v.issueId,req.params).issueId,v.parse(v.createBody,req.body),getRequestPolicyContext(req)),undefined,201));
const command=(name,schema)=>wrap(async(req,res)=>sendSuccess(res,await service.commandClaim(v.parse(v.claimId,req.params).claimId,name,v.parse(schema,req.body||{}),getRequestPolicyContext(req))));
module.exports={list,detail,create,startReview:command('START_REVIEW',v.optionalReview),approve:command('APPROVE',v.optionalReview),reject:command('REJECT',v.rejectBody),resolve:command('RESOLVE',v.resolveBody)};
