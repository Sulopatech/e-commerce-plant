// paymentSlice.ts
import {createSlice, PayloadAction} from '@reduxjs/toolkit';

interface PaymentState {
  cvv: string;
  name: string;
  address: string;
  streetLine: string;
  addressShipping: string;
  streetLineShipping: string;
  cardNumber: string;
  expiryDate: string;
  cardHolderName: string;
}

const initialState: PaymentState = {
  cvv: '',
  name: '',
  address: '',
  streetLine: '',
  addressShipping: '',
  streetLineShipping: '',
  expiryDate: '',
  cardNumber: '',
  cardHolderName: '',
};

export const paymentSlice = createSlice({
  name: 'payment',
  initialState,
  reducers: {
    setName: (state, action: PayloadAction<string>) => {
      state.name = action.payload;
    },
    setAddress: (state, action: PayloadAction<string>) => {
      state.address = action.payload;
    },
    setStreet: (state, action: PayloadAction<string>) => {
      state.streetLine = action.payload;
    },
    setAddressShipping: (state, action: PayloadAction<string>) => {
      state.addressShipping = action.payload;
    },
    setStreetShipping: (state, action: PayloadAction<string>) => {
      state.streetLineShipping = action.payload;
    },
    setCardNumber: (state, action: PayloadAction<string>) => {
      state.cardNumber = action.payload;
    },
    setExpiryDate: (state, action: PayloadAction<string>) => {
      state.expiryDate = action.payload;
    },
    setCvv: (state, action: PayloadAction<string>) => {
      state.cvv = action.payload;
    },
    setCardHolderName: (state, action: PayloadAction<string>) => {
      state.cardHolderName = action.payload;
    },
  },
});

export const {
  setName,
  setAddress,
  setStreet,
  setAddressShipping,
  setStreetShipping,
  setCardNumber,
  setExpiryDate,
  setCvv,
  setCardHolderName,
} = paymentSlice.actions;

export default paymentSlice.reducer;
