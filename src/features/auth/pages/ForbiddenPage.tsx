
import { Link } from 'react-router-dom';

import { ShieldAlert } from 'lucide-react';

import './ForbiddenPage.css';

export function ForbiddenPage() {
  return (
    <main className="forbidden-page">
      <section className="forbidden-page__card">
        <ShieldAlert
          className="forbidden-page__icon"
          size={42}
          aria-hidden="true"
        />

        <span className="forbidden-page__code">
          Error 403
        </span>

        <h1>Acceso denegado</h1>

        <p>
          Tu cuenta no tiene los permisos necesarios
          para acceder a esta sección de
          API Governance Platform.
        </p>

        <Link
          className="forbidden-page__button"
          to="/app/dashboard"
        >
          Volver al dashboard
        </Link>
      </section>
    </main>
  );
}
