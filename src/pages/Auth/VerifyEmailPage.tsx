// pages/VerifyEmailPage.tsx (example)
import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { useToast } from '@/context/ToastContext'; // Import custom toast hook

// RTK Query hook (example)
import { useVerifyEmailMutation, useResendVerificationMutation } from '@/api/authApi';
import { ToastType } from '@/constant';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Mail } from 'lucide-react';

function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { addToast } = useToast();
  const email = location.state?.email;

  const [verifyEmail, { isLoading: verifyLoading }] = useVerifyEmailMutation();
  const [resendVerification, { isLoading: resendLoading }] = useResendVerificationMutation();
  const [verificationStatus, setVerificationStatus] = useState<'instructions' | 'pending' | 'success' | 'error'>('instructions');

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      setVerificationStatus('pending');
      verifyEmail({ token })
        .unwrap()
        .then(() => {
          setVerificationStatus('success');
          addToast('Email verified successfully!', ToastType.SUCCESS);
          setTimeout(() => navigate('/auth'), 2000);
        })
        .catch((error: any) => {
          setVerificationStatus('error');
          addToast(error.data?.message || 'Invalid or expired token.', ToastType.ERROR);
        });
    }
  }, [searchParams, navigate, verifyEmail]);

  const handleResendVerification = async () => {
    if (!email) {
      addToast('Email address is missing. Please try signing up again.', ToastType.ERROR);
      return;
    }

    try {
      await resendVerification({ email }).unwrap();
      addToast('Verification email has been resent. Please check your inbox.', ToastType.SUCCESS);
    } catch (error: any) {
      addToast(error.data?.message || 'Failed to resend verification email.', ToastType.ERROR);
    }
  };

  const renderContent = () => {
    switch (verificationStatus) {
      case 'instructions':
        return (
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <Mail className="h-12 w-12 text-amber-500" />
            </div>
            <h2 className="text-2xl font-bold">Check Your Email</h2>
            <p className="text-gray-600">
              We've sent a verification link to <span className="font-medium">{email}</span>
            </p>
            <p className="text-gray-600">
              Click the link in the email to verify your account.
            </p>
            <Button
              onClick={handleResendVerification}
              disabled={resendLoading}
              variant="outline"
              className="mt-4"
            >
              {resendLoading ? 'Sending...' : 'Resend Verification Email'}
            </Button>
           
          </div>
        );

      case 'pending':
        return (
          <div className="text-center">
            <h2 className="text-2xl font-bold">Verifying your email...</h2>
            <p className="text-gray-600 mt-2">Please wait while we verify your email address.</p>
          </div>
        );

      case 'success':
        return (
          <div className="text-center">
            <h2 className="text-2xl font-bold text-green-600">Email Verified!</h2>
            <p className="text-gray-600 mt-2">Your email has been verified successfully. Redirecting to login...</p>
          </div>
        );

      case 'error':
        return (
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold text-red-600">Verification Failed</h2>
            <p className="text-gray-600">The verification link is invalid or has expired.</p>
            <Button
              onClick={handleResendVerification}
              disabled={resendLoading}
              variant="outline"
            >
              {resendLoading ? 'Sending...' : 'Resend Verification Email'}
            </Button>
            <div className="mt-4">
              <button
                onClick={() => navigate('/auth')}
                className="text-amber-500 hover:underline"
              >
                Back to Sign In
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 bg-white">
        {renderContent()}
      </Card>
    </div>
  );
}

export default VerifyEmailPage;
