import { fireEvent, render, screen } from '@testing-library/react-native';

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
    onConfirmAdd: jest.fn(),
    onManual: jest.fn(),
  };
  render(
    <BarcodePendingSheets
      styles={styles}
      pending={pending}
      onResume={callbacks.onResume}
      onConfirmAdd={callbacks.onConfirmAdd}
      onManual={callbacks.onManual}
    />,
  );
  return callbacks;
}

describe('BarcodePendingSheets', () => {
  it('affiche la confirmation de doublon avec le numéro et le nombre d’exemplaires', () => {
    const callbacks = renderPending({
      kind: 'confirm',
      magazine,
      ownedCount: 3,
    });

    expect(screen.getByText('Vous possédez déjà ce magazine')).toBeTruthy();
    expect(screen.getByText('Picsou Magazine n° 547')).toBeTruthy();
    expect(screen.getByText(/Exemplaires actuels : 3/)).toBeTruthy();

    fireEvent.press(screen.getByTestId('pending-confirm-add'));
    expect(callbacks.onConfirmAdd).toHaveBeenCalled();

    fireEvent.press(screen.getByTestId('pending-confirm-cancel'));
    expect(callbacks.onResume).toHaveBeenCalled();
  });

  it('affiche le magazine sans numéro quand il est absent', () => {
    renderPending({ kind: 'confirm', magazine: { ...magazine, issueNumber: null }, ownedCount: 1 });

    expect(screen.getByText('Picsou Magazine')).toBeTruthy();
  });

  it('affiche l’écran de succès puis reprend le scan', () => {
    const callbacks = renderPending({
      kind: 'success',
      publication: 'Picsou Magazine',
      issueNumber: 547,
    });

    expect(screen.getByText('Ajouté à la collection')).toBeTruthy();
    expect(screen.getByText('Picsou Magazine n° 547')).toBeTruthy();

    fireEvent.press(screen.getByTestId('pending-success-ok'));
    expect(callbacks.onResume).toHaveBeenCalled();
  });

  it('affiche l’écran de succès sans numéro si l’édition n’en a pas', () => {
    renderPending({ kind: 'success', publication: 'Picsou Magazine', issueNumber: null });

    expect(screen.getByText('Picsou Magazine')).toBeTruthy();
  });

  it('suggère la saisie manuelle pour un code-barres inconnu', () => {
    const callbacks = renderPending({ kind: 'unknown', barcode: '9791234567890' });

    expect(screen.getByText('Code-barres inconnu')).toBeTruthy();
    expect(screen.getByText('9791234567890')).toBeTruthy();

    fireEvent.press(screen.getByTestId('pending-unknown-manual'));
    expect(callbacks.onManual).toHaveBeenCalledWith('9791234567890');

    fireEvent.press(screen.getByTestId('pending-unknown-continue'));
    expect(callbacks.onResume).toHaveBeenCalled();
  });

  it('ne rend rien pour un état inconnu', () => {
    renderPending('idle' as unknown as Pending);

    expect(screen.queryByTestId('pending-confirm')).toBeNull();
    expect(screen.queryByTestId('pending-success')).toBeNull();
    expect(screen.queryByTestId('pending-unknown')).toBeNull();
  });
});

describe('BarcodeContinuousBar', () => {
  it('affiche le bandeau continu et permet de l’arrêter', () => {
    const onStop = jest.fn();
    render(<BarcodeContinuousBar styles={styles} onStop={onStop} />);

    expect(screen.getByText(/Scan en continu/)).toBeTruthy();

    fireEvent.press(screen.getByTestId('continuous-stop'));
    expect(onStop).toHaveBeenCalled();
  });
});
