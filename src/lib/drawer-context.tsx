import { createContext, useCallback, useContext, useMemo, useState } from 'react';

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

  const value = useMemo(() => ({ open, close, visible }), [open, close, visible]);

  return <DrawerContext.Provider value={value}>{children}</DrawerContext.Provider>;
}

export { DrawerProvider as default };
