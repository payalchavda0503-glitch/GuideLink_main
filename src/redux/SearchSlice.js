import {createSlice} from '@reduxjs/toolkit';

export const SearchSlice = createSlice({
  name: 'connection',
  initialState: {
    data: [],
  },

  reducers: {
    SearchData: (state, action) => {
      state.data = action.payload;
    },
  },
});

// Action creators are generated for each case reducer function
export const {SearchData} = SearchSlice.actions;

export default SearchSlice.reducer;
