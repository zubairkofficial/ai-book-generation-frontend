import { useState } from 'react';
import { useSignUpMutation } from '@/api/authApi';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Loader from '@/components/ui/loader';
import * as yup from 'yup';
import 'react-toastify/dist/ReactToastify.css';
import { useToast } from '@/context/ToastContext'; // Import custom toast hook
import ToastContainer from '@/components/Toast/ToastContainer'; // Import custom ToastContainer
import { ToastType } from '@/constant';

// Define the validation schema using yup
const signUpSchema = yup.object().shape({
  name: yup.string().required('Name is required.').trim(),
  email: yup
    .string()
    .email('Please enter a valid email address.')
    .required('Email is required.'),
  password: yup
    .string()
    .min(6, 'Password must be at least 6 characters long.')
    .required('Password is required.'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'Passwords must match.')
    .required('Confirm Password is required.'),
  phoneNumber: yup
    .string()
    .required('Phone number is required.'),
});

export default function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const [signUp] = useSignUpMutation();
  const navigate = useNavigate();
 const { addToast } = useToast(); // Use custom toast hook

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Validate the form data against the schema
      await signUpSchema.validate(
        { name, email, password, confirmPassword, phoneNumber },
        { abortEarly: false }
      );
      setErrors({}); // Clear any previous errors

      setIsLoading(true);

      // Call the sign-up API
     const response= await signUp({ email, password, name, phoneNumber }).unwrap();
     if(response){ 
     navigate('/home'); // Redirect to home page
     addToast('Account created successfully!',ToastType.SUCCESS);
}
    } catch (error: any) {
      if (error.name === 'ValidationError') {
        // Handle validation errors
        const validationErrors: { [key: string]: string } = {};
        error.inner.forEach((err: yup.ValidationError) => {
          if (err.path) {
            validationErrors[err.path] = err.message;
          }
        });
        setErrors(validationErrors);

        // Display the first validation error using toast
        addToast(validationErrors[Object.keys(validationErrors)[0]] || 'Something went wrong!',ToastType.ERROR);
      } else {
        // Handle API errors
        addToast(error.data.message??error.data.message?.errors[0].constraints.matches,ToastType.ERROR);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <ToastContainer />
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-2">
          {/* Name Field */}
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            placeholder="John Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}

          {/* Phone Number Field */}
          <Label htmlFor="phoneNumber">Phone Number</Label>
          <Input
            id="phoneNumber"
            placeholder="+92XXXXXXXXXX"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
          />
          {errors.phoneNumber && <p className="text-sm text-red-600">{errors.phoneNumber}</p>}

          {/* Email Field */}
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}

          {/* Password Field */}
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {errors.password && <p className="text-sm text-red-600">{errors.password}</p>}

          {/* Confirm Password Field */}
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <Input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          {errors.confirmPassword && (
            <p className="text-sm text-red-600">{errors.confirmPassword}</p>
          )}
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full bg-amber-500 hover:bg-amber-600"
          disabled={isLoading}
        >
          {isLoading ? <Loader /> : 'Create Account'}
        </Button>
      </form>
    </div>
  );
}