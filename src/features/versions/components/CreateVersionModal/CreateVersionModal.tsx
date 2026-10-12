
import { useEffect, useState, type FormEvent } from 'react'
import { X } from 'lucide-react'

import { Input } from '../../../../components/ui/Input/Input'
import { Button } from '../../../../components/ui/Button/Button'

import type { CreateApiVersionData } from '../../types/version.types'

import './CreateVersionModal.css'

interface CreateVersionModalProps {
  apiId: string
  existingVersions: string[]
  onClose: () => void
  onCreate: (data: CreateApiVersionData) => boolean
}

export function CreateVersionModal({
  apiId,
  existingVersions,
  onClose,
  onCreate,
}: CreateVersionModalProps) {
  const [version, setVersion] = useState('')
  const [description, setDescription] = useState('')
  const [versionError, setVersionError] = useState('')

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

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const normalizedVersion = version.trim()

    if (!normalizedVersion) {
      setVersionError('La versión es obligatoria.')
      return
    }

    if (!/^\d+\.\d+\.\d+$/.test(normalizedVersion)) {
      setVersionError(
        'Utiliza el formato MAJOR.MINOR.PATCH. Ejemplo: 1.3.0.'
      )
      return
    }

    if (existingVersions.includes(normalizedVersion)) {
      setVersionError(
        'Esta versión ya se encuentra registrada en la API.'
      )
      return
    }

    const created = onCreate({
      apiId,
      version: normalizedVersion,
      description: description.trim(),
    })

    if (!created) {
      setVersionError(
        'No fue posible registrar la versión. Verifica los datos.'
      )
      return
    }

    onClose()
  }

  return (
    <div className="create-version-overlay">
      <div
        className="create-version-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-version-title"
      >
        <header className="create-version-modal__header">
          <div>
            <h2 id="create-version-title">
              Nueva versión
            </h2>
            <p>
              Registra una nueva versión de esta API.
            </p>
          </div>

          <button
            type="button"
            className="create-version-modal__close"
            onClick={onClose}
            aria-label="Cerrar formulario"
          >
            <X size={19} />
          </button>
        </header>

        <form onSubmit={handleSubmit} noValidate>
          <div className="create-version-modal__body">
            <Input
              id="new-api-version"
              label="Número de versión"
              placeholder="Ej. 1.3.0"
              helperText="Formato: MAJOR.MINOR.PATCH"
              value={version}
              maxLength={30}
              autoFocus
              required
              error={versionError}
              onChange={(event) => {
                setVersion(event.target.value)
                setVersionError('')
              }}
            />

            <div className="create-version-modal__field">
              <label htmlFor="version-description">
                Descripción
              </label>

              <textarea
                id="version-description"
                placeholder="Describe los cambios incorporados..."
                value={description}
                maxLength={500}
                onChange={(event) =>
                  setDescription(event.target.value)
                }
              />
            </div>

            <div className="create-version-modal__notice">
              La nueva versión se registrará como
              <strong> Borrador</strong>. Posteriormente podrás
              asociar su especificación OpenAPI y evaluarla
              según las reglas de gobierno.
            </div>
          </div>

          <footer className="create-version-modal__footer">
            <button
              type="button"
              className="create-version-modal__cancel"
              onClick={onClose}
            >
              Cancelar
            </button>

            <Button type="submit">
              Registrar versión
            </Button>
          </footer>
        </form>
      </div>
    </div>
  )
}
