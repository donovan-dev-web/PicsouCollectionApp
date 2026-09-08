import { Platform, ToastAndroid } from 'react-native';

import { toast } from '@/lib/toast';

describe('toast', () => {
  it('affiche un toast court sur Android', () => {
    const osReplace = jest.replaceProperty(Platform, 'OS', 'android');
    const show = jest.spyOn(ToastAndroid, 'show');

    toast('Collection exportée');

    expect(show).toHaveBeenCalledWith('Collection exportée', ToastAndroid.SHORT);
    osReplace.restore();
    show.mockRestore();
  });

  it('ne fait rien sur les autres plateformes', () => {
    const osReplace = jest.replaceProperty(Platform, 'OS', 'ios');
    const show = jest.spyOn(ToastAndroid, 'show');

    toast('Collection exportée');

    expect(show).not.toHaveBeenCalled();
    osReplace.restore();
    show.mockRestore();
  });
});
