export type ApiLifecycleStatus =
  | 'ACTIVE'
  | 'DRAFT'
  | 'DEPRECATED'

export interface Api {
  id: string
  name: string
  description: string
  owner: string
  status: ApiLifecycleStatus
  latestVersion: string
  versionCount: number
  updatedAt: string
}
