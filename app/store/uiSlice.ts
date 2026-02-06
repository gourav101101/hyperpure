import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UIState {
  searchQuery: string;
  selectedCategory: string;
  selectedSubcategory: string;
  vegFilter: boolean;
  showMenu: boolean;
  showLoginModal: boolean;
  showLogoutModal: boolean;
}

const initialState: UIState = {
  searchQuery: '',
  selectedCategory: 'All',
  selectedSubcategory: 'All',
  vegFilter: false,
  showMenu: false,
  showLoginModal: false,
  showLogoutModal: false,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setSelectedCategory: (state, action: PayloadAction<string>) => {
      state.selectedCategory = action.payload;
    },
    setSelectedSubcategory: (state, action: PayloadAction<string>) => {
      state.selectedSubcategory = action.payload;
    },
    setVegFilter: (state, action: PayloadAction<boolean>) => {
      state.vegFilter = action.payload;
    },
    setShowMenu: (state, action: PayloadAction<boolean>) => {
      state.showMenu = action.payload;
    },
    setShowLoginModal: (state, action: PayloadAction<boolean>) => {
      state.showLoginModal = action.payload;
    },
    setShowLogoutModal: (state, action: PayloadAction<boolean>) => {
      state.showLogoutModal = action.payload;
    },
    resetFilters: (state) => {
      state.searchQuery = '';
      state.selectedCategory = 'All';
      state.selectedSubcategory = 'All';
      state.vegFilter = false;
    },
  },
});

export const { 
  setSearchQuery, 
  setSelectedCategory, 
  setSelectedSubcategory, 
  setVegFilter, 
  setShowMenu, 
  setShowLoginModal, 
  setShowLogoutModal,
  resetFilters 
} = uiSlice.actions;
export default uiSlice.reducer;
