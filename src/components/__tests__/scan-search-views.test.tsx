import { render, screen, userEvent } from '@testing-library/react-native';

import { SearchFoundResult, SearchUnknownResult } from '@/components/scan-search-views';

describe('SearchFoundResult', () => {
  const onView = jest.fn();
  const onRescan = jest.fn();

  beforeEach(() => {
    onView.mockClear();
    onRescan.mockClear();
  });

  it('affiche le numéro quand il est renseigné et le statut possédé', () => {
    render(
      <SearchFoundResult
        publication="Picsou Magazine"
        issueNumber={547}
        onView={onView}
        onRescan={onRescan}
      />,
    );

    expect(screen.getByTestId('search-magazine')).toHaveTextContent('Picsou Magazine');
    expect(screen.getByText('N° 547')).toBeTruthy();
    expect(screen.getByTestId('search-status-owned')).toHaveTextContent('✓ Possédé');
  });

  it('s’affiche sans numéro quand celui-ci est absent', () => {
    render(
      <SearchFoundResult
        publication="Picsou Magazine"
        issueNumber={null}
        onView={onView}
        onRescan={onRescan}
      />,
    );

    expect(screen.queryByText('N° 547')).toBeNull();
  });

  it('sait relancer un scan ou ouvrir la fiche', async () => {
    const user = userEvent.setup();
    render(
      <SearchFoundResult
        publication="Picsou Magazine"
        issueNumber={547}
        onView={onView}
        onRescan={onRescan}
      />,
    );

    await user.press(screen.getByTestId('search-view'));
    expect(onView).toHaveBeenCalled();
    await user.press(screen.getByTestId('search-rescan'));
    expect(onRescan).toHaveBeenCalled();
  });
});

describe('SearchUnknownResult', () => {
  const onManual = jest.fn();
  const onAgain = jest.fn();

  it('affiche le numéro et l’édition recherchés, avec ou sans édition', async () => {
    const user = userEvent.setup();
    render(
      <SearchUnknownResult
        issueNumber={547}
        edition="géant"
        onManual={onManual}
        onAgain={onAgain}
      />,
    );
    expect(screen.getByText(/Édition « géant »/)).toBeTruthy();
    expect(screen.getByText('N° 547')).toBeTruthy();

    await user.press(screen.getByTestId('search-manual'));
    expect(onManual).toHaveBeenCalled();
    await user.press(screen.getByTestId('search-again'));
    expect(onAgain).toHaveBeenCalled();
  });

  it('s’affiche sans édition ni numéro', () => {
    render(<SearchUnknownResult issueNumber={547} onManual={onManual} onAgain={onAgain} />);
    expect(screen.queryByText(/\u00C9dition/)).toBeNull();
    expect(screen.getByText('N° 547')).toBeTruthy();
  });
});
