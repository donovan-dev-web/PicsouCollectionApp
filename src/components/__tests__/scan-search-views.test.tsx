import { fireEvent, render, screen } from '@testing-library/react-native';

import { SearchFoundResult, SearchUnknownResult } from '@/components/scan-search-views';

describe('SearchFoundResult', () => {
  const onAddCopy = jest.fn();
  const onView = jest.fn();
  const onRescan = jest.fn();

  beforeEach(() => {
    onAddCopy.mockClear();
    onView.mockClear();
    onRescan.mockClear();
  });

  it('affiche le numéro quand il est renseigné et le statut possédé', () => {
    render(
      <SearchFoundResult
        publication="Picsou Magazine"
        issueNumber={547}
        owned
        ownedCount={2}
        resolved
        onAddCopy={onAddCopy}
        onView={onView}
        onRescan={onRescan}
      />,
    );

    expect(screen.getByText('N° 547')).toBeTruthy();
    expect(screen.getByTestId('search-status-owned')).toHaveTextContent('✓ Possédé (2)');
    fireEvent.press(screen.getByTestId('search-add'));
    expect(onAddCopy).toHaveBeenCalled();
  });

  it('affiche « absent » quand l’édition n’est pas possédée', () => {
    render(
      <SearchFoundResult
        publication="Picsou Magazine"
        issueNumber={null}
        owned={false}
        ownedCount={0}
        resolved
        onAddCopy={onAddCopy}
        onView={onView}
        onRescan={onRescan}
      />,
    );

    expect(screen.queryByText('N° 547')).toBeNull();
    expect(screen.getByTestId('search-status-absent')).toHaveTextContent('○ Absent');
  });

  it('affiche la vérification en cours tant que l’édition n’est pas résolue', () => {
    render(
      <SearchFoundResult
        publication="Picsou Magazine"
        issueNumber={547}
        owned={false}
        ownedCount={0}
        resolved={false}
        onAddCopy={onAddCopy}
        onView={onView}
        onRescan={onRescan}
      />,
    );

    expect(screen.getByTestId('search-loading')).toHaveTextContent('Vérification…');
  });

  it('sait relancer un scan ou ouvrir la fiche', () => {
    render(
      <SearchFoundResult
        publication="Picsou Magazine"
        issueNumber={547}
        owned={false}
        ownedCount={0}
        resolved
        onAddCopy={onAddCopy}
        onView={onView}
        onRescan={onRescan}
      />,
    );

    fireEvent.press(screen.getByTestId('search-view'));
    expect(onView).toHaveBeenCalled();
    fireEvent.press(screen.getByTestId('search-rescan'));
    expect(onRescan).toHaveBeenCalled();
  });
});

describe('SearchUnknownResult', () => {
  const onManual = jest.fn();
  const onAgain = jest.fn();

  it('affiche la publication, avec ou sans numéro', () => {
    render(
      <SearchUnknownResult
        publication="Picsou Magazine"
        issueNumber={547}
        onManual={onManual}
        onAgain={onAgain}
      />,
    );
    expect(screen.getByText(/Picsou Magazine/)).toBeTruthy();
    expect(screen.getByText('N° 547')).toBeTruthy();

    fireEvent.press(screen.getByTestId('search-manual'));
    expect(onManual).toHaveBeenCalled();
    fireEvent.press(screen.getByTestId('search-again'));
    expect(onAgain).toHaveBeenCalled();
  });

  it('s’affiche sans numéro quand celui-ci est absent', () => {
    render(
      <SearchUnknownResult
        publication="Picsou Magazine"
        issueNumber={null}
        onManual={onManual}
        onAgain={onAgain}
      />,
    );
    expect(screen.queryByText('N° 547')).toBeNull();
  });
});
