import { fireEvent, render, screen } from '@testing-library/react-native';

import SettingsScreen from '@/app/(tabs)/settings/index';
import { setDepsForTest, __resetForTests, type Dependencies } from '@/dependencies';
import { useSettingsStore } from '@/store/use-settings-store';

const setColorSchemeMock = jest.fn().mockResolvedValue(undefined);

function stubDeps(): Dependencies {
  return {
    magazineRepository: {} as Dependencies['magazineRepository'],
    collectionRepository: {} as Dependencies['collectionRepository'],
    identificationService: {} as Dependencies['identificationService'],
    settingsRepository: {
      getColorScheme: jest.fn().mockResolvedValue('system'),
      setColorScheme: setColorSchemeMock,
    } as unknown as Dependencies['settingsRepository'],
  };
}

describe('SettingsScreen', () => {
  beforeEach(() => {
    setColorSchemeMock.mockClear();
    setColorSchemeMock.mockResolvedValue(undefined);
    useSettingsStore.setState({ colorScheme: 'system', loaded: false });
    setDepsForTest(stubDeps());
  });

  afterEach(() => {
    __resetForTests();
  });

  it('affiche les options de theme', () => {
    render(<SettingsScreen />);

    expect(screen.getByText('Apparence')).toBeTruthy();
    expect(screen.getByTestId('theme-option-system')).toBeTruthy();
    expect(screen.getByTestId('theme-option-light')).toBeTruthy();
    expect(screen.getByTestId('theme-option-dark')).toBeTruthy();
  });

  it('selectionne le theme sombre au tap', () => {
    render(<SettingsScreen />);

    fireEvent.press(screen.getByTestId('theme-option-dark'));

    expect(useSettingsStore.getState().colorScheme).toBe('dark');
    expect(setColorSchemeMock).toHaveBeenCalledWith('dark');
  });

  it('marque l option courante comme selectionnee', () => {
    useSettingsStore.setState({ colorScheme: 'light' });
    render(<SettingsScreen />);

    expect(screen.getByTestId('theme-option-light').props.accessibilityState?.checked).toBe(true);
    expect(screen.getByTestId('theme-option-system').props.accessibilityState?.checked).toBe(false);
  });
});
