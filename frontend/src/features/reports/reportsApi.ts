import {authenticatedFetch} from '../auth/authApi'
const BASE=import.meta.env.VITE_API_BASE_URL||'/api'
export type Range={startDate:string;endDate:string;timezone:string;days:number}
export type Overview={range:Range;metrics:Record<string,number>}
export type Trend={date:string;created:number;closed:number;cancelled:number}
export type ResortReport={resortId:number;resortName:string;totalWorks:number;activeWorks:number;closedWorks:number;bags:number;itemCount:number;issueCount:number}
export type ItemReport={itemTypeId:number;name:string;category?:string|null;active:boolean;quantity:number;weightKg:number|null;workCount:number}
export type IssueReport={range:Range;byStatus:Record<string,number>;byType:Record<string,number>;topResorts:Array<{resortId:number;resortName:string;issueCount:number}>}
type Page<T>={range:Range;items:T[];pagination:{total:number;skip:number;take:number}}
async function get<T>(path:string,params:Record<string,string|number|undefined>){const query=new URLSearchParams();Object.entries(params).forEach(([key,value])=>{if(value!==undefined&&value!=='')query.set(key,String(value))});const response=await authenticatedFetch(`${BASE}/laundry/reports/${path}?${query}`);const body=await response.json().catch(()=>({}));if(!response.ok||body.success===false)throw new Error(body?.error?.message||'Unable to load report');return body.data as T}
export const reportsApi={overview:(range:Record<string,string>)=>get<Overview>('overview',range),trends:(range:Record<string,string>)=>get<{range:Range;items:Trend[]}>('trends',range),resorts:(params:Record<string,string|number|undefined>)=>get<Page<ResortReport>>('resorts',params),items:(params:Record<string,string|number|undefined>)=>get<Page<ItemReport>>('items',params),issues:(range:Record<string,string>)=>get<IssueReport>('issues',range)}
