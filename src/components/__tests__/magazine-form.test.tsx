import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import { MagazineForm } from '@/components/magazine-form';
import { setPendingBarcode } from '@/lib/pending-barcode';

const mockPush = jest.fn();

jest.mock('expo-router', () => ({
  useFocusEffect: (callback: () => void) => callback(),
  useRouter: () => ({ push: mockPush, back: jest.fn() }),
}));

describe('MagazineForm', () => {
  it('desactive le bouton tant que la publication est vide', () => {
    const onSubmit = jest.fn();
    render(<MagazineForm submitLabel="Enregistrer" onSubmit={onSubmit} />);

    const submit = screen.getByTestId('form-submit');
    fireEvent.press(submit);

    expect(submit.props.accessibilityState?.disabled).toBe(true);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('envoie les valeurs saisies a la soumission', async () => {
    const onSubmit = jest.fn();
    render(<MagazineForm submitLabel="Enregistrer" onSubmit={onSubmit} />);

    fireEvent.changeText(screen.getByTestId('field-publication'), 'Picsou Magazine');
    fireEvent.changeText(screen.getByTestId('field-issue-number'), '547');
    fireEvent.changeText(screen.getByTestId('field-edition'), 'édition française');
    fireEvent.changeText(screen.getByTestId('field-country'), 'FR');
    fireEvent.changeText(screen.getByTestId('field-publication-date'), '2023-03');
    fireEvent.changeText(screen.getByTestId('field-barcode'), '3271234000011');

    fireEvent.press(screen.getByTestId('form-submit'));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit).toHaveBeenCalledWith({
      publication: 'Picsou Magazine',
      issueNumber: 547,
      edition: 'édition française',
      country: 'FR',
      publicationDate: '2023-03',
      barcode: '3271234000011',
    });
  });

  it('convertit les champs vides en null', async () => {
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
    });
  });

  it('ouvre le scanner de code-barres depuis le champ barcode', () => {
    const onSubmit = jest.fn();
    render(<MagazineForm submitLabel="Enregistrer" onSubmit={onSubmit} />);

    fireEvent.press(screen.getByTestId('barcode-scan'));
    expect(mockPush).toHaveBeenCalledWith('/scan/form-barcode');
  });

  it('remplit le champ barcode avec le code scanné au retour du scanner', () => {
    const onSubmit = jest.fn();
    setPendingBarcode('3271234000011');

    render(<MagazineForm submitLabel="Enregistrer" onSubmit={onSubmit} />);

    expect(screen.getByTestId('field-barcode').props.value).toBe('3271234000011');
  });

  it('préremplit le code-barres via la prop initialBarcode', () => {
    const onSubmit = jest.fn();

    render(
      <MagazineForm submitLabel="Enregistrer" onSubmit={onSubmit} initialBarcode="5901234123457" />,
    );

    expect(screen.getByTestId('field-barcode').props.value).toBe('5901234123457');
  });
});
