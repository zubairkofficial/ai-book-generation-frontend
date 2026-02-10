import { RootState } from '@/store/store';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const AuthRedirect = () => {
  const navigate = useNavigate();
  const { token, user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (token && user) {
      if (user.status === 'PENDING_PAYMENT') {
        navigate('/auth/payment', { state: { userId: user.id } });
      } else if (user.status === 'PENDING_APPROVAL' || user.status === 'REJECTED') {
        navigate('/auth/approval-pending');
      } else {
        navigate('/home');
      }
    }
  }, [token, user, navigate]);

  return null;
};

export default AuthRedirect;