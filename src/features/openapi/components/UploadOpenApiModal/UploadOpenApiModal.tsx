
import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
} from 'react'
import { FileCode2, UploadCloud, X } from 'lucide-react'

import type {
  CreateOpenApiDocumentData,
  OpenApiDocumentFormat,
} from '../../types/openapi.types'

import { validateOpenApi } from '../../utils/validateOpenApi'

import './UploadOpenApiModal.css'

interface UploadOpenApiModalProps {
  versionId: string
  version: string
  onClose: () => void
  onCreate: (data: CreateOpenApiDocumentData) => boolean
}

const MAX_FILE_SIZE = 1024 * 1024

export function UploadOpenApiModal({
  versionId,
  version,
  onClose,
  onCreate,
}: UploadOpenApiModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  const [fileName, setFileName] = useState('')
  const [fileContent, setFileContent] = useState('')
  const [format, setFormat] =
    useState<OpenApiDocumentFormat | null>(null)

  const [errors, setErrors] = useState<string[]>([])
  const [isReading, setIsReading] = useState(false)

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

  async function handleFileChange(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0]

    setErrors([])
    setFileName('')
    setFileContent('')
    setFormat(null)

    if (!file) return

    const extension = file.name
      .split('.')
      .pop()
      ?.toLowerCase()

    if (!['json', 'yaml', 'yml'].includes(extension ?? '')) {
      setErrors([
        'Selecciona un archivo JSON, YAML o YML.',
      ])
      event.target.value = ''
      return
    }

    if (file.size > MAX_FILE_SIZE) {
      setErrors(['El archivo no puede superar 1 MB.'])
      event.target.value = ''
      return
    }

    if (file.size === 0) {
      setErrors(['El archivo está vacío.'])
      event.target.value = ''
      return
    }

    setIsReading(true)

    try {
      const content = await file.text()

      if (!content.trim()) {
        setErrors([
          'El archivo no contiene información.',
        ])
        return
      }

      setFileName(file.name)
      setFileContent(content)
      setFormat(extension === 'json' ? 'JSON' : 'YAML')
    } catch {
      setErrors(['No fue posible leer el archivo.'])
    } finally {
      setIsReading(false)
      event.target.value = ''
    }
  }

  function handleRegister() {
    if (!format || !fileContent) {
      setErrors(['Primero selecciona un archivo.'])
      return
    }

    const validation = validateOpenApi(
      fileContent,
      format,
    )

    if (!validation.isValid || !validation.openApiVersion) {
      setErrors(validation.errors)
      return
    }

    const created = onCreate({
      versionId,
      fileName,
      content: fileContent,
      format,
      openApiVersion: validation.openApiVersion,
      isValid: true,
    })

    if (!created) {
      setErrors([
        'No fue posible registrar el documento.',
      ])
      return
    }

    onClose()
  }

  return (
    <div className="openapi-upload-overlay">
      <div
        className="openapi-upload-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="openapi-upload-title"
      >
        <header className="openapi-upload__header">
          <div>
            <h2 id="openapi-upload-title">
              Cargar especificación OpenAPI
            </h2>

            <p>
              Documento asociado a la versión v{version}
            </p>
          </div>

          <button
            ref={closeButtonRef}
            type="button"
            className="openapi-upload__close"
            onClick={onClose}
            aria-label="Cerrar formulario"
          >
            <X size={20} />
          </button>
        </header>

        <div className="openapi-upload__body">
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,.yaml,.yml"
            className="openapi-upload__file-input"
            onChange={handleFileChange}
            aria-label="Seleccionar archivo OpenAPI"
          />

          <div className="openapi-upload__dropzone">
            <UploadCloud size={30} />

            <strong>
              Selecciona tu especificación
            </strong>

            <p>
              JSON o YAML, tamaño máximo de 1 MB.
            </p>

            <button
              type="button"
              className="openapi-upload__select"
              disabled={isReading}
              onClick={() => fileInputRef.current?.click()}
            >
              {isReading
                ? 'Leyendo archivo...'
                : 'Seleccionar archivo'}
            </button>
          </div>

          {errors.length > 0 && (
            <div
              className="openapi-upload__validation-errors"
              role="alert"
            >
              <strong>
                No se pudo registrar la especificación:
              </strong>

              <ul>
                {errors.map((error, index) => (
                  <li key={`${index}-${error}`}>
                    {error}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {fileName && (
            <section className="openapi-upload__selected">
              <div className="openapi-upload__selected-heading">
                <FileCode2 size={19} />

                <div>
                  <strong>{fileName}</strong>
                  <span>
                    Archivo preparado para validación
                  </span>
                </div>
              </div>

              <label htmlFor="openapi-preview">
                Vista previa del contenido
              </label>

              <textarea
                id="openapi-preview"
                readOnly
                rows={9}
                value={fileContent}
              />
            </section>
          )}

          <p className="openapi-upload__notice">
            Se verificará la sintaxis JSON/YAML y los campos
            estructurales básicos de OpenAPI 3.0 o 3.1.
            Las reglas de gobierno se evaluarán posteriormente.
          </p>
        </div>

        <footer className="openapi-upload__footer">
          <button
            type="button"
            className="openapi-upload__cancel"
            onClick={onClose}
          >
            Cancelar
          </button>

          <button
            type="button"
            className="openapi-upload__register"
            onClick={handleRegister}
            disabled={!fileContent || isReading}
          >
            Validar y registrar
          </button>
        </footer>
      </div>
    </div>
  )
}
