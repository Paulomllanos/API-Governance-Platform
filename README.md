# Plataforma de Gobierno de APIs — Frontend

Interfaz web del **MVP de Gobierno de APIs**, desarrollado como Proyecto de Título de Ingeniería en Computación e Informática (UNAB). Facilita el registro y versionado de APIs, la revisión de contratos OpenAPI, la consulta de hallazgos y Quality Score, el flujo de aprobación y la trazabilidad de decisiones.

> **Alcance:** MVP académico, no solución de gestión de APIs productiva certificada. Requiere el [backend del proyecto](https://github.com/Paulomllanos/api-governance-backend).

## Arquitectura

```text
Navegador
  └── React 19 + TypeScript + Vite
        ├── Login / sesión / autorización por roles
        ├── Dashboard, catálogo de APIs y versiones
        ├── Carga y consulta de documentos OpenAPI
        ├── Evaluaciones, reglas, hallazgos y Quality Score
        ├── Revisión, aprobaciones y notificaciones
        └── Administración de usuarios y auditoría
                 │ HTTP(S) REST /api/v1
                 ▼
            NestJS backend
                 │ Prisma
                 ▼
             PostgreSQL
```

La UI consume servicios reales del backend; no es un prototipo estático. Los controles visuales de acceso complementan, pero **no sustituyen**, las autorizaciones del servidor.

## Stack

- React 19, TypeScript, Vite 8 y React Router.
- Axios/fetch, Lucide React y estilos CSS.
- Vitest + Testing Library para pruebas de interfaz y lógica.

## Requisitos

- Node.js 22 y npm compatible.
- Backend NestJS y PostgreSQL configurados (ver repositorio de backend).

## Instalación local

```bash
git clone https://github.com/Paulomllanos/API-Governance-Platform.git
cd API-Governance-Platform
npm ci
```

Crear `.env.local` en la raíz:

```dotenv
VITE_API_BASE_URL=http://localhost:3000/api/v1
```

Iniciar:

```bash
npm run dev
```

Vite publica normalmente la interfaz en `http://localhost:5173`. Asegurar que `FRONTEND_URL` del backend coincida con ese origen.

## Comandos

| Comando | Propósito |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Verificación TypeScript y compilación Vite |
| `npm run preview` | Previsualización de build |
| `npm test` | Pruebas Vitest |
| `npm run lint` | Análisis estático con Oxlint |

## Módulos y rutas principales

| Ruta | Función |
|---|---|
| `/login` | Inicio de sesión |
| `/app/dashboard` | Indicadores del proyecto |
| `/app/apis` | Catálogo de APIs |
| `/app/apis/:apiId` | Detalle y versiones |
| `/app/rules` | Reglas de gobierno |
| `/app/evaluations` | Evaluaciones |
| `/app/findings` | Hallazgos |
| `/app/review` | Flujo de revisión |
| `/app/audit` | Auditoría y trazabilidad |
| `/app/settings/users` | Administración de usuarios (ADMIN) |

También incorpora búsqueda, notificaciones y configuración de perfil.

## Autenticación y seguridad

- El backend emite JWT de acceso y un refresh token administrado como cookie `HttpOnly`; la interfaz maneja renovación de sesión.
- Roles: `ADMIN`, `REVIEWER`, `DEVELOPER`.
- El backend debe mantener validaciones y autorización de cada operación.
- Nunca almacenar contraseñas, claves JWT ni cadenas de conexión en `VITE_*`: **las variables Vite se incluyen en el bundle público**.

## Preparación de despliegue gratuito

Despliegue previsto: frontend estático en Vercel, backend NestJS en Render y PostgreSQL en Neon, sujeto a disponibilidad y límites vigentes de sus planes.

1. Importar este repositorio a Vercel desde la rama `main`.
2. Configurar framework Vite, comando de build `npm run build` y directorio de salida `dist`.
3. Definir `VITE_API_BASE_URL` con la ruta base real. Para autenticación entre dominios, preferir un proxy del mismo origen y comprobar cookies y `Origin` con el backend antes de publicar.
4. Configurar un fallback de SPA para que las rutas como `/app/apis` funcionen al recargar; requiere reglas de rewrite en el hosting.
5. Probar login, creación de API, carga OpenAPI, evaluación, aprobación y auditoría.
6. Verificar en móvil/escritorio, renovación de sesión, permisos y cierre de sesión.

**Advertencia:** el proxy y las reglas de rewrite no están configurados automáticamente solo por este README. Validar su implementación junto a la configuración efectiva del hosting y CORS del backend.

## Pruebas y trazabilidad

El workflow `.github/workflows/mvp-ci.yml` ejecuta build y pruebas en PR dirigidos a `develope`; no debe asumirse que un merge a `main` ejecuta automáticamente el mismo CI. Para entregar evidencia, conservar logs, fecha y SHA del commit evaluado.

## Repositorios

- [Frontend](https://github.com/Paulomllanos/API-Governance-Platform)
- [Backend y persistencia](https://github.com/Paulomllanos/api-governance-backend)

## Limitaciones

Proyecto académico desarrollado para validar un proceso de gobierno de APIs basado en OpenAPI y un catálogo definido de reglas. No sustituye un APIM, un escáner dinámico de seguridad ni una auditoría formal de producción.
