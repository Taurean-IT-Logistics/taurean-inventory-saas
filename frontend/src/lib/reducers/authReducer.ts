import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AuthUser, User } from 'types';

const initialState: AuthUser = {
  user: null,
  tokens: null,
  isAuthenticated: false
};

const authSlice = createSlice({
  name: 'auth',
  initialState: initialState,
  reducers: {
    login(state, action: PayloadAction<AuthUser>) {
      (state.isAuthenticated = true),
        (state.tokens = action.payload.tokens),
        (state.user = action.payload.user);
    },
    logout(state) {
      (state.isAuthenticated = false),
        (state.user = null),
        (state.tokens = null);
    },
    update(state, action: PayloadAction<Partial<AuthUser>>) {
      (state.user = action.payload.user!),
        (state.tokens = action.payload.tokens!),
        (state.isAuthenticated = action.payload.isAuthenticated!);
    },
    updateProfile(state, action: PayloadAction<Partial<User>>) {
      if (state.user) {
        // Merge the updated profile data with existing user data
        state.user = {
          ...state.user,
          ...action.payload
        };
      }
    }
  }
});

const { login, logout, update, updateProfile } = authSlice.actions;
const authReducer = authSlice.reducer;
export { login, logout, update, authReducer, updateProfile };
