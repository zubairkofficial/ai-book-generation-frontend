import { useDispatch } from 'react-redux';
import { setCredentials, logout } from './authSlice';
import { useSignUpMutation, useSignInMutation } from '../../api/authApi';

export const useAuth = () => {
  const dispatch = useDispatch();
  const [signUp] = useSignUpMutation();
  const [signIn] = useSignInMutation();

  const handleSignUp = async (credentials: { email: string; password: string; name?: string }) => {
    try {
      const response = await signUp(credentials).unwrap();
      dispatch(setCredentials(response));
    } catch (error) {
      console.error('Sign up failed:', error);
    }
  };

  const handleSignIn = async (credentials: { email: string; password: string }) => {
    try {
      const response = await signIn(credentials).unwrap();
      dispatch(setCredentials(response));
    } catch (error) {
      console.error('Sign in failed:', error);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
  };

  return { handleSignUp, handleSignIn, handleLogout };
};