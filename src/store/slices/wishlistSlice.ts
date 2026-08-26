import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {Movie} from '../../data/movies';

interface WishlistState {
  items: Movie[];
}

const initialState: WishlistState = {
  items: [],
};

export const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    toggleWishlist: (state, action: PayloadAction<Movie>) => {
      const index = state.items.findIndex(item => item.id === action.payload.id);
      if (index >= 0) {
        state.items.splice(index, 1);
      } else {
        state.items.push(action.payload);
      }
    },
    setWishlist: (state, action: PayloadAction<Movie[]>) => {
      state.items = action.payload;
    },
  },
});

export const {toggleWishlist, setWishlist} = wishlistSlice.actions;
export default wishlistSlice.reducer;
