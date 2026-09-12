import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  addLine,
  cartCount,
  cartTotal,
  removeLine,
  setQty,
  type CartLine,
  type ProductDTO,
} from "@desklab/shared";

const STORAGE_KEY = "desklab-cart";

interface CartContextValue {
  lines: CartLine[];
  count: number;
  totalCents: number;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  add: (product: ProductDTO, setupSlug?: string) => void;
  remove: (productId: string, setupSlug?: string) => void;
  setQuantity: (productId: string, quantity: number, setupSlug?: string) => void;
  clear: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

function load(): CartLine[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CartLine[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }): JSX.Element {
  const [lines, setLines] = useState<CartLine[]>(() =>
    typeof localStorage === "undefined" ? [] : load(),
  );
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } catch {
      // Sin almacenamiento: el carrito vive solo en memoria.
    }
  }, [lines]);

  const value = useMemo<CartContextValue>(
    () => ({
      lines,
      count: cartCount(lines),
      totalCents: cartTotal(lines),
      isOpen,
      openCart: () => setIsOpen(true),
      closeCart: () => setIsOpen(false),
      add: (product, setupSlug) => {
        setLines((prev) => addLine(prev, product, setupSlug));
        setIsOpen(true);
      },
      remove: (productId, setupSlug) =>
        setLines((prev) => removeLine(prev, productId, setupSlug)),
      setQuantity: (productId, quantity, setupSlug) =>
        setLines((prev) => setQty(prev, productId, quantity, setupSlug)),
      clear: () => setLines([]),
    }),
    [lines, isOpen],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart needs CartProvider");
  return ctx;
}
