
import {
  useEffect,
  useRef,
  useState,
} from 'react'
import {
  FileCode2,
  X,
} from 'lucide-react'

import type { OpenApiDocument } from '../../types/openapi.types'

import './OpenApiDocumentsModal.css'

interface OpenApiDocumentsModalProps {
  version: string
  documents: OpenApiDocument[]
  onClose: () => void
}

export function OpenApiDocumentsModal({
  version,
  documents,
  onClose,
}: OpenApiDocumentsModalProps) {
  const [selectedDocumentId, setSelectedDocumentId] =
    useState<string | null>(documents[0]?.id ?? null)

  const closeButtonRef = useRef<HTMLButtonElement>(null)

  const selectedDocument = documents.find(
    (document) => document.id === selectedDocumentId,
  )

  useEffect(() => {
    closeButtonRef.current?.focus()
  }, [])

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose])

  return (
    <div className="openapi-documents-overlay">
      <div
        className="openapi-documents-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="openapi-documents-title"
      >
        <header className="openapi-documents__header">
          <div>
            <h2 id="openapi-documents-title">
              Especificaciones OpenAPI
            </h2>
            <p>
              Documentos asociados a la versión v{version}
            </p>
          </div>

          <button
            ref={closeButtonRef}
            type="button"
            className="openapi-documents__close"
            onClick={onClose}
            aria-label="Cerrar documentos"
          >
            <X size={20} />
          </button>
        </header>

        <div className="openapi-documents__body">
          <div className="openapi-documents__list">
            {documents.map((document) => (
              <button
                key={document.id}
                type="button"
                className={
                  `openapi-documents__item ${
                    selectedDocumentId === document.id
                      ? 'openapi-documents__item--active'
                      : ''
                  }`
                }
                onClick={() => setSelectedDocumentId(document.id)}
                aria-pressed={selectedDocumentId === document.id}
              >
                <FileCode2 size={19} />

                <span>
                  <strong>{document.fileName}</strong>
                  <small>
                    {document.format} · OpenAPI{' '}
                    {document.openApiVersion}
                  </small>
                </span>
              </button>
            ))}

            {documents.length === 0 && (
              <p className="openapi-documents__empty">
                No hay especificaciones registradas.
              </p>
            )}
          </div>

          {selectedDocument && (
            <section className="openapi-documents__preview">
              <div className="openapi-documents__preview-header">
                <div>
                  <h3>{selectedDocument.fileName}</h3>

                  <p>
                    Registrado el{' '}
                    {new Date(
                      selectedDocument.createdAt,
                    ).toLocaleDateString('es-CL')}
                  </p>
                </div>

                <span className="openapi-documents__valid">
                  Validación básica superada
                </span>
              </div>

              <label htmlFor="openapi-document-content">
                Contenido de la especificación
              </label>

              <textarea
                id="openapi-document-content"
                readOnly
                value={selectedDocument.content}
                rows={16}
              />
            </section>
          )}
        </div>

        <footer className="openapi-documents__footer">
          <button
            type="button"
            onClick={onClose}
          >
            Cerrar
          </button>
        </footer>
      </div>
    </div>
  )
}
