
import { useState, type FormEvent } from 'react'
import { X } from 'lucide-react'

import { Input } from '../../../../components/ui/Input/Input'
import { Button } from '../../../../components/ui/Button/Button'

import './CreateApiModal.css'

export interface CreateApiData {
  name: string
  description: string
  owner: string
}

interface CreateApiModalProps {
  onClose: () => void
  onCreate: (data: CreateApiData) => boolean
}

export function CreateApiModal({
  onClose,
  onCreate,
}: CreateApiModalProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [owner, setOwner] = useState('')
  const [errors, setErrors] = useState<
    Partial<Record<keyof CreateApiData, string>>
  >({})

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const data = {
      name: name.trim(),
      description: description.trim(),
      owner: owner.trim(),
    }

    const nextErrors: typeof errors = {}

    if (!data.name) {
      nextErrors.name = 'El nombre es obligatorio.'
    } else if (data.name.length < 3) {
      nextErrors.name = 'Ingresa al menos 3 caracteres.'
    }

    if (!data.description) {
      nextErrors.description = 'La descripción es obligatoria.'
    }

    if (!data.owner) {
      nextErrors.owner = 'El responsable es obligatorio.'
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    const created = onCreate(data)

    if (!created) {
      setErrors({
        name: 'Ya existe una API registrada con este nombre.',
      })
      return
    }

    onClose()
  }

  return (
    <div className="create-api-overlay">
      <div
        className="create-api-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-api-title"
      >
        <header className="create-api-modal__header">
          <div>
            <h2 id="create-api-title">Nueva API</h2>
            <p>
              Registra un nuevo activo en el catálogo de gobierno.
            </p>
          </div>

          <button
            type="button"
            className="create-api-modal__close"
            onClick={onClose}
            aria-label="Cerrar formulario"
          >
            <X size={20} />
          </button>
        </header>

        <form onSubmit={handleSubmit} noValidate>
          <div className="create-api-modal__body">
            <Input
              id="api-name"
              label="Nombre de la API"
              placeholder="Ej. Customer Management API"
              value={name}
              maxLength={100}
              autoFocus
              onChange={(event) => {
                setName(event.target.value)
                setErrors((current) => ({
                  ...current,
                  name: undefined,
                }))
              }}
              error={errors.name}
              required
            />

            <div className="create-api-modal__field">
              <label htmlFor="api-description">
                Descripción
              </label>

              <textarea
                id="api-description"
                value={description}
                maxLength={500}
                placeholder="Describe el propósito de esta API..."
                onChange={(event) => {
                  setDescription(event.target.value)
                  setErrors((current) => ({
                    ...current,
                    description: undefined,
                  }))
                }}
                aria-invalid={Boolean(errors.description)}
                required
              />

              {errors.description && (
                <span className="create-api-modal__error">
                  {errors.description}
                </span>
              )}
            </div>

            <Input
              id="api-owner"
              label="Responsable"
              placeholder="Ej. Equipo de Integraciones"
              value={owner}
              maxLength={100}
              onChange={(event) => {
                setOwner(event.target.value)
                setErrors((current) => ({
                  ...current,
                  owner: undefined,
                }))
              }}
              error={errors.owner}
              helperText="Nombre del equipo responsable de la API."
              required
            />

            <div className="create-api-modal__information">
              La API se registrará en estado Borrador.
              Podrás agregar versiones y especificaciones
              OpenAPI posteriormente.
            </div>
          </div>

          <footer className="create-api-modal__footer">
            <button
              type="button"
              className="create-api-modal__cancel"
              onClick={onClose}
            >
              Cancelar
            </button>

            <Button type="submit">
              Registrar API
            </Button>
          </footer>
        </form>
      </div>
    </div>
  )
}
