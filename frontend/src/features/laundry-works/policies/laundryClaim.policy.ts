import type { ClaimStatus } from '../api/laundryClaimApi'
export const canCreateClaim=(workStatus?:string,issueStatus?:string,hasClaim=false,pending=false)=>!pending&&workStatus!=='CANCELLED'&&issueStatus!=='CANCELLED'&&!hasClaim
export const claimActions=(status:ClaimStatus,workStatus?:string,pending=false)=>{if(pending||workStatus==='CANCELLED'||['REJECTED','RESOLVED'].includes(status))return[] as string[];if(status==='OPEN')return['start-review','reject'];if(status==='IN_REVIEW')return['approve','reject'];if(status==='APPROVED')return['resolve'];return[]}
