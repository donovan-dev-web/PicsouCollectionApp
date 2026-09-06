import { createContext, useCallback, useContext, useState } from 'react';

type DrawerContextValue = {
  open: () => void;
  close: () => void;
  visible: boolean;
};

const DrawerContext = createContext<DrawerContextValue>({
  open: () => {},
  close: () => {},
  visible: false,
});

export function useDrawer() {
  return useContext(DrawerContext);
}

export function DrawerProvider({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(false);
  const open = useCallback(() => setVisible(true), []);
  const close = useCallback(() => setVisible(false), []);

  return (
    <DrawerContext.Provider value={{ open, close, visible }}>{children}</DrawerContext.Provider>
  );
}

export { DrawerProvider as default };
