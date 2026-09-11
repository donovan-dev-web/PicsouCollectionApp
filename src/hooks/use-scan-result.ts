import type { Magazine } from '@/types';

/**
 * Résolution de l'édition affichée sur les écrans « résultat du scan » et
 * « recherche manuelle » : une fois le détail chargé pour l'identifiant visé,
 * l'état est résolu. Chaque édition en collection étant possédée (le système
 * d'exemplaires a été supprimé — retours test physique), il n'y a plus de
 * statut « absent » ni d'ajout d'exemplaire.
 */
export function useScanResult(detail: Magazine | null, id: string | null) {
  const resolved = detail != null && detail.id === id;
  return { resolved };
}
