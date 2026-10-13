
import { createContext } from 'react'

import type { Api } from '../types/api.types'
import type { CreateApiData } from '../components/CreateApiModal/CreateApiModal'

import type {
  ApiVersion,
  CreateApiVersionData,
} from '../../versions/types/version.types'

import type {
  OpenApiDocument,
  CreateOpenApiDocumentData,
} from '../../openapi/types/openapi.types'

import type {
  GovernanceExecution,
  RuleResult,
  CreateEvaluationData,
} from '../../evaluations/types/evaluation.types'

export interface ApiContextValue {
  apis: Api[]
  isLoadingApis: boolean
  apisError: string | null
  refreshApis: () => Promise<void>
  createApi: (data: CreateApiData) => Promise<boolean>
  getApiById: (id: string) => Api | undefined

  versions: ApiVersion[]
  getVersionsByApiId: (apiId: string) => ApiVersion[]
  createVersion: (data: CreateApiVersionData) => boolean
  documents: OpenApiDocument[]

  getDocumentsByVersionId: (
    versionId: string,
  ) => OpenApiDocument[]

  createDocument: (
    data: CreateOpenApiDocumentData,
  ) => boolean

  evaluations: GovernanceExecution[]
  ruleResults: RuleResult[]
  getEvaluationsByDocumentId: (
    documentId: string,
  ) => GovernanceExecution[]
  requestEvaluation: (
    data: CreateEvaluationData,
  ) => boolean

  
  

}

export const ApiContext = createContext<ApiContextValue | undefined>(
  undefined
)
