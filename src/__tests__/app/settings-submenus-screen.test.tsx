import { fireEvent, render, screen } from '@testing-library/react-native';
import { Linking } from 'react-native';

import SettingsScreen from '@/app/(tabs)/settings/index';
import AccessibilityScreen from '@/app/(tabs)/settings/accessibility';
import HelpScreen from '@/app/(tabs)/settings/help';
import { setDepsForTest, __resetForTests, type Dependencies } from '@/dependencies';
import { useSettingsStore } from '@/store/use-settings-store';

const mockPush = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: mockPush,
    back: jest.fn(),
    replace: jest.fn(),
    canGoBack: () => true,
  }),
}));

function stubDeps(): Dependencies {
  return {
    magazineRepository: {} as Dependencies['magazineRepository'],
    collectionRepository: {} as Dependencies['collectionRepository'],
    identificationService: {} as Dependencies['identificationService'],
    ocrEngine: { recognize: jest.fn() } as unknown as Dependencies['ocrEngine'],
    settingsRepository: {
      getColorScheme: jest.fn().mockResolvedValue('system'),
      setColorScheme: jest.fn().mockResolvedValue(undefined),
      getOnboardingDone: jest.fn().mockResolvedValue(false),
      setOnboardingDone: jest.fn().mockResolvedValue(undefined),
      getReducedMotion: jest.fn().mockResolvedValue(false),
      setReducedMotion: jest.fn().mockResolvedValue(undefined),
    } as unknown as Dependencies['settingsRepository'],
    backupService: {} as Dependencies['backupService'],
    fileGateway: {} as Dependencies['fileGateway'],
  };
}

describe('SettingsScreen (sous-menus M10R2-06)', () => {
  beforeEach(() => {
    mockPush.mockClear();
    setDepsForTest(stubDeps());
    useSettingsStore.setState({
      colorScheme: 'system',
      reducedMotion: false,
    });
  });

  afterEach(() => {
    __resetForTests();
  });

  it('affiche les entrées de sous-menus', () => {
    render(<SettingsScreen />);
    expect(screen.getByTestId('settings-appearance')).toBeTruthy();
    expect(screen.getByTestId('settings-backup')).toBeTruthy();
    expect(screen.getByTestId('settings-accessibility')).toBeTruthy();
    expect(screen.getByTestId('settings-help')).toBeTruthy();
  });

  it('navigue vers Apparence', () => {
    render(<SettingsScreen />);
    fireEvent.press(screen.getByTestId('settings-appearance'));
    expect(mockPush).toHaveBeenCalledWith('/settings/appearance');
  });

  it('navigue vers Sauvegarde', () => {
    render(<SettingsScreen />);
    fireEvent.press(screen.getByTestId('settings-backup'));
    expect(mockPush).toHaveBeenCalledWith('/settings/backup');
  });
});

describe('AccessibilityScreen', () => {
  beforeEach(() => {
    setDepsForTest(stubDeps());
    useSettingsStore.setState({ reducedMotion: false });
  });

  afterEach(() => {
    __resetForTests();
  });

  it('bascule « Réduire les animations » et persiste', () => {
    render(<AccessibilityScreen />);

    const toggle = screen.getByTestId('accessibility-reduced-motion');
    expect(toggle.props.accessibilityState?.checked).toBe(false);

    fireEvent.press(toggle);

    expect(useSettingsStore.getState().reducedMotion).toBe(true);
    expect(screen.getByTestId('accessibility-reduced-motion').props.accessibilityState?.checked).toBe(
      true,
    );
  });
});

describe('HelpScreen (retours GitHub)', () => {
  beforeEach(() => {
    setDepsForTest(stubDeps());
  });

  afterEach(() => {
    jest.restoreAllMocks();
    __resetForTests();
  });

  it('ouvre les Discussions GitHub depuis chaque entrée', () => {
    const spy = jest.spyOn(Linking, 'openURL').mockResolvedValue(undefined);
    render(<HelpScreen />);

    fireEvent.press(screen.getByTestId('help-bug'));
    fireEvent.press(screen.getByTestId('help-idea'));
    fireEvent.press(screen.getByTestId('help-suggestion'));
    fireEvent.press(screen.getByTestId('help-discussions'));

    expect(spy).toHaveBeenCalledTimes(4);
    expect(spy).toHaveBeenCalledWith(
      'https://github.com/donovan-dev-web/PicsouCollectionApp/discussions',
    );
  });
});