import { LaundryIssueFlowPanel, type LaundryIssueBagOption, type LaundryIssueCountLineOption } from '../components/LaundryIssueFlowPanel'
import { useLaundryIssueRuntime } from '../hooks/useLaundryIssueRuntime'

export type LaundryIssueRuntimeHostProps = {
  workId?: string | number
  workStatus?: string
  bags?: LaundryIssueBagOption[]
  countLines?: LaundryIssueCountLineOption[]
}

export function LaundryIssueRuntimeHost({ workId, workStatus, bags, countLines }: LaundryIssueRuntimeHostProps) {
  const runtime = useLaundryIssueRuntime(workId, workStatus)

  return <LaundryIssueFlowPanel {...runtime} bags={bags} countLines={countLines} />
}
