import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {UserProfile} from '../../context/UserContext';

interface UserState {
  profile: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
}

const initialState: UserState = {
  profile: {
    name: 'Lingesh',
    email: 'lingesh@cinebooks.com',
    phone: '9876543210',
    address: '123 Cinema Street, Chennai',
    avatar: 'https://picsum.photos/seed/lingesh/200/200',
  },
  token: 'simulated_jwt_token',
  isAuthenticated: true,
};

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUserProfile: (state, action: PayloadAction<UserProfile>) => {
      state.profile = action.payload;
    },
    setToken: (state, action: PayloadAction<string | null>) => {
      state.token = action.payload;
      state.isAuthenticated = !!action.payload;
    },
    logoutUser: state => {
      state.profile = null;
      state.token = null;
      state.isAuthenticated = false;
    },
  },
});

export const {setUserProfile, setToken, logoutUser} = userSlice.actions;
export default userSlice.reducer;
