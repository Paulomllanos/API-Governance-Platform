
import type { ApiVersion } from '../features/versions/types/version.types'

export const mockVersions: ApiVersion[] = [
  {
    id: 'version-001',
    apiId: 'api-001',
    version: '1.0.0',
    description: 'Versión inicial de la API.',
    status: 'DEPRECATED',
    createdAt: '2026-07-10',
    updatedAt: '2026-07-10',
  },
  {
    id: 'version-002',
    apiId: 'api-001',
    version: '1.1.0',
    description: 'Incorporación de nuevos recursos de clientes.',
    status: 'DEPRECATED',
    createdAt: '2026-08-15',
    updatedAt: '2026-08-15',
  },
  {
    id: 'version-003',
    apiId: 'api-001',
    version: '1.2.0',
    description: 'Mejoras de documentación y seguridad.',
    status: 'ACTIVE',
    createdAt: '2026-09-22',
    updatedAt: '2026-10-08',
  },
]
