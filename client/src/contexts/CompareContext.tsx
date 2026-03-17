import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";

export interface CompareItem {
  id: number;
  name: string;
}

interface CompareContextType {
  items: CompareItem[];
  addItem: (item: CompareItem) => void;
  removeItem: (id: number) => void;
  clearAll: () => void;
  isInCompare: (id: number) => boolean;
  isMaxed: boolean;
}

const MAX_COMPARE = 5;
const STORAGE_KEY = "tc-compare-items";

function loadFromStorage(): CompareItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

const CompareContext = createContext<CompareContextType | null>(null);

export function CompareProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CompareItem[]>(loadFromStorage);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = useCallback((item: CompareItem) => {
    setItems((prev) => {
      if (prev.length >= MAX_COMPARE) return prev;
      if (prev.some((i) => i.id === item.id)) return prev;
      return [...prev, item];
    });
  }, []);

  const removeItem = useCallback((id: number) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setItems([]);
  }, []);

  const isInCompare = useCallback(
    (id: number) => items.some((i) => i.id === id),
    [items]
  );

  return (
    <CompareContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        clearAll,
        isInCompare,
        isMaxed: items.length >= MAX_COMPARE,
      }}
    >
      {children}
    </CompareContext.Provider>
  );
}

export function useCompare() {
  const ctx = useContext(CompareContext);
  if (!ctx) throw new Error("useCompare must be used within CompareProvider");
  return ctx;
}
