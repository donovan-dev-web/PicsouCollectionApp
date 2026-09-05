import { createContext, useCallback, useContext, useState } from 'react';

type DrawerContextValue = {
  open: () => void;
  close: () => void;
};

const DrawerContext = createContext<DrawerContextValue>({ open: () => {}, close: () => {} });

export function useDrawer() {
  return useContext(DrawerContext);
}

export function DrawerProvider({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(false);
  const open = useCallback(() => setVisible(true), []);
  const close = useCallback(() => setVisible(false), []);

  void visible;

  return <DrawerContext.Provider value={{ open, close }}>{children}</DrawerContext.Provider>;
}

export { DrawerProvider as default };
