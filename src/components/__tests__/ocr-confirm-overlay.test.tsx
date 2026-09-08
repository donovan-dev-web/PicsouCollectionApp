import { fireEvent, render, screen } from '@testing-library/react-native';

import { OcrConfirmOverlay } from '@/components/scan/ocr-confirm-overlay';
import { makeCameraOcrStyles } from '@/components/scan/camera-ocr-styles';
import { Colors } from '@/constants/theme';

const styles = makeCameraOcrStyles(Colors.light, { top: 0, bottom: 0 });
const draft = { publication: 'Picsou Magazine', issueNumber: 547, date: '2024-06' };

function renderOverlay(onDraftChange = jest.fn()) {
  const callbacks = {
    onDraftChange,
    onSearch: jest.fn(),
    onGoManual: jest.fn(),
    onBack: jest.fn(),
  };
  render(
    <OcrConfirmOverlay
      styles={styles}
      draft={draft}
      onDraftChange={callbacks.onDraftChange}
      onSearch={callbacks.onSearch}
      onGoManual={callbacks.onGoManual}
      onBack={callbacks.onBack}
    />,
  );
  return callbacks;
}

describe('OcrConfirmOverlay', () => {
  it('pré-remplit les champs avec le brouillon détecté', () => {
    renderOverlay();

    expect(screen.getByTestId('ocr-override-publication').props.value).toBe('Picsou Magazine');
    expect(screen.getByTestId('ocr-override-issue').props.value).toBe('547');
    expect(screen.getByTestId('ocr-override-date').props.value).toBe('2024-06');
  });

  it('permet de corriger la publication et la date', () => {
    const onDraftChange = jest.fn();
    renderOverlay(onDraftChange);

    fireEvent.changeText(screen.getByTestId('ocr-override-publication'), 'Donald Hebdo');
    expect(onDraftChange).toHaveBeenLastCalledWith({ ...draft, publication: 'Donald Hebdo' });

    fireEvent.changeText(screen.getByTestId('ocr-override-date'), '1999-03');
    expect(onDraftChange).toHaveBeenLastCalledWith({ ...draft, date: '1999-03' });
  });

  it('ne retient que les chiffres du numéro, sinon le remet à null', () => {
    const onDraftChange = jest.fn();
    renderOverlay(onDraftChange);

    fireEvent.changeText(screen.getByTestId('ocr-override-issue'), '1a2b3');
    expect(onDraftChange).toHaveBeenLastCalledWith({ ...draft, issueNumber: 123 });

    fireEvent.changeText(screen.getByTestId('ocr-override-issue'), 'abc');
    expect(onDraftChange).toHaveBeenLastCalledWith({ ...draft, issueNumber: null });
  });

  it('affiche un numéro vide quand il est absent', () => {
    render(
      <OcrConfirmOverlay
        styles={styles}
        draft={{ publication: null, issueNumber: null, date: null }}
        onDraftChange={jest.fn()}
        onSearch={jest.fn()}
        onGoManual={jest.fn()}
        onBack={jest.fn()}
      />,
    );

    expect(screen.getByTestId('ocr-override-publication').props.value).toBe('');
    expect(screen.getByTestId('ocr-override-issue').props.value).toBe('');
    expect(screen.getByTestId('ocr-override-date').props.value).toBe('');
  });

  it('lance la recherche, la saisie manuelle ou le retour caméra', () => {
    const callbacks = renderOverlay();

    fireEvent.press(screen.getByTestId('ocr-override-search'));
    expect(callbacks.onSearch).toHaveBeenCalled();

    fireEvent.press(screen.getByTestId('ocr-override-manual'));
    expect(callbacks.onGoManual).toHaveBeenCalled();

    fireEvent.press(screen.getByTestId('ocr-override-back'));
    expect(callbacks.onBack).toHaveBeenCalled();
  });
});
