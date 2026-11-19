
import type { Api, ApiLifecycleStatus } from '../types/api.types'

import {
  httpRequest,
} from '../../../shared/services/http-client';



interface BackendApi {
  id: string
  name: string
  description: string | null
  owner: string
  status: ApiLifecycleStatus
  createdAt: string
  updatedAt: string
  versionCount?: number
  latestVersion?: string | null
}

export interface CreateBackendApiData {
  name: string
  description: string
  owner: string
}

export interface UpdateBackendApiData {
  name?: string
  description?: string
  owner?: string
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  return httpRequest<T>(endpoint, options);
}

function mapBackendApi(api: BackendApi): Api {
  return {
    id: api.id,
    name: api.name,
    description: api.description ?? '',
    owner: api.owner,
    status: api.status,


    latestVersion: api.latestVersion
      ? `v${api.latestVersion}`
      : '—',

    versionCount: api.versionCount ?? 0,

    updatedAt: api.updatedAt.slice(0, 10),
  }
}

export async function fetchApis(): Promise<Api[]> {
  const result = await request<BackendApi[]>('/apis')

  return result.map(mapBackendApi)
}

export async function fetchApiById(
  id: string,
): Promise<Api> {
  const result = await request<BackendApi>(
    `/apis/${encodeURIComponent(id)}`,
  )

  return mapBackendApi(result)
}

export async function createApiRequest(
  data: CreateBackendApiData,
): Promise<Api> {
  const result = await request<BackendApi>(
    '/apis',
    {
      method: 'POST',
      body: JSON.stringify(data),
    },
  )

  return mapBackendApi(result)
}

export async function updateApiRequest(
  id: string,
  data: UpdateBackendApiData,
): Promise<Api> {
  const result = await request<BackendApi>(
    `/apis/${encodeURIComponent(id)}`,
    {
      method: 'PATCH',
      body: JSON.stringify(data),
    },
  )

  return mapBackendApi(result)
}
