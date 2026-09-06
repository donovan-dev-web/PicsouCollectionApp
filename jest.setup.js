/* Jest setup — M10-02 : mock SafeArea + icônes vectorielles (rendu RN pur, sans natif). */
jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  const state = {
    insets: { top: 0, bottom: 0, left: 0, right: 0 },
    frame: { x: 0, y: 0, width: 390, height: 844 },
  };
  // Configurable depuis les tests : global.__setSafeAreaInsets({ top: 44, bottom: 34 })
  global.__setSafeAreaInsets = (insets) => {
    state.insets = { top: 0, bottom: 0, left: 0, right: 0, ...insets };
  };
  global.__resetSafeAreaInsets = () => {
    state.insets = { top: 0, bottom: 0, left: 0, right: 0 };
  };
  return {
    SafeAreaProvider: ({ children }) => React.createElement(React.Fragment, null, children),
    SafeAreaConsumer: ({ children }) => children(state.insets),
    useSafeAreaInsets: () => state.insets,
    useSafeAreaFrame: () => state.frame,
  };
});

jest.mock('@expo/vector-icons', () => {
  const React = require('react');
  const { Text } = require('react-native');
  const Feather = ({ name, ...props }) =>
    React.createElement(Text, { ...props, testID: `icon-${name}` }, name);
  return { Feather };
});
