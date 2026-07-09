import type { ReactNode } from 'react'
import { useLaundryWorkRuntime, type LaundryWorkRuntime } from '../hooks/useLaundryWorkRuntime'

export type LaundryWorkRuntimeHostRenderProps = LaundryWorkRuntime

export type LaundryWorkRuntimeHostProps = {
  children: (runtime: LaundryWorkRuntimeHostRenderProps) => ReactNode
}

export function LaundryWorkRuntimeHost({ children }: LaundryWorkRuntimeHostProps) {
  const runtime = useLaundryWorkRuntime()

  return <>{children(runtime)}</>
}
