import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { API_BASE_URL } from '../../config/constants';

const AUTH_TOKEN_KEY = 'lms_token';
const AUTH_KEY = 'lms_auth';

function getStoredToken() {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

export const loginThunk = createAsyncThunk(
  'auth/login',
  async ({ username, password }, { rejectWithValue }) => {
    const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json().catch(() => ({}));
    if (data?.success && data?.token) {
      return { token: data.token };
    }
    return rejectWithValue(data?.message ?? 'Invalid credentials');
  }
);

const initialState = {
  token: getStoredToken(),
  isAuthenticated: !!getStoredToken() && localStorage.getItem(AUTH_KEY) === 'true',
  loginLoading: false,
  loginError: null,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.loginError = null;
      localStorage.setItem(AUTH_TOKEN_KEY, action.payload.token);
      localStorage.setItem(AUTH_KEY, 'true');
    },
    logout: (state) => {
      state.token = null;
      state.isAuthenticated = false;
      state.loginError = null;
      localStorage.removeItem(AUTH_TOKEN_KEY);
      localStorage.removeItem(AUTH_KEY);
    },
    clearLoginError: (state) => {
      state.loginError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginThunk.pending, (state) => {
        state.loginLoading = true;
        state.loginError = null;
      })
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.loginLoading = false;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.loginError = null;
        localStorage.setItem(AUTH_TOKEN_KEY, action.payload.token);
        localStorage.setItem(AUTH_KEY, 'true');
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.loginLoading = false;
        state.loginError = action.payload ?? 'Login failed';
      });
  },
});

export const { setCredentials, logout, clearLoginError } = authSlice.actions;
export default authSlice.reducer;

export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectToken = (state) => state.auth.token;
export const selectLoginLoading = (state) => state.auth.loginLoading;
export const selectLoginError = (state) => state.auth.loginError;
