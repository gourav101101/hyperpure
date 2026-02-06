import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface WishlistItem {
  _id: string;
  name: string;
  price: number;
  images: string[];
  unit: string;
  category: string;
  veg: boolean;
  inStock: boolean;
  rating?: number;
  reviews?: number;
  bulkPrice?: number;
}

interface WishlistState {
  items: WishlistItem[];
  isHydrating: boolean;
}

const initialState: WishlistState = {
  items: [],
  isHydrating: false,
};

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    addToWishlist: (state, action: PayloadAction<WishlistItem>) => {
      const exists = state.items.find(i => i._id === action.payload._id);
      if (!exists) {
        state.items.push(action.payload);
      }
    },
    removeFromWishlist: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(i => i._id !== action.payload);
    },
    clearWishlist: (state) => {
      state.items = [];
    },
    setWishlistHydrating: (state, action: PayloadAction<boolean>) => {
      state.isHydrating = action.payload;
    },
  },
});

export const { addToWishlist, removeFromWishlist, clearWishlist, setWishlistHydrating } = wishlistSlice.actions;
export default wishlistSlice.reducer;
