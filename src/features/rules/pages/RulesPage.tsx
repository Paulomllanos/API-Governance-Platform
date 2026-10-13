import { useMemo, useState } from "react";
import { Search, ShieldCheck } from "lucide-react";

import { Card } from "../../../components/ui/Card/Card";
import { GOVERNANCE_RULES } from "../constants/governanceRules";
import { RULE_CATEGORIES } from "../constants/ruleCategories";

import { RuleDetailModal } from "../components/RuleDetailModal/RuleDetailModal";
import type { GovernanceRule } from "../types/rule.types";

import type { RuleCategory, RuleSeverity } from "../types/rule.types";

import "./RulesPage.css";

type CategoryFilter = RuleCategory | "ALL";
type SeverityFilter = RuleSeverity | "ALL";

const severityLabels: Record<RuleSeverity, string> = {
  LOW: "Baja",
  MEDIUM: "Media",
  HIGH: "Alta",
  CRITICAL: "Crítica",
};

export function RulesPage() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("ALL");
  const [severityFilter, setSeverityFilter] = useState<SeverityFilter>("ALL");

  const [selectedRule, setSelectedRule] = useState<GovernanceRule | null>(null);

  const filteredRules = useMemo(() => {
    const term = search.trim().toLowerCase();

    return GOVERNANCE_RULES.filter((rule) => {
      const matchesSearch =
        rule.code.toLowerCase().includes(term) ||
        rule.name.toLowerCase().includes(term) ||
        rule.description.toLowerCase().includes(term);

      const matchesCategory =
        categoryFilter === "ALL" || rule.category === categoryFilter;

      const matchesSeverity =
        severityFilter === "ALL" || rule.severity === severityFilter;

      return matchesSearch && matchesCategory && matchesSeverity;
    });
  }, [search, categoryFilter, severityFilter]);

  const blockingRules = GOVERNANCE_RULES.filter((rule) => rule.blocking).length;

  return (
    <div className="rules-page">
      <header className="rules-page__header">
        <div>
          <h1>Reglas de gobierno</h1>
          <p>
            Consulta los criterios de evaluación definidos para las
            especificaciones OpenAPI.
          </p>
        </div>
      </header>

      <section className="rules-page__metrics" aria-label="Resumen de reglas">
        <Card className="rules-page__metric">
          <span>Reglas del catálogo</span>
          <strong>{GOVERNANCE_RULES.length}</strong>
        </Card>

        <Card className="rules-page__metric">
          <span>Categorías</span>
          <strong>{RULE_CATEGORIES.length}</strong>
        </Card>

        <Card className="rules-page__metric">
          <span>Reglas bloqueantes</span>
          <strong>{blockingRules}</strong>
        </Card>
      </section>

      <Card className="rules-page__catalog">
        <div className="rules-page__catalog-heading">
          <div>
            <h2>Catálogo de reglas</h2>
            <p>Criterios del MVP organizados por categoría y severidad.</p>
          </div>

          <span>{filteredRules.length} resultados</span>
        </div>

        <div className="rules-page__filters">
          <label className="rules-page__search">
            <Search size={17} />

            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por código, nombre o descripción..."
              aria-label="Buscar reglas"
            />
          </label>

          <select
            value={categoryFilter}
            onChange={(event) =>
              setCategoryFilter(event.target.value as CategoryFilter)
            }
            aria-label="Filtrar por categoría"
          >
            <option value="ALL">Todas las categorías</option>

            {RULE_CATEGORIES.map((category) => (
              <option key={category.id} value={category.id}>
                {category.label}
              </option>
            ))}
          </select>

          <select
            value={severityFilter}
            onChange={(event) =>
              setSeverityFilter(event.target.value as SeverityFilter)
            }
            aria-label="Filtrar por severidad"
          >
            <option value="ALL">Todas las severidades</option>
            <option value="LOW">Baja</option>
            <option value="MEDIUM">Media</option>
            <option value="HIGH">Alta</option>
            <option value="CRITICAL">Crítica</option>
          </select>
        </div>

        <div className="rules-page__table-scroll">
          <table className="rules-page__table">
            <thead>
              <tr>
                <th>Código</th>
                <th>Regla</th>
                <th>Categoría</th>
                <th>Severidad</th>
                <th>Estado</th>
              </tr>
            </thead>

            <tbody>
              {filteredRules.map((rule) => {
                const category = RULE_CATEGORIES.find(
                  (item) => item.id === rule.category,
                );

                return (
                  <tr key={rule.id}>
                    <td className="rules-page__code">
                      <button
                        type="button"
                        className="rules-page__detail-trigger"
                        onClick={() => setSelectedRule(rule)}
                        aria-label={`Ver detalle de la regla ${rule.code}`}
                      >
                        {rule.code}
                      </button>
                    </td>

                    <td>
                      <div className="rules-page__rule-name">
                        <ShieldCheck size={17} />

                        <div>
                          <strong>{rule.name}</strong>
                          <small>{rule.description}</small>

                          {rule.blocking && (
                            <span className="rules-page__blocking">
                              Bloqueante
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    <td>{category?.label ?? rule.category}</td>

                    <td>
                      <span
                        className={`rules-page__severity rules-page__severity--${rule.severity.toLowerCase()}`}
                      >
                        {severityLabels[rule.severity]}
                      </span>
                    </td>

                    <td>
                      <span className="rules-page__enabled">
                        {rule.enabled ? "Habilitada" : "Deshabilitada"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredRules.length === 0 && (
            <div className="rules-page__empty">
              No se encontraron reglas con los filtros seleccionados.
            </div>
          )}
        </div>
      </Card>
      {selectedRule && (
        <RuleDetailModal
          rule={selectedRule}
          onClose={() => setSelectedRule(null)}
        />
      )}
    </div>
  );
}
