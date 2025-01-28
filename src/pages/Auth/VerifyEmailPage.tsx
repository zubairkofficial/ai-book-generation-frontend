// pages/VerifyEmailPage.tsx (example)
import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useToast } from '@/context/ToastContext'; // Import custom toast hook

// RTK Query hook (example)
import { useVerifyEmailMutation } from '@/api/authApi';
import { ToastType } from '@/constant';

function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [verifyEmail, { isLoading }] = useVerifyEmailMutation();
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'success' | 'error'>('pending');

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      verifyEmail({ token })
        .unwrap()
        .then(() => {
          setVerificationStatus('success');
          addToast('Email verified successfully!',ToastType.SUCCESS);
          // Optionally redirect somewhere
          setTimeout(() => navigate('/dashboard'), 2000);
        })
        .catch((error: any) => {
          setVerificationStatus('error');
          addToast(error.data?.message || 'Invalid or expired token.',ToastType.ERROR);
        });
    } else {
      setVerificationStatus('error');
      addToast('Token is missing or invalid.',ToastType.ERROR);
    }
  }, [searchParams, navigate, verifyEmail]);

  if (verificationStatus === 'pending') {
    return <div>Verifying your email. Please wait...</div>;
  }

  if (verificationStatus === 'success') {
    return <div>Your email has been verified! Redirecting...</div>;
  }

  return <div>Verification failed. Please try again or contact support.</div>;
}

export default VerifyEmailPage;
