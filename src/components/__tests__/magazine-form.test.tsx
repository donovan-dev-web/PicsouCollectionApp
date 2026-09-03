import { fireEvent, render, screen, userEvent, waitFor } from '@testing-library/react-native';

import { MagazineForm } from '@/components/magazine-form';
import { setPendingBarcode } from '@/lib/pending-barcode';

const mockPush = jest.fn();

jest.mock('expo-router', () => ({
  useFocusEffect: (callback: () => void) => callback(),
  useRouter: () => ({ push: mockPush, back: jest.fn() }),
}));

async function openSelectOption(selectTestID: string, optionTestID: string) {
  fireEvent.press(screen.getByTestId(selectTestID));
  fireEvent.press(screen.getByTestId(optionTestID));
}

describe('MagazineForm', () => {
  it('desactive le bouton tant que la publication est vide', () => {
    const onSubmit = jest.fn();
    render(<MagazineForm submitLabel="Enregistrer" onSubmit={onSubmit} />);

    const submit = screen.getByTestId('form-submit');
    fireEvent.press(submit);

    expect(submit.props.accessibilityState?.disabled).toBe(true);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('masque la section détails par défaut et l affiche via le bouton', async () => {
    const user = userEvent.setup();
    const onSubmit = jest.fn();
    render(<MagazineForm submitLabel="Enregistrer" onSubmit={onSubmit} />);

    // les champs optionnels sont masqués tant que la section n est pas ouverte
    expect(screen.queryByTestId('field-notes')).toBeNull();
    expect(screen.queryByTestId('select-month')).toBeNull();

    await user.press(screen.getByTestId('details-toggle'));

    expect(screen.getByTestId('field-notes')).toBeTruthy();
    expect(screen.getByTestId('select-month')).toBeTruthy();
  });

  it('envoie les valeurs saisies a la soumission (avec date et notes)', async () => {
    const onSubmit = jest.fn();
    render(<MagazineForm submitLabel="Enregistrer" onSubmit={onSubmit} />);

    fireEvent.changeText(screen.getByTestId('field-publication'), 'Picsou Magazine');
    fireEvent.changeText(screen.getByTestId('field-issue-number'), '547');
    fireEvent.changeText(screen.getByTestId('field-edition'), 'édition française');

    // ouvre la section détails et remplit les champs optionnels
    fireEvent.press(screen.getByTestId('details-toggle'));
    fireEvent.changeText(screen.getByTestId('field-country'), 'FR');
    fireEvent.changeText(screen.getByTestId('field-notes'), 'Couverture abîmée');
    await openSelectOption('select-month', 'select-month-option-03');
    await openSelectOption('select-year', 'select-year-option-2023');

    fireEvent.press(screen.getByTestId('form-submit'));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit).toHaveBeenCalledWith({
      publication: 'Picsou Magazine',
      issueNumber: 547,
      edition: 'édition française',
      country: 'FR',
      publicationDate: '2023-03',
      barcode: null,
      notes: 'Couverture abîmée',
    });
  });

  it('convertit les champs vides ou sans date en null', async () => {
    const onSubmit = jest.fn();
    render(<MagazineForm submitLabel="Enregistrer" onSubmit={onSubmit} />);

    fireEvent.changeText(screen.getByTestId('field-publication'), 'Mickey Parade');

    fireEvent.press(screen.getByTestId('form-submit'));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit).toHaveBeenCalledWith({
      publication: 'Mickey Parade',
      issueNumber: null,
      edition: null,
      country: null,
      publicationDate: null,
      barcode: null,
      notes: null,
    });
  });

  it('préremplit la date initiale issue de la fiche', () => {
    const onSubmit = jest.fn();
    render(
      <MagazineForm
        submitLabel="Enregistrer"
        onSubmit={onSubmit}
        initial={
          {
            publication: 'Picsou Magazine',
            issueNumber: 547,
            edition: 'standard',
            country: 'FR',
            publicationDate: '2023-03',
            barcode: null,
            notes: 'nc',
            id: 'm1',
            createdAt: '',
            updatedAt: '',
            ocrText: null,
          } as never
        }
      />,
    );

    expect(screen.getByTestId('field-publication').props.value).toBe('Picsou Magazine');
  });

  it('ouvre le scanner de code-barres depuis le champ barcode', async () => {
    const onSubmit = jest.fn();
    render(<MagazineForm submitLabel="Enregistrer" onSubmit={onSubmit} />);

    fireEvent.press(screen.getByTestId('details-toggle'));
    fireEvent.press(screen.getByTestId('barcode-scan'));
    expect(mockPush).toHaveBeenCalledWith('/scan/form-barcode');
  });

  it('remplit le champ barcode avec le code scanné au retour du scanner', () => {
    const onSubmit = jest.fn();
    setPendingBarcode('3271234000011');

    render(<MagazineForm submitLabel="Enregistrer" onSubmit={onSubmit} />);
    fireEvent.press(screen.getByTestId('details-toggle'));

    expect(screen.getByTestId('field-barcode').props.value).toBe('3271234000011');
  });

  it('préremplit le code-barres via la prop initialBarcode', () => {
    const onSubmit = jest.fn();

    render(
      <MagazineForm submitLabel="Enregistrer" onSubmit={onSubmit} initialBarcode="5901234123457" />,
    );
    fireEvent.press(screen.getByTestId('details-toggle'));

    expect(screen.getByTestId('field-barcode').props.value).toBe('5901234123457');
  });
});
