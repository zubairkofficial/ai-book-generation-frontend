import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useVerifyOTPMutation } from '@/api/authApi';
import { useDispatch } from 'react-redux';
import { setCredentials } from '@/features/auth/authSlice';
import * as yup from 'yup';
import { useToast } from '@/context/ToastContext'; // Import custom toast hook
import ToastContainer from '@/components/Toast/ToastContainer'; // Import custom ToastContainer

// Define the validation schema for OTP
const otpSchema = yup.object().shape({
  otp: yup
    .string()
    .required('OTP is required')
    .matches(/^\d{6}$/, 'OTP must be exactly 6 digits'),
});

export default function VerifyOTP() {
  const location = useLocation();
  const email = location.state.email;
  const [otp, setOtp] = useState('');
  const [errors, setErrors] = useState<{ otp?: string }>({});
  const navigate = useNavigate();
  const [verifyOTP, { isLoading }] = useVerifyOTPMutation();
  const dispatch = useDispatch();
  const { addToast } = useToast(); // Use custom toast hook

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Validate the OTP input
      await otpSchema.validate({ otp }, { abortEarly: false });
      setErrors({}); // Clear any previous errors

      const response = await verifyOTP({ email, code: otp }).unwrap();
      const { user, accessToken }: any = response;

      // Update Redux state
      dispatch(setCredentials({ user, accessToken }));

      // Show success toast
      addToast('OTP verified successfully!', 'success');

      // Navigate to home page after a short delay
      setTimeout(() => {
        navigate('/home');
      }, 1000);
    } catch (err: any) {
      if (err.name === 'ValidationError') {
        // Handle validation errors
        const validationErrors: { [key: string]: string } = {};
        err.inner.forEach((error: yup.ValidationError) => {
          if (error.path) {
            validationErrors[error.path] = error.message;
          }
        });
        setErrors(validationErrors);
      } else {
        // Handle API errors
        addToast(err?.data?.message || 'Invalid or expired OTP', 'error');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <ToastContainer /> {/* Add custom ToastContainer */}
      <Card className="w-full max-w-md p-8 bg-white">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold mb-2">Verify OTP</h2>
          <p className="text-gray-600">
            Enter your OTP for verification.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="otp">OTP</Label>
            <Input
              id="otp"
              type="text"
              placeholder="123456"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className={errors.otp ? 'border-red-500' : ''}
            />
            {errors.otp && (
              <p className="text-sm text-red-500">{errors.otp}</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full bg-amber-500 hover:bg-amber-600"
            disabled={isLoading}
          >
            {isLoading ? 'Verifying...' : 'Verify OTP'}
          </Button>

          <div className="text-center mt-6">
            <Link to="/auth" className="text-sm text-amber-600 hover:underline">
              Back to Sign In
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
}