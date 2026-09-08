import { useCallback } from 'react';
import { Alert } from 'react-native';

import { toast } from '@/lib/toast';
import { useCollectionStore } from '@/store/use-collection-store';
import type { MagazineDetail } from '@/types';

/**
 * Statut partagé entre les écrans « résultat du scan » et « recherche
 * manuelle » : résolution de l'édition affichée, possession d'un exemplaire
 * et ajout d'un exemplaire (avec confirmation si déjà possédé).
 */
export function useScanResult(detail: MagazineDetail | null, id: string | null) {
  const addExistingCopy = useCollectionStore((s) => s.addExistingCopy);

  const resolved = detail != null && detail.id === id;
  const owned = resolved && detail.copies.length > 0;
  const ownedCount = resolved ? detail.copies.length : 0;

  const handleAddCopy = useCallback(() => {
    if (!id) {
      return;
    }
    const alreadyOwned = owned;

    const perform = async () => {
      await addExistingCopy(id);
      toast(alreadyOwned ? 'Exemplaire ajouté à la collection' : 'Ajouté à la collection');
    };

    if (alreadyOwned) {
      Alert.alert(
        'Vous possédez déjà ce magazine',
        `Exemplaires actuels : ${ownedCount}\nVoulez-vous ajouter un deuxième exemplaire ?`,
        [
          { text: 'Annuler', style: 'cancel' },
          { text: 'Ajouter quand même', style: 'destructive', onPress: perform },
        ],
      );
    } else {
      perform();
    }
  }, [id, owned, ownedCount, addExistingCopy]);

  return { resolved, owned, ownedCount, handleAddCopy };
}
