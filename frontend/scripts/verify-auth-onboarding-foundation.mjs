import { readFile } from 'node:fs/promises'

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8')
const requireText = (content, text, label) => {
  if (!content.includes(text)) throw new Error(`${label} missing: ${text}`)
}

const [session, login, routes, workspaceRoutes, onboarding, guard] = await Promise.all([
  read('src/features/auth/authSession.ts'),
  read('src/features/auth/LoginPage.tsx'),
  read('src/routes/index.jsx'),
  read('src/routes/laundryWorkRoutes.jsx'),
  read('src/features/auth/OnboardingPage.tsx'),
  read('src/features/auth/RequireBusinessContext.tsx'),
])

requireText(session, "return hasBusinessContext(session) ? operationalDestination : '/onboarding'", 'shared destination')
requireText(login, 'getAuthenticatedDestination(session, authenticatedDestination)', 'password/Google login routing')
requireText(routes, "path: '/onboarding'", 'onboarding route')
requireText(workspaceRoutes, '<RequireBusinessContext><LaundryWorkspaceLayout /></RequireBusinessContext>', 'workspace guard')
requireText(guard, 'if (!hasBusinessContext(session)) return <Navigate to="/onboarding" replace />', 'business-context guard')
requireText(onboarding, 'logoutCurrentDevice', 'onboarding logout')
if (/laundry-works|laundryWorkApi|resortApi/.test(onboarding)) throw new Error('Onboarding page depends on an operational API')

console.log('FRONTEND_AUTH_ONBOARDING_FOUNDATION_VERIFY=PASS')
