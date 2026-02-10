// components/Loader.tsx
import { Loader2 } from 'lucide-react';

interface LoaderProps {
  className?: string;
}

export default function Loader({ className }: LoaderProps) {
  return <Loader2 className={`h-4 w-4 animate-spin ${className}`} />;
}