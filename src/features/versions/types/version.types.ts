export type ApiVersionStatus =
  | 'DRAFT'
  | 'ACTIVE'
  | 'DEPRECATED'

export interface ApiVersion {
  id: string
  apiId: string
  version: string
  description: string
  status: ApiVersionStatus
  createdAt: string
  updatedAt: string
}

export interface CreateApiVersionData {
  apiId: string
  version: string
  description: string
}
