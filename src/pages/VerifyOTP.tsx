import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import { useVerifyOTPMutation } from '@/api/authApi';
import { useDispatch } from 'react-redux';
import { setCredentials } from '@/features/auth/authSlice';

export default function VerifyOTP() {
    const location=useLocation()
    // console.log("location: " , location.state.email)
    const email = location.state.email;
//   const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const navigate = useNavigate();
  const [verifyOTP, { isLoading }] = useVerifyOTPMutation();
  const dispatch = useDispatch();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    try {
      const response = await verifyOTP({ email, code: otp }).unwrap();
      const { user, accessToken, refreshToken }: any = response;
  
      // Store tokens in localStorage
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
  
      // Update Redux state
      dispatch(setCredentials({ user, accessToken, refreshToken }));
  
      toast.success('OTP verified successfully!');
      navigate('/home');
    } catch (err: any) {
      toast.error(err?.data?.message || 'Invalid or expired OTP');
    }
  };
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
     <ToastContainer/>
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
              required
            />
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
