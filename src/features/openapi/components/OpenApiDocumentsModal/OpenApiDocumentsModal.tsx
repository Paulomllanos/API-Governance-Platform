import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FileCode2, X } from "lucide-react";

import type { OpenApiDocument } from "../../types/openapi.types";

import { fetchDocumentById } from "../../services/documents.api";

import "./OpenApiDocumentsModal.css";

interface OpenApiDocumentsModalProps {
  version: string;
  documents: OpenApiDocument[];
  onClose: () => void;
  onRequestEvaluation: (documentId: string) => Promise<string>;
}

export function OpenApiDocumentsModal({
  version,
  documents,
  onClose,
  onRequestEvaluation,
}: OpenApiDocumentsModalProps) {
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(
    documents[0]?.id ?? null,
  );

  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const selectedDocument = documents.find(
    (document) => document.id === selectedDocumentId,
  );

  const [requestError, setRequestError] = useState("");
  const [isRequestingEvaluation, setIsRequestingEvaluation] = useState(false);

  const navigate = useNavigate();

  const [previewContent, setPreviewContent] = useState("");
  const [isLoadingContent, setIsLoadingContent] = useState(false);
  const [contentError, setContentError] = useState("");

  useEffect(() => {
    closeButtonRef.current?.focus();
  }, []);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !isRequestingEvaluation) {
        onClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose, isRequestingEvaluation]);

  useEffect(() => {
    if (!selectedDocumentId) return;

    let active = true;

    setPreviewContent("");
    setContentError("");
    setIsLoadingContent(true);

    void fetchDocumentById(selectedDocumentId)
      .then((document) => {
        if (!active) return;
        setPreviewContent(document.content);
      })
      .catch(() => {
        if (!active) return;

        setContentError("No fue posible obtener el contenido del documento.");
      })
      .finally(() => {
        if (active) {
          setIsLoadingContent(false);
        }
      });

    return () => {
      active = false;
    };
  }, [selectedDocumentId]);

  async function handleRequestEvaluation() {
    if (!selectedDocument || isRequestingEvaluation) {
      return;
    }

    setRequestError("");
    setIsRequestingEvaluation(true);

    try {
      const evaluationId = await onRequestEvaluation(selectedDocument.id);

      onClose();

      void navigate(`/app/evaluations/${evaluationId}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "";

      if (message.includes("404")) {
        setRequestError("El documento ya no existe en PostgreSQL.");
      } else {
        setRequestError(
          "No fue posible registrar la evaluación. Verifica la conexión con NestJS.",
        );
      }
    } finally {
      setIsRequestingEvaluation(false);
    }
  }

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
            <h2 id="openapi-documents-title">Especificaciones OpenAPI</h2>
            <p>Documentos asociados a la versión v{version}</p>
          </div>

          <button
            ref={closeButtonRef}
            type="button"
            className="openapi-documents__close"
            onClick={onClose}
            aria-label="Cerrar documentos"
            disabled={isRequestingEvaluation}
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
                className={`openapi-documents__item ${
                  selectedDocumentId === document.id
                    ? "openapi-documents__item--active"
                    : ""
                }`}
                onClick={() => setSelectedDocumentId(document.id)}
                aria-pressed={selectedDocumentId === document.id}
              >
                <FileCode2 size={19} />

                <span>
                  <strong>{document.fileName}</strong>
                  <small>
                    {document.format} · OpenAPI {document.openApiVersion}
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
                    Registrado el{" "}
                    {new Date(selectedDocument.createdAt).toLocaleDateString(
                      "es-CL",
                    )}
                  </p>
                </div>

                <span className="openapi-documents__valid">
                  Validación básica superada
                </span>
              </div>

              <label htmlFor="openapi-document-content">
                Contenido de la especificación
              </label>

              {contentError && (
                <p role="alert" className="openapi-documents__error">
                  {contentError}
                </p>
              )}

              <textarea
                id="openapi-document-content"
                readOnly
                value={previewContent}
                placeholder={
                  isLoadingContent
                    ? "Cargando contenido desde PostgreSQL..."
                    : "Selecciona un documento para ver su contenido."
                }
                aria-busy={isLoadingContent}
                rows={16}
              />
            </section>
          )}
        </div>

        <footer className="openapi-documents__footer">
          {requestError && (
            <span role="alert" className="openapi-documents__error">
              {requestError}
            </span>
          )}

          <button
            type="button"
            className="openapi-documents__evaluate"
            disabled={!selectedDocument || isRequestingEvaluation}
            onClick={() => {
              void handleRequestEvaluation();
            }}
          >
            {isRequestingEvaluation
              ? "Ejecutando evaluación..."
              : "Solicitar evaluación"}
          </button>

          <button
            type="button"
            onClick={onClose}
            disabled={isRequestingEvaluation}
          >
            Cerrar
          </button>
        </footer>
      </div>
    </div>
  );
}
