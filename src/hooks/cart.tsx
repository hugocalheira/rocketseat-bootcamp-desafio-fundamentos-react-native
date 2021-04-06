import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const STORAGE_KEY = '@APP-DESAFIO/Cart2'

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  const save = useCallback(async data => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  }, [])

  async function addToCart(product: Product) {
    const productExists = products.findIndex(item => item.id === product.id)
    if (productExists === -1) {
      product.quantity = 1
      await save([ ...products, product ])
      setProducts(old => {
        return [...old, product]
      })
    } else {
      increment(product.id)
    }
  }

  async function increment(id: string) {
    const updatedProducts: Product[] = []
    for (const product of products) {
      if (product.id === id) {
        product.quantity += 1
      }
      updatedProducts.push(product)
    }
    setProducts(updatedProducts)
    await save(updatedProducts)
  }

  async function decrement(id: string) {
    const updatedProducts: Product[] = []
    for (const product of products) {
      if (product.id === id) {
        product.quantity -= 1
      }
      if (product.quantity > 0) {
        updatedProducts.push(product)
      }
    }
    setProducts(updatedProducts)
    await save(updatedProducts)
  }

  useEffect(() => {
    async function loadCartFromStorage(): Promise<void> {
      const storagedProductsString = await AsyncStorage.getItem(STORAGE_KEY)
      if (storagedProductsString) {
        const storagedProducts = await JSON.parse(storagedProductsString)
        setProducts(storagedProducts)
      }
    }

    loadCartFromStorage();
  }, [setProducts, STORAGE_KEY]);

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
