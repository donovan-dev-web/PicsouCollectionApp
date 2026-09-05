/* Jest setup — M10-02 : mock SafeArea + icônes vectorielles (rendu RN pur, sans natif). */
jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  return {
    SafeAreaProvider: ({ children }) => React.createElement(React.Fragment, null, children),
    SafeAreaConsumer: ({ children }) => children({ top: 0, bottom: 0, left: 0, right: 0 }),
    useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
    useSafeAreaFrame: () => ({ x: 0, y: 0, width: 390, height: 844 }),
  };
});

jest.mock('@expo/vector-icons', () => {
  const React = require('react');
  const { Text } = require('react-native');
  const Feather = ({ name, ...props }) =>
    React.createElement(Text, { ...props, testID: `icon-${name}` }, name);
  return { Feather };
});

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    dispatch: jest.fn(),
    navigate: jest.fn(),
    goBack: jest.fn(),
  }),
  DrawerActions: {
    openDrawer: jest.fn(),
    closeDrawer: jest.fn(),
    toggleDrawer: jest.fn(),
  },
}));

jest.mock('@react-navigation/drawer', () => ({
  createDrawerNavigator: jest.fn(() => ({
    Navigator: ({ children }) => children,
    Screen: () => null,
  })),
}));
