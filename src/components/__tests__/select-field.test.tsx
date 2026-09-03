import { fireEvent, render, screen } from '@testing-library/react-native';

import { SelectField } from '@/components/select-field';

const MONTHS = ['01', '02', '03'];

describe('SelectField', () => {
  it('affiche le placeholder tant qu aucune valeur n est choisie', () => {
    render(
      <SelectField
        label="Mois"
        placeholder="—"
        value={null}
        options={MONTHS}
        onSelect={() => undefined}
        testID="select-month"
      />,
    );

    expect(screen.getByText('—')).toBeTruthy();
  });

  it('ouvre la liste puis selectionne une valeur', () => {
    const onSelect = jest.fn();
    render(
      <SelectField
        label="Mois"
        placeholder="—"
        value={null}
        options={MONTHS}
        onSelect={onSelect}
        testID="select-month"
      />,
    );

    // les options sont masquees tant que la liste est fermee
    expect(screen.queryByTestId('select-month-option-02')).toBeNull();

    fireEvent.press(screen.getByTestId('select-month'));
    fireEvent.press(screen.getByTestId('select-month-option-02'));

    expect(onSelect).toHaveBeenCalledWith('02');
    // la liste se referme apres selection
    expect(screen.queryByTestId('select-month-option-02')).toBeNull();
  });

  it('affiche la valeur courante', () => {
    render(
      <SelectField
        label="Mois"
        placeholder="—"
        value="03"
        options={MONTHS}
        onSelect={() => undefined}
        testID="select-month"
      />,
    );

    expect(screen.getByText('03')).toBeTruthy();
  });

  it('peut refermer la liste sans selection', () => {
    render(
      <SelectField
        label="Mois"
        placeholder="—"
        value={null}
        options={MONTHS}
        onSelect={() => undefined}
        testID="select-month"
      />,
    );

    fireEvent.press(screen.getByTestId('select-month'));
    expect(screen.getByTestId('select-month-option-01')).toBeTruthy();

    fireEvent.press(screen.getByTestId('select-month'));
    expect(screen.queryByTestId('select-month-option-01')).toBeNull();
  });
});
