"use client";
import { createContext, useContext, ReactNode, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { addToCart as addToCartAction, removeFromCart as removeFromCartAction, updateQuantity as updateQuantityAction, clearCart as clearCartAction, setCartAnimation } from '../store/cartSlice';

export interface CartItem {
  _id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  unit: string;
  gstRate?: number;
  cessRate?: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalAmount: number;
  cartAnimation: boolean;
  getCartItem: (id: string) => CartItem | undefined;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();
  const cart = useAppSelector((state) => state.cart.items);
  const cartAnimation = useAppSelector((state) => state.cart.cartAnimation);

  useEffect(() => {
    const syncCart = async () => {
      const userId = localStorage.getItem('userId');
      if (userId) {
        try {
          const res = await fetch(`/api/cart?userId=${userId}`);
          const data = await res.json();
          if (data.cart) {
            dispatch(clearCartAction());
            data.cart.forEach((item: CartItem) => dispatch(addToCartAction(item)));
          }
        } catch (error) {
          console.error('Failed to sync cart:', error);
        }
      }
    };
    syncCart();
  }, []);

  const addToCart = (item: CartItem) => {
    dispatch(addToCartAction(item));
    setTimeout(() => dispatch(setCartAnimation(false)), 600);
  };

  const removeFromCart = (id: string) => {
    dispatch(removeFromCartAction(id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    dispatch(updateQuantityAction({ id, quantity }));
  };

  const clearCart = async () => {
    dispatch(clearCartAction());
    const userId = localStorage.getItem('userId');
    if (userId) {
      try {
        await fetch('/api/cart', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId })
        });
      } catch (error) {
        console.error('Failed to clear backend cart:', error);
      }
    }
  };

  const getCartItem = (id: string) => cart.find(i => i._id === id);

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, totalItems, totalAmount, cartAnimation, getCartItem }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};
