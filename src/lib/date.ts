/**
 * Formateurs de date partagés (fr-FR) — évite la duplication entre
 * `(tabs)/index.tsx` et `collection/[id]/index.tsx`.
 */

const DATE_MONTH_NAME = new Intl.DateTimeFormat('fr-FR', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});

function parseDateSafe(iso: string | null): Date | null {
  if (!iso) {
    return null;
  }
  const time = Date.parse(iso);
  return Number.isNaN(time) ? null : new Date(time);
}

/** Format long : « 1 sep. 2026 » — retourne le sous-chaîné brut si invalide. */
export function formatDateLong(iso: string | null): string {
  const d = parseDateSafe(iso);
  return d ? DATE_MONTH_NAME.format(d) : (iso?.slice(0, 10) ?? 'Inconnue');
}

/** Format court : « 1/09/2026 » — retourne « Inconnue » si nul ou invalide. */
export function formatDateShort(iso: string | null): string {
  const d = parseDateSafe(iso);
  return d ? d.toLocaleDateString('fr-FR') : 'Inconnue';
}
