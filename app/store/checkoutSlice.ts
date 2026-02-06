import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface CheckoutState {
  selectedSlot: any | null;
  needInvoice: boolean;
}

const initialState: CheckoutState = {
  selectedSlot: null,
  needInvoice: false,
};

const checkoutSlice = createSlice({
  name: 'checkout',
  initialState,
  reducers: {
    setSelectedSlot: (state, action: PayloadAction<any>) => {
      state.selectedSlot = action.payload;
    },
    setNeedInvoice: (state, action: PayloadAction<boolean>) => {
      state.needInvoice = action.payload;
    },
    clearCheckout: (state) => {
      state.selectedSlot = null;
      state.needInvoice = false;
    },
  },
});

export const { setSelectedSlot, setNeedInvoice, clearCheckout } = checkoutSlice.actions;
export default checkoutSlice.reducer;
