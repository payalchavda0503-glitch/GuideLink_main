import {createSlice} from '@reduxjs/toolkit';

export const ChangeSlice = createSlice({
  name: 'connection',
  initialState: {
    status: true,
  },

  reducers: {
    ChangeTab: (state, action) => {
      state.status = action.payload;
    },
  },
});

// Action creators are generated for each case reducer function
export const {ChangeTab} = ChangeSlice.actions;

export default ChangeSlice.reducer;
