import { Loader2 } from 'lucide-react';

const LoadingState = () => (
  <div className="flex items-center justify-center p-8">
    <div className="space-y-4 text-center">
      <Loader2 className="w-8 h-8 animate-spin text-amber-500 mx-auto" />
      <p className="text-gray-600">Generating content...</p>
    </div>
  </div>
);

export default LoadingState; 