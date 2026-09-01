import { useSettingsStore } from '@/store/use-settings-store';

describe('useSettingsStore', () => {
  beforeEach(() => {
    useSettingsStore.setState({ colorScheme: 'system' });
  });

  it('initialise le colorScheme sur system', () => {
    expect(useSettingsStore.getState().colorScheme).toBe('system');
  });

  it('met à jour le colorScheme via setColorScheme', () => {
    useSettingsStore.getState().setColorScheme('dark');
    expect(useSettingsStore.getState().colorScheme).toBe('dark');

    useSettingsStore.getState().setColorScheme('light');
    expect(useSettingsStore.getState().colorScheme).toBe('light');
  });

  it('accepte le retour à system', () => {
    useSettingsStore.getState().setColorScheme('light');
    useSettingsStore.getState().setColorScheme('system');
    expect(useSettingsStore.getState().colorScheme).toBe('system');
  });
});
