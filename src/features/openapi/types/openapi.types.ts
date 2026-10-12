
export type OpenApiDocumentFormat = 'JSON' | 'YAML'

export interface OpenApiDocument {
  id: string
  versionId: string
  fileName: string
  content: string
  format: OpenApiDocumentFormat
  openApiVersion: string
  isValid: boolean
  uploadedBy: string
  createdAt: string
}

export interface CreateOpenApiDocumentData {
  versionId: string
  fileName: string
  content: string
  format: OpenApiDocumentFormat
  openApiVersion: string
  isValid: boolean
}
