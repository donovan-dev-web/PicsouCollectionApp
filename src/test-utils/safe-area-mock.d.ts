/* Types des helpers SafeArea injectés par jest.setup.js (tests uniquement). */
declare global {
  var __setSafeAreaInsets:
    | ((insets: { top?: number; bottom?: number; left?: number; right?: number }) => void)
    | undefined;
  var __resetSafeAreaInsets: (() => void) | undefined;
}

export {};
