export type WorkflowStatus =
  | 'DRAFT'
  | 'EVALUATING'
  | 'WITH_OBSERVATIONS'
  | 'IN_REVIEW'
  | 'APPROVED'
  | 'REJECTED'

export const workflowStatusLabels: Record<
  WorkflowStatus,
  string
> = {
  DRAFT: 'Borrador',
  EVALUATING: 'En evaluación',
  WITH_OBSERVATIONS: 'Con observaciones',
  IN_REVIEW: 'En revisión',
  APPROVED: 'Aprobada',
  REJECTED: 'Rechazada',
}
