import {createSlice} from '@reduxjs/toolkit';

export const NetworkStatus = createSlice({
  name: 'connection',
  initialState: {
    status: true,
  },

  reducers: {
    checkInternet: (state, action) => {
      state.status = action.payload;
    },
  },
});

// Action creators are generated for each case reducer function
export const {checkInternet} = NetworkStatus.actions;

export default NetworkStatus.reducer;
