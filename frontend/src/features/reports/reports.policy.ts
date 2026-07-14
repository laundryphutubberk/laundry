export const canViewReports=(role?:string,workspaceType?:string)=>workspaceType==='LAUNDRY'&&['LAUNDRY_OWNER','LAUNDRY_MANAGER'].includes(role||'')
