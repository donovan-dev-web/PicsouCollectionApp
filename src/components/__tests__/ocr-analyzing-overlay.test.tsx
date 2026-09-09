import { fireEvent, render, screen } from '@testing-library/react-native';

import { OcrAnalyzingOverlay } from '@/components/scan/ocr-analyzing-overlay';
import { makeCameraOcrStyles } from '@/components/scan/camera-ocr-styles';
import type { DetectedInfo } from '@/components/scan/ocr-analysis';
import { Colors } from '@/constants/theme';

const styles = makeCameraOcrStyles(Colors.light, { top: 0, bottom: 0 });

function renderOverlay(
  overrides: Partial<{ detected: DetectedInfo; weakCycles: number; capturing: boolean }> = {},
) {
  const callbacks = {
    onOpenConfirm: jest.fn(),
    onGoBarcode: jest.fn(),
    onGoManual: jest.fn(),
    onBack: jest.fn(),
    onToggleTorch: jest.fn(),
  };
  render(
    <OcrAnalyzingOverlay
      styles={styles}
      detected={overrides.detected ?? { publication: null, issueNumber: null, date: null }}
      hint="Centre le magazine"
      weakCycles={overrides.weakCycles ?? 0}
      capturing={overrides.capturing ?? false}
      torchOn={false}
      onOpenConfirm={callbacks.onOpenConfirm}
      onGoBarcode={callbacks.onGoBarcode}
      onGoManual={callbacks.onGoManual}
      onBack={callbacks.onBack}
      onToggleTorch={callbacks.onToggleTorch}
    />,
  );
  return callbacks;
}

describe('OcrAnalyzingOverlay', () => {
  it('affiche le texte-guide et la lecture en cours pendant la capture', () => {
    renderOverlay({ capturing: true });

    expect(screen.getByTestId('ocr-hint')).toHaveTextContent('Centre le magazine');
    expect(screen.getByText('Lecture…')).toBeTruthy();
  });

  it('n’affiche pas la pastille de lecture hors capture', () => {
    renderOverlay();

    expect(screen.queryByText('Lecture…')).toBeNull();
  });

  it('affiche des champs détectés avec leurs valeurs', () => {
    renderOverlay({
      detected: { publication: 'Picsou Magazine', issueNumber: 547, date: '2024-06' },
    });

    expect(screen.getByTestId('ocr-field-publication')).toHaveTextContent('Picsou Magazine');
    expect(screen.getByTestId('ocr-field-issue')).toHaveTextContent('547');
    expect(screen.getByTestId('ocr-field-date')).toHaveTextContent('2024-06');
  });

  it('affiche des points de suspension tant qu’un champ est vide', () => {
    renderOverlay();

    expect(screen.getByTestId('ocr-field-publication')).toHaveTextContent('…');
    expect(screen.getByTestId('ocr-field-issue')).toHaveTextContent('…');
    expect(screen.getByTestId('ocr-field-date')).toHaveTextContent('…');
  });

  it('masque la validation tant qu’aucune information n’est détectée', () => {
    renderOverlay();

    expect(screen.queryByTestId('ocr-confirm-detected')).toBeNull();
  });

  it('valide les informations détectées', () => {
    const callbacks = renderOverlay({
      detected: { publication: 'Picsou Magazine', issueNumber: null, date: null },
    });

    fireEvent.press(screen.getByTestId('ocr-confirm-detected'));
    expect(callbacks.onOpenConfirm).toHaveBeenCalled();
  });

  it('propose code-barres, retour et torche', () => {
    const callbacks = renderOverlay();

    fireEvent.press(screen.getByTestId('ocr-barcode'));
    expect(callbacks.onGoBarcode).toHaveBeenCalled();

    fireEvent.press(screen.getByTestId('ocr-back'));
    expect(callbacks.onBack).toHaveBeenCalled();

    fireEvent.press(screen.getByTestId('ocr-torch'));
    expect(callbacks.onToggleTorch).toHaveBeenCalled();
    expect(screen.getByLabelText('Activer la torche')).toBeTruthy();
  });

  it('expose le libellé de torche allumée', () => {
    render(
      <OcrAnalyzingOverlay
        styles={styles}
        detected={{ publication: null, issueNumber: null, date: null }}
        hint=""
        weakCycles={0}
        capturing={false}
        torchOn
        onOpenConfirm={jest.fn()}
        onGoBarcode={jest.fn()}
        onGoManual={jest.fn()}
        onBack={jest.fn()}
        onToggleTorch={jest.fn()}
      />,
    );

    expect(screen.getByLabelText('Désactiver la torche')).toBeTruthy();
  });

  it('affiche le guide seulement après plusieurs cycles sans numéro', () => {
    const callbacks = renderOverlay({
      detected: { publication: 'Picsou Magazine', issueNumber: null, date: null },
      weakCycles: 4,
    });

    expect(screen.getByTestId('ocr-guidance-card')).toBeTruthy();

    fireEvent.press(screen.getByTestId('ocr-guidance-barcode'));
    expect(callbacks.onGoBarcode).toHaveBeenCalled();

    fireEvent.press(screen.getByTestId('ocr-guidance-manual'));
    expect(callbacks.onGoManual).toHaveBeenCalledWith({
      publication: 'Picsou Magazine',
      issueNumber: null,
      date: null,
    });
  });

  it('n’affiche pas le guide si le numéro est détecté', () => {
    renderOverlay({
      detected: { publication: 'Picsou Magazine', issueNumber: 547, date: null },
      weakCycles: 4,
    });

    expect(screen.queryByTestId('ocr-guidance-card')).toBeNull();
  });

  it('n’affiche pas le guide si la lecture est trop jeune', () => {
    renderOverlay({
      detected: { publication: 'Picsou Magazine', issueNumber: null, date: null },
      weakCycles: 2,
    });

    expect(screen.queryByTestId('ocr-guidance-card')).toBeNull();
  });
});
