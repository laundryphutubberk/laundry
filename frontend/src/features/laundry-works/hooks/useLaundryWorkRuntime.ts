import { useLaundryWorkController } from '../controllers/useLaundryWorkController'

/**
 * Runtime hook boundary for Laundry Work UI surfaces.
 *
 * Visual components must consume runtime output from this hook through
 * LaundryWorkRuntimeHost instead of calling API, store, policy, or projection
 * modules directly.
 */
export function useLaundryWorkRuntime() {
  return useLaundryWorkController()
}

export type LaundryWorkRuntime = ReturnType<typeof useLaundryWorkRuntime>
