import { fireEvent, render, screen, userEvent } from '@testing-library/react-native';

import { AutocompleteInput } from '@/components/autocomplete-input';

const OPTIONS = ['Picsou Magazine', 'Mickey Parade', 'Super Picsou Géant'];

describe('AutocompleteInput', () => {
  it('affiche les suggestions qui contiennent la saisie (sans la casse)', () => {
    render(
      <AutocompleteInput
        label="Publication"
        value="picsou"
        options={OPTIONS}
        onChangeText={() => undefined}
        testID="field-publication"
      />,
    );

    expect(screen.getByTestId('field-publication-suggestion-Picsou Magazine')).toBeTruthy();
    expect(screen.queryByTestId('field-publication-suggestion-Mickey Parade')).toBeNull();
  });

  it('ne propose pas une suggestion identique a la valeur courante', () => {
    render(
      <AutocompleteInput
        label="Publication"
        value="mickey parade"
        options={OPTIONS}
        onChangeText={() => undefined}
        testID="field"
      />,
    );

    expect(screen.queryByTestId('field-suggestion-Mickey Parade')).toBeNull();
  });

  it('n affiche pas de suggestions tant que le champ est vide', () => {
    render(
      <AutocompleteInput
        label="Publication"
        value=""
        options={OPTIONS}
        onChangeText={() => undefined}
        testID="field"
      />,
    );

    expect(screen.queryByTestId(/field-suggestion-/)).toBeNull();
  });

  it('remplit le champ lors de l appui sur une suggestion', async () => {
    const user = userEvent.setup();
    const onChangeText = jest.fn();
    render(
      <AutocompleteInput
        label="Publication"
        value="super"
        options={OPTIONS}
        onChangeText={onChangeText}
        testID="field"
      />,
    );

    await user.press(screen.getByTestId('field-suggestion-Super Picsou Géant'));

    expect(onChangeText).toHaveBeenCalledWith('Super Picsou Géant');
  });

  it('transmet les modifications de saisie', () => {
    const onChangeText = jest.fn();
    render(
      <AutocompleteInput
        label="Publication"
        value=""
        options={OPTIONS}
        onChangeText={onChangeText}
        testID="field"
      />,
    );

    fireEvent.changeText(screen.getByTestId('field'), 'Pic');

    expect(onChangeText).toHaveBeenCalledWith('Pic');
  });
});
