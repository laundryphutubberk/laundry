import type { ReactNode } from 'react'
import type { LaundryWorkWorkspaceScope } from '../state/laundryWork.store'
import { useLaundryWorkController } from './useLaundryWorkController'

export type LaundryWorkRuntimeHostRenderProps = ReturnType<typeof useLaundryWorkController>

export type LaundryWorkRuntimeHostProps = {
  children: (runtime: LaundryWorkRuntimeHostRenderProps) => ReactNode
  initialWorkId?: string | number
  workspaceScope?: LaundryWorkWorkspaceScope
}

export function LaundryWorkRuntimeHost({ children, initialWorkId, workspaceScope }: LaundryWorkRuntimeHostProps) {
  const runtime = useLaundryWorkController({
    workId: initialWorkId,
    workspaceScope,
  })

  return <>{children(runtime)}</>
}
