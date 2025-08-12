import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode
} from 'react';
import { CartItem } from 'types';

interface WishlistContextType {
  items: CartItem[];
  addToWishlist: (item: CartItem) => void;
  removeFromWishlist: (itemId: string) => void;
  clearWishlist: () => void;
  isInWishlist: (itemId: string) => boolean;
  totalItems: number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(
  undefined
);

export const WishlistProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const savedWishlist = localStorage.getItem('wishlist');
    if (savedWishlist) {
      setItems(JSON.parse(savedWishlist));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('wishlist', JSON.stringify(items));
  }, [items]);

  const addToWishlist = (newItem: CartItem) => {
    setItems(prev => {
      const exists = prev.some(
        item => item.itemId === newItem.itemId && item.type === newItem.type
      );
      if (exists) return prev;
      return [...prev, newItem];
    });
  };

  const removeFromWishlist = (itemId: string) => {
    setItems(prev => prev.filter(item => item.itemId !== itemId));
  };

  const clearWishlist = () => {
    setItems([]);
  };

  const isInWishlist = (itemId: string) => {
    return items.some(item => item.itemId === itemId);
  };

  const totalItems = items.length;

  return (
    <WishlistContext.Provider
      value={{
        items,
        addToWishlist,
        removeFromWishlist,
        clearWishlist,
        isInWishlist,
        totalItems
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
