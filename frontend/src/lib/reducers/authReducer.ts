import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AuthUser } from 'types';

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
    }
  }
});

const { login, logout, update } = authSlice.actions;
const authReducer = authSlice.reducer;
export { login, logout, update, authReducer };
