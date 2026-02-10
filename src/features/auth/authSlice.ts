import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Define the shape of the authentication state
export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  status: string;
  paymentStatus: string;
  availableAmount?: number;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  accessToken: string | null;
  isAuthenticated: boolean;
}

// Load initial state from local storage (if available)
const loadAuthStateFromLocalStorage = (): AuthState => {
  const storedAuthState = localStorage.getItem('authState');
  if (storedAuthState) {
    return JSON.parse(storedAuthState);
  }
  return {
    user: null,
    token: null,
    accessToken: null,
    isAuthenticated: false,
  };
};

// Save state to local storage
const saveAuthStateToLocalStorage = (state: AuthState) => {
  localStorage.setItem('authState', JSON.stringify(state));
};

// Define the initial state
const initialState: AuthState = loadAuthStateFromLocalStorage();

// Create the auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{ user: User; accessToken: string }>) => {
      state.user = action.payload.user;
      state.token = action.payload.accessToken;
      state.isAuthenticated = true;
      saveAuthStateToLocalStorage(state);
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem('authState');
    },
    initializeAuth: (state) => {
      const storedAuthState = loadAuthStateFromLocalStorage();
      state.user = storedAuthState.user;
      state.token = storedAuthState.token;
      state.isAuthenticated = storedAuthState.isAuthenticated;
    },
    setUserStatus: (state, action: PayloadAction<{ status: string; paymentStatus?: string }>) => {
      if (state.user) {
        state.user.status = action.payload.status;
        if (action.payload.paymentStatus) {
          state.user.paymentStatus = action.payload.paymentStatus;
        }
        saveAuthStateToLocalStorage(state);
      }
    },
  },
});

// Export the actions and reducer
export const { setCredentials, logout, initializeAuth, setUserStatus } = authSlice.actions;
export default authSlice.reducer;