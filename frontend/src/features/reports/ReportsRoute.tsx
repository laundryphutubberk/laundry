import {lazy,Suspense} from 'react'
const ReportsPage=lazy(()=>import('./ReportsPage').then(module=>({default:module.ReportsPage})))
export function ReportsRoute(){return <Suspense fallback={<div className="p-6 font-bold">กำลังโหลดรายงาน...</div>}><ReportsPage/></Suspense>}
