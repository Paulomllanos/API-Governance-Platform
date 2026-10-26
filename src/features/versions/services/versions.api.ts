
import type {
  ApiVersion,
  CreateApiVersionData,
} from '../types/version.types'

import {
  httpRequest,
} from '../../../shared/services/http-client';



interface BackendApiVersion {
  id: string
  apiId: string
  version: string
  description: string
  status: ApiVersion['status']
  createdAt: string
  updatedAt: string
}

function mapBackendVersion(
  version: BackendApiVersion,
): ApiVersion {
  return {
    id: version.id,
    apiId: version.apiId,
    version: version.version,
    description: version.description,
    status: version.status,
    createdAt: version.createdAt,
    updatedAt: version.updatedAt,
  }
}


async function request<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  return httpRequest<T>(endpoint, options);
}


export async function fetchVersionsByApiId(
  apiId: string,
): Promise<ApiVersion[]> {
  const result = await request<BackendApiVersion[]>(
    `/apis/${encodeURIComponent(apiId)}/versions`,
  )

  return result.map(mapBackendVersion)
}

export async function createVersionRequest(
  data: CreateApiVersionData,
): Promise<ApiVersion> {
  const result = await request<BackendApiVersion>(
    `/apis/${encodeURIComponent(data.apiId)}/versions`,
    {
      method: 'POST',
      body: JSON.stringify({
        version: data.version,
        description: data.description,
      }),
    },
  )

  return mapBackendVersion(result)
}
