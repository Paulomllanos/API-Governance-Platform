
import type {
  OpenApiDocument,
  CreateOpenApiDocumentData,
} from '../types/openapi.types'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

interface BackendOpenApiDocument {
  id: string
  versionId: string
  fileName: string
  content?: string
  format: 'JSON' | 'YAML'
  openApiVersion: string
  isValid: boolean
  uploadedBy: string
  createdAt: string
}

export type OpenApiDocumentSummary =
  Omit<OpenApiDocument, 'content'>

export interface CreateDocumentRequestData {
  versionId: string
  fileName: string
  format: 'JSON' | 'YAML'
  content: string
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  if (!API_BASE_URL) {
    throw new Error(
      'No se ha configurado VITE_API_BASE_URL.',
    )
  }

  const response = await fetch(
    `${API_BASE_URL}${endpoint}`,
    {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    },
  )

  if (!response.ok) {
    throw new Error(
      `Error HTTP ${response.status}: ${response.statusText}`,
    )
  }

  return response.json() as Promise<T>
}

function mapDocument(
  document: BackendOpenApiDocument,
): OpenApiDocument {
  return {
    id: document.id,
    versionId: document.versionId,
    fileName: document.fileName,
    content: document.content ?? '',
    format: document.format,
    openApiVersion: document.openApiVersion,
    isValid: document.isValid,
    uploadedBy: document.uploadedBy,
    createdAt: document.createdAt,
  }
}

export async function fetchDocumentsByVersionId(
  versionId: string,
): Promise<OpenApiDocumentSummary[]> {
  const documents = await request<BackendOpenApiDocument[]>(
    `/versions/${encodeURIComponent(versionId)}/documents`,
  )

  return documents.map((document) => {
    const { content: _content, ...summary } =
      mapDocument(document)

    void _content

    return summary
  })
}

export async function fetchDocumentById(
  documentId: string,
): Promise<OpenApiDocument> {
  const document = await request<BackendOpenApiDocument>(
    `/documents/${encodeURIComponent(documentId)}`,
  )

  return mapDocument(document)
}

export async function createDocumentRequest(
  data: CreateDocumentRequestData,
): Promise<OpenApiDocument> {
  const document = await request<BackendOpenApiDocument>(
    `/versions/${encodeURIComponent(data.versionId)}/documents`,
    {
      method: 'POST',
      body: JSON.stringify({
        fileName: data.fileName,
        format: data.format,
        content: data.content,
      }),
    },
  )

  return mapDocument(document)
}

// Mantendremos este tipo para integrar después el formulario
// existente sin modificar prematuramente sus propiedades.
export type { CreateOpenApiDocumentData }
