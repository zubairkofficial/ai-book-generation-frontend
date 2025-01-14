// pages/VerifyEmailPage.tsx (example)
import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
// RTK Query hook (example)
import { useVerifyEmailMutation } from '@/api/authApi';

function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [verifyEmail, { isLoading }] = useVerifyEmailMutation();
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'success' | 'error'>('pending');

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      verifyEmail({ token })
        .unwrap()
        .then(() => {
          setVerificationStatus('success');
          toast.success('Email verified successfully!');
          // Optionally redirect somewhere
          setTimeout(() => navigate('/dashboard'), 2000);
        })
        .catch((error: any) => {
          setVerificationStatus('error');
          toast.error(error.data?.message || 'Invalid or expired token.');
        });
    } else {
      setVerificationStatus('error');
      toast.error('Token is missing or invalid.');
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
