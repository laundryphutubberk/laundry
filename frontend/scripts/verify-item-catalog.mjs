import { readFile } from 'node:fs/promises'

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8')
const [page, api, policy, routes, shell, workApi] = await Promise.all([
  read('src/features/item-catalog/ItemCatalogPage.tsx'),
  read('src/features/item-catalog/itemCatalogApi.ts'),
  read('src/features/item-catalog/itemCatalog.policy.ts'),
  read('src/routes/laundryWorkRoutes.jsx'),
  read('src/features/laundry-works/components/LaundryWorkspaceShell.tsx'),
  read('src/features/laundry-works/api/laundryWorkApi.ts'),
])
const requireText = (source, value, label) => { if (!source.includes(value)) throw new Error(`${label} missing: ${value}`) }
requireText(routes, "path: 'item-types'", 'catalog route')
requireText(shell, '/workspace/laundry/item-types', 'catalog navigation')
requireText(policy, "'LAUNDRY_OWNER', 'LAUNDRY_MANAGER'", 'management RBAC')
requireText(page, 'canManageItemCatalog', 'shared frontend RBAC')
requireText(page, 'ItemTypeEditor', 'shared create/edit form')
requireText(page, 'activeFilter', 'active state filter')
requireText(page, 'statusTarget', 'deactivation confirmation')
requireText(page, 'min-h-11', 'mobile touch targets')
requireText(page, 'overflow-y-auto', 'mobile dialog scrolling')
requireText(api, "params.set('search'", 'server search')
requireText(api, "params.set('skip'", 'server pagination')
requireText(api, "method: 'POST'", 'create contract')
requireText(api, "method: 'PATCH'", 'update contract')
requireText(workApi, "'/laundry/item-types'", 'Work counting integration')
if (/method:\s*['"]DELETE|deleteLaundryItemType/.test(api + page)) throw new Error('Catalog hard delete must remain unavailable')
console.log('FRONTEND_ITEM_CATALOG_VERIFY=PASS')
