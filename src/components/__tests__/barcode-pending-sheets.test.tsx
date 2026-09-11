import { render, screen, userEvent } from '@testing-library/react-native';

import {
  BarcodeContinuousBar,
  BarcodePendingSheets,
} from '@/components/scan/barcode-pending-sheets';
import { makeBarcodeStyles } from '@/components/scan/barcode-styles';
import type { Pending } from '@/components/scan/use-barcode-scanning';
import { Colors } from '@/constants/theme';
import type { Magazine } from '@/types';

const styles = makeBarcodeStyles(Colors.light, { top: 0, bottom: 0 });

const magazine: Magazine = {
  id: 'mag-1',
  publication: 'Picsou Magazine',
  issueNumber: 547,
  edition: null,
  language: null,
  condition: null,
  publicationDate: null,
  barcode: null,
  notes: null,
  ocrText: null,
  createdAt: '2026-09-01T10:00:00.000Z',
  updatedAt: '2026-09-01T10:00:00.000Z',
};

function renderPending(pending: Pending) {
  const callbacks = {
    onResume: jest.fn(),
    onManual: jest.fn(),
  };
  render(
    <BarcodePendingSheets
      styles={styles}
      pending={pending}
      onResume={callbacks.onResume}
      onManual={callbacks.onManual}
    />,
  );
  return callbacks;
}

describe('BarcodePendingSheets', () => {
  it('affiche le panier « Déjà dans votre collection » avec le numéro', async () => {
    const user = userEvent.setup();
    const callbacks = renderPending({ kind: 'owned', magazine });

    expect(screen.getByText('Déjà dans votre collection')).toBeTruthy();
    expect(screen.getByText('Picsou Magazine n° 547')).toBeTruthy();
    expect(screen.getByText('Cette édition est bien possédée.')).toBeTruthy();

    await user.press(screen.getByTestId('pending-owned-ok'));
    expect(callbacks.onResume).toHaveBeenCalled();

    await user.press(screen.getByTestId('pending-close'));
    expect(callbacks.onResume).toHaveBeenCalled();
  });

  it('affiche le magazine sans numéro quand il est absent', () => {
    renderPending({ kind: 'owned', magazine: { ...magazine, issueNumber: null } });

    expect(screen.getByText('Picsou Magazine')).toBeTruthy();
  });

  it('suggère la saisie manuelle pour un code-barres inconnu', async () => {
    const user = userEvent.setup();
    const callbacks = renderPending({ kind: 'unknown', barcode: '9791234567890' });

    expect(screen.getByText('Code-barres inconnu')).toBeTruthy();
    expect(screen.getByText('9791234567890')).toBeTruthy();

    await user.press(screen.getByTestId('pending-unknown-manual'));
    expect(callbacks.onManual).toHaveBeenCalledWith('9791234567890');

    await user.press(screen.getByTestId('pending-unknown-continue'));
    expect(callbacks.onResume).toHaveBeenCalled();
  });

  it('ne rend rien pour un état inconnu', () => {
    renderPending('idle' as unknown as Pending);

    expect(screen.queryByTestId('pending-owned')).toBeNull();
    expect(screen.queryByTestId('pending-unknown')).toBeNull();
  });
});

describe('BarcodeContinuousBar', () => {
  it('affiche le bandeau continu et permet de l’arrêter', async () => {
    const user = userEvent.setup();
    const onStop = jest.fn();
    render(<BarcodeContinuousBar styles={styles} onStop={onStop} />);

    expect(screen.getByText(/Scan en continu — vérifie chaque code-barres/)).toBeTruthy();

    await user.press(screen.getByTestId('continuous-stop'));
    expect(onStop).toHaveBeenCalled();
  });
});
