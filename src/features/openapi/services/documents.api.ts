
import type {
  OpenApiDocument,
  CreateOpenApiDocumentData,
} from '../types/openapi.types'

import {
  httpRequest,
} from '../../../shared/services/http-client';



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
  return httpRequest<T>(endpoint, options);
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
