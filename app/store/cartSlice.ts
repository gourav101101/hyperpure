import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface CartItem {
  _id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  unit: string;
  gstRate?: number;
  cessRate?: number;
}

interface CartState {
  items: CartItem[];
  cartAnimation: boolean;
}

const initialState: CartState = {
  items: [],
  cartAnimation: false,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<CartItem>) => {
      const existing = state.items.find(i => i._id === action.payload._id);
      if (existing) {
        existing.quantity += action.payload.quantity;
      } else {
        state.items.push(action.payload);
      }
      state.cartAnimation = true;
    },
    removeFromCart: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(i => i._id !== action.payload);
    },
    updateQuantity: (state, action: PayloadAction<{ id: string; quantity: number }>) => {
      if (action.payload.quantity <= 0) {
        state.items = state.items.filter(i => i._id !== action.payload.id);
      } else {
        const item = state.items.find(i => i._id === action.payload.id);
        if (item) item.quantity = action.payload.quantity;
      }
    },
    clearCart: (state) => {
      state.items = [];
    },
    setCartAnimation: (state, action: PayloadAction<boolean>) => {
      state.cartAnimation = action.payload;
    },
  },
});

export const { addToCart, removeFromCart, updateQuantity, clearCart, setCartAnimation } = cartSlice.actions;
export default cartSlice.reducer;
