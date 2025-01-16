import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Define the shape of the authentication state
interface AuthState {
  user: { id: string; email: string } | null;
  token: string | null;
  accessToken: string | null;
  isAuthenticated: boolean;
}

// Load initial state from local storage (if available)
const loadAuthStateFromLocalStorage = (): AuthState => {
  const storedAuthState = localStorage.getItem('authState');
  console.log('stored auth state : ', storedAuthState);
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
    setCredentials: (state, action: PayloadAction<{ user: { id: string; email: string }; accessToken: string }>) => {
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
      state.token = storedAuthState.accessToken;
      state.isAuthenticated = storedAuthState.isAuthenticated;
    },
  },
});

// Export the actions and reducer
export const { setCredentials, logout, initializeAuth } = authSlice.actions;
export default authSlice.reducer;