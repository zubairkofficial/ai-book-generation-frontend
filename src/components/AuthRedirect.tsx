import { RootState } from '@/store/store';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const AuthRedirect = () => {
  const navigate = useNavigate();
  const { token } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (token) {
      navigate('/home'); // Redirect to home if the user is logged in
    }
    navigate("/auth")
  }, [token, navigate]);

  return null;
};

export default AuthRedirect;