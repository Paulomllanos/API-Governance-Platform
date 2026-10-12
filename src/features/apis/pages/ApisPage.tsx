
import { useMemo, useState } from 'react'
import {
  Layers3,
  Plus,
  Search,
  ArrowRight,
} from 'lucide-react'

import { Link } from 'react-router-dom'

import { useApis } from '../hooks/useApis'

import { Button } from '../../../components/ui/Button/Button'
import { Card } from '../../../components/ui/Card/Card'


import { CreateApiModal } from '../components/CreateApiModal/CreateApiModal'
import type { CreateApiData } from '../components/CreateApiModal/CreateApiModal'


import type { ApiLifecycleStatus } from '../types/api.types'

import './ApisPage.css'

type StatusFilter = ApiLifecycleStatus | 'ALL'

const statusLabels: Record<ApiLifecycleStatus, string> = {
  ACTIVE: 'Activa',
  DRAFT: 'Borrador',
  DEPRECATED: 'Deprecada',
}

export function ApisPage() {
  const [search, setSearch] = useState('')

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL')

  const { apis, createApi } = useApis()
  
  function handleCreateApi(data: CreateApiData): boolean {
    const created = createApi(data);

    if (created) {
      setSearch("");
      setStatusFilter("ALL");
    }

    return created;
  }

  
  const filteredApis = useMemo(() => {
    const term = search.trim().toLowerCase();

    return apis.filter((api) => {
      const matchesSearch =
        api.name.toLowerCase().includes(term) ||
        api.description.toLowerCase().includes(term) ||
        api.owner.toLowerCase().includes(term);

      const matchesStatus = statusFilter === "ALL" || api.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [apis, search, statusFilter]);


  return (
    <div className="apis-page">
      <header className="apis-page__header">
        <div className="apis-page__heading">
          <h1 className="apis-page__title">Catálogo de APIs</h1>

          <p className="apis-page__description">
            Administra las APIs registradas y sus versiones.
          </p>
        </div>

        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus size={17} />
          Nueva API
        </Button>
      </header>

      <div className="apis-page__summary">
        <span>
          <strong>{apis.length}</strong> APIs registradas
        </span>

        <span>
          <strong>
            {apis.filter((api) => api.status === "ACTIVE").length}
          </strong>{" "}
          activas
        </span>
      </div>

      <Card className="apis-catalog">
        <div className="apis-catalog__header">
          <div>
            <h2>APIs registradas</h2>
            <p>Explora y administra los activos de tu ecosistema.</p>
          </div>

          <span className="apis-catalog__count">
            {filteredApis.length} resultados
          </span>
        </div>

        <div className="apis-catalog__toolbar">
          <label className="apis-search">
            <Search size={17} />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por nombre, descripción o responsable..."
              aria-label="Buscar APIs"
            />
          </label>

          <select
            className="apis-filter"
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value as StatusFilter)
            }
            aria-label="Filtrar APIs por estado"
          >
            <option value="ALL">Todos los estados</option>
            <option value="ACTIVE">Activas</option>
            <option value="DRAFT">Borradores</option>
            <option value="DEPRECATED">Deprecadas</option>
          </select>
        </div>

        <div className="apis-table-wrapper">
          <table className="apis-table">
            <thead>
              <tr>
                <th>API</th>
                <th>Responsable</th>
                <th>Última versión</th>
                <th>Estado</th>
                <th>Actualización</th>
                <th aria-label="Acciones" />
              </tr>
            </thead>

            <tbody>
              {filteredApis.map((api) => (
                <tr key={api.id}>
                  <td>
                    <div className="apis-table__identity">
                      <div className="apis-table__icon">
                        <Layers3 size={19} />
                      </div>

                      <div className="apis-table__details">
                        <strong>{api.name}</strong>
                        <span>{api.description}</span>
                      </div>
                    </div>
                  </td>

                  <td>{api.owner}</td>

                  <td>
                    <span className="apis-table__version">
                      {api.latestVersion}
                    </span>
                  </td>

                  <td>
                    <span
                      className={`apis-status apis-status--${api.status.toLowerCase()}`}
                    >
                      {statusLabels[api.status]}
                    </span>
                  </td>

                  <td>
                    {new Date(`${api.updatedAt}T12:00:00`).toLocaleDateString(
                      "es-CL",
                    )}
                  </td>
                  <td>
                    <Link
                      to={`/app/apis/${api.id}`}
                      className="apis-table__detail-link"
                      aria-label={`Ver detalle de ${api.name}`}
                      title={`Ver detalle de ${api.name}`}
                    >
                      <ArrowRight size={17} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredApis.length === 0 && (
            <div className="apis-catalog__empty">
              No se encontraron APIs con los filtros seleccionados.
            </div>
          )}
        </div>
      </Card>
      {isCreateModalOpen && (
        <CreateApiModal
          onClose={() => setIsCreateModalOpen(false)}
          onCreate={handleCreateApi}
        />
      )}
    </div>
  );
}
