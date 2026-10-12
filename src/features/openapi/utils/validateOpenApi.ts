
import { parseDocument } from 'yaml'

import type {
    OpenApiDocumentFormat,
} from '../types/openapi.types'

export interface OpenApiValidationResult {
    isValid: boolean
    openApiVersion: string | null
    errors: string[]
}

function isRecord(
    value: unknown,
): value is Record<string, unknown> {
    return (
        typeof value === 'object' &&
        value !== null &&
        !Array.isArray(value)
    )
}

export function validateOpenApi(
    content: string,
    format: OpenApiDocumentFormat,
): OpenApiValidationResult {
    const errors: string[] = []
    let parsed: unknown

    try {
        if (format === 'JSON') {
            parsed = JSON.parse(content)
        } else {
            const document = parseDocument(content, {
                uniqueKeys: true,
                strict: true,
            })

            if (document.errors.length > 0) {
                return {
                    isValid: false,
                    openApiVersion: null,
                    errors: document.errors.map(
                        (error) => error.message,
                    ),
                }
            }

            parsed = document.toJS()
        }
    } catch (error) {
        return {
            isValid: false,
            openApiVersion: null,
            errors: [
                error instanceof Error
                    ? `No se pudo interpretar el archivo: ${error.message}`
                    : 'No se pudo interpretar el archivo.',
            ],
        }
    }

    if (!isRecord(parsed)) {
        return {
            isValid: false,
            openApiVersion: null,
            errors: [
                'La especificación debe contener un objeto principal.',
            ],
        }
    }

    const version = parsed.openapi

    if (typeof version !== 'string') {
        errors.push(
            'Falta el campo obligatorio "openapi".',
        )
    } else if (!/^3\.(0|1)\.\d+$/.test(version)) {
        errors.push(
            'El MVP admite especificaciones OpenAPI 3.0.x y 3.1.x.',
        )
    }

    if (!isRecord(parsed.info)) {
        errors.push(
            'Falta el objeto obligatorio "info".',
        )
    } else {
        if (
            typeof parsed.info.title !== 'string' ||
            !parsed.info.title.trim()
        ) {
            errors.push(
                'El campo "info.title" es obligatorio.',
            )
        }

        if (
            typeof parsed.info.version !== 'string' ||
            !parsed.info.version.trim()
        ) {
            errors.push(
                'El campo "info.version" es obligatorio.',
            )
        }
    }

    if (
        parsed.paths !== undefined &&
        !isRecord(parsed.paths)
    ) {
        errors.push('"paths" debe ser un objeto.')
    }

    if (
        parsed.components !== undefined &&
        !isRecord(parsed.components)
    ) {
        errors.push('"components" debe ser un objeto.')
    }

    if (
        parsed.webhooks !== undefined &&
        !isRecord(parsed.webhooks)
    ) {
        errors.push('"webhooks" debe ser un objeto.')
    }

    if (
        !isRecord(parsed.paths) &&
        !isRecord(parsed.components) &&
        !(
            typeof version === 'string' &&
            version.startsWith('3.1.') &&
            isRecord(parsed.webhooks)
        )
    ) {
        errors.push(
            'La especificación debe incluir "paths", "components" o, en OpenAPI 3.1, "webhooks".',
        )
    }

    return {
        isValid: errors.length === 0,
        openApiVersion:
            typeof version === 'string' ? version : null,
        errors,
    }
}
