import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface User {
  username: string;
  email: string;
  isLoggedIn: boolean;
}

const savedUser = localStorage.getItem('user');
const initialState: User = savedUser 
  ? JSON.parse(savedUser) 
  : {
      username: '',
      email: '',
      isLoggedIn: false,
    };

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    login: (state, action: PayloadAction<{ username: string; email: string }>) => {
      state.username = action.payload.username;
      state.email = action.payload.email;
      state.isLoggedIn = true;
      localStorage.setItem('user', JSON.stringify(state));
    },
    logout: (state) => {
      state.username = '';
      state.email = '';
      state.isLoggedIn = false;
      localStorage.removeItem('user');
    },
  },
});

export const { login, logout } = userSlice.actions;
export default userSlice;
