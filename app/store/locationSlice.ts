import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Location {
  _id: string;
  name: string;
  city: string;
  state?: string;
  pincode?: string;
  isGlobal?: boolean;
}

interface LocationState {
  selectedLocation: Location | null;
  availableLocations: Location[];
  showLocationModal: boolean;
  locationModalDismissed: boolean;
}

const initialState: LocationState = {
  selectedLocation: null,
  availableLocations: [],
  showLocationModal: false,
  locationModalDismissed: false,
};

const locationSlice = createSlice({
  name: 'location',
  initialState,
  reducers: {
    setSelectedLocation: (state, action: PayloadAction<Location>) => {
      state.selectedLocation = action.payload;
      state.locationModalDismissed = false;
    },
    setAvailableLocations: (state, action: PayloadAction<Location[]>) => {
      state.availableLocations = action.payload;
    },
    setShowLocationModal: (state, action: PayloadAction<boolean>) => {
      state.showLocationModal = action.payload;
    },
    dismissLocationModal: (state) => {
      state.showLocationModal = false;
      state.locationModalDismissed = true;
    },
    clearLocation: (state) => {
      state.selectedLocation = null;
    },
  },
});

export const { setSelectedLocation, setAvailableLocations, setShowLocationModal, dismissLocationModal, clearLocation } = locationSlice.actions;
export default locationSlice.reducer;
