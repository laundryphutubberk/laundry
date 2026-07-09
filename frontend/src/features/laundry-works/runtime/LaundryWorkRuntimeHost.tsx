import type { ReactNode } from 'react'
import { useLaundryWorkController } from '../controllers/useLaundryWorkController'

export type LaundryWorkRuntimeHostRenderProps = ReturnType<typeof useLaundryWorkController>

export type LaundryWorkRuntimeHostProps = {
  children: (runtime: LaundryWorkRuntimeHostRenderProps) => ReactNode
}

export function LaundryWorkRuntimeHost({ children }: LaundryWorkRuntimeHostProps) {
  const runtime = useLaundryWorkController()

  return <>{children(runtime)}</>
}
