let pendingBarcode: string | null = null;

export function setPendingBarcode(value: string): void {
  pendingBarcode = value;
}

export function consumePendingBarcode(): string | null {
  const value = pendingBarcode;
  pendingBarcode = null;
  return value;
}
