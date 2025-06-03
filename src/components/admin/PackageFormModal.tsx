import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { PlusCircle, X, Loader2, Edit } from 'lucide-react';
import { SubscriptionPackage } from '@/api/subscriptionApi';

// Model options
const AI_MODEL_OPTIONS = [
  { value: "gpt-3.5-turbo", label: "GPT-3.5 Turbo" },
  { value: "gpt-4", label: "GPT-4" },
  { value: "gpt-4-turbo", label: "GPT-4 Turbo" },
  { value: "gpt-4o", label: "GPT-4o" },
];

const IMAGE_MODEL_OPTIONS = [
  { value: "flux-dev", label: "Flux Dev", url: "https://queue.fal.run/fal-ai/flux/dev" }
];

// Schema for package validation
const packageSchema = z.object({
  name: z.string().min(3, { message: "Package name must be at least 3 characters" }),
  description: z.string().nullable(),
  price: z.number().nonnegative({ message: "Price must be positive" }),
  durationDays: z.number().int().positive({ message: "Duration must be a positive integer" }),
  tokenLimit: z.number().int().positive({ message: "Token limit must be a positive integer" }),
  imageLimit: z.number().int().positive({ message: "Image limit must be a positive integer" }),
  modelType: z.string().min(3, { message: "Model type must be specified" }),
  imageModelURL: z.string().min(1, { message: "Image model URL must be specified" }),
  isActive: z.boolean(),
  isFree: z.boolean().default(false),
  features: z.record(z.string(), z.string()).optional(),
});

type PackageFormValues = z.infer<typeof packageSchema>;

interface PackageFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: PackageFormValues & { imageModelType: string }) => Promise<void>;
  editingPackage: SubscriptionPackage | null;
  isLoading: boolean;
}

// Constants
const FLUX_DEV_URL = 'https://queue.fal.run/fal-ai/flux/dev';

export const PackageFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  editingPackage,
  isLoading
}: PackageFormModalProps) => {
  const [features, setFeatures] = useState<{ key: string; value: string }[]>([
    { key: "feature1", value: "" }
  ]);

  const { register, handleSubmit, formState: { errors }, reset, setValue, control, watch } = useForm<PackageFormValues>({
    resolver: zodResolver(packageSchema),
    defaultValues: {
      name: '',
      description: '',
      price: undefined,
      durationDays: undefined,
      tokenLimit: undefined,
      imageLimit: undefined,
      modelType: '',
      imageModelURL: FLUX_DEV_URL,
      isActive: true,
      isFree: false,
      features: {}
    }
  });

  // Add useEffect to populate form when editing
  useEffect(() => {
    if (editingPackage) {
      // Set form values
      setValue("name", editingPackage.name);
      setValue("description", editingPackage.description || '');
      setValue("price", parseFloat(editingPackage.price));
      setValue("durationDays", editingPackage.durationDays);
      setValue("tokenLimit", editingPackage.tokenLimit);
      setValue("imageLimit", editingPackage.imageLimit);
      setValue("modelType", editingPackage.modelType);
      setValue("imageModelURL", FLUX_DEV_URL);
      setValue("isActive", editingPackage.isActive);
      setValue("isFree", editingPackage.isFree);

      // Set features
      if (editingPackage.features && Object.keys(editingPackage.features).length > 0) {
        const featureArray = Object.entries(editingPackage.features).map(([key, value], index) => ({
          key: `feature${index + 1}`,
          value
        }));
        setFeatures(featureArray);
        setValue("features", editingPackage.features);
      } else {
        setFeatures([{ key: "feature1", value: "" }]);
        setValue("features", {});
      }
    } else {
      // Reset form when creating new package
      reset({
        name: '',
        description: '',
        price: undefined,
        durationDays: undefined,
        tokenLimit: undefined,
        imageLimit: undefined,
        modelType: '',
        imageModelURL: FLUX_DEV_URL,
        isActive: true,
        isFree: false,
        features: {}
      });
      setFeatures([{ key: "feature1", value: "" }]);
    }
  }, [editingPackage, setValue, reset, isOpen]);

  // Update form features whenever features state changes
  useEffect(() => {
    const featuresObject = features.reduce((acc, feature) => {
      if (feature.value.trim()) {
        acc[feature.key] = feature.value;
      }
      return acc;
    }, {} as Record<string, string>);
    setValue("features", featuresObject);
  }, [features, setValue]);

  // Function to handle AI model type selection
  const handleAIModelTypeChange = (value: string) => {
    setValue("modelType", value);
  };

  const addFeature = () => {
    setFeatures([...features, { key: `feature${features.length + 1}`, value: "" }]);
  };

  const removeFeature = (index: number) => {
    setFeatures(features.filter((_, i) => i !== index));
  };

  const updateFeature = (index: number, value: string) => {
    const newFeatures = [...features];
    newFeatures[index].value = value;
    setFeatures(newFeatures);
  };

  // Add onSubmit handler to transform features before submission
  const handleFormSubmit = async (data: PackageFormValues) => {
    // Transform features array to object
    const featuresObject = features.reduce((acc, feature) => {
      if (feature.value.trim()) { // Only include non-empty features
        acc[feature.key] = feature.value;
      }
      return acc;
    }, {} as Record<string, string>);

    // Submit the form with transformed features and default image model
    await onSubmit({
      ...data,
      features: featuresObject,
      imageModelType: 'flux-dev',
      imageModelURL: FLUX_DEV_URL
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="bg-gradient-to-r from-amber-500 to-amber-600 text-white p-6 rounded-t-lg -mt-4 -mx-4 mb-4">
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            {editingPackage ? (
              <>
                <Edit className="w-6 h-6" />
                Edit Package
              </>
            ) : (
              <>
                <PlusCircle className="w-6 h-6" />
                Create New Package
              </>
            )}
          </DialogTitle>
          <p className="text-amber-100 mt-1 text-sm">
            {editingPackage 
              ? "Modify the package details below" 
              : "Fill in the details to create a new subscription package"}
          </p>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6 px-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Package Name</Label>
              <Input
                {...register("name")}
                placeholder="e.g. Premium Package"
                className={`${errors.name ? "border-red-300 ring-red-200" : "focus:border-amber-500 focus:ring-amber-200"} transition-all duration-200`}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <span className="w-1 h-1 rounded-full bg-red-500"/>
                  {errors.name.message}
                </p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Price</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                <Input
                  {...register("price", { valueAsNumber: true })}
                  type="number"
                  step="0.01"
                  placeholder="e.g. 49.99"
                  className={`pl-7 ${errors.price ? "border-red-300 ring-red-200" : "focus:border-amber-500 focus:ring-amber-200"} transition-all duration-200`}
                />
              </div>
              {errors.price && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <span className="w-1 h-1 rounded-full bg-red-500"/>
                  {errors.price.message}
                </p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Duration (days)</Label>
              <Input
                {...register("durationDays", { valueAsNumber: true })}
                type="number"
                placeholder="e.g. 30"
                className={`${errors.durationDays ? "border-red-300 ring-red-200" : "focus:border-amber-500 focus:ring-amber-200"} transition-all duration-200`}
              />
              {errors.durationDays && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <span className="w-1 h-1 rounded-full bg-red-500"/>
                  {errors.durationDays.message}
                </p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">GPT Credits</Label>
              <Input
                {...register("tokenLimit", { valueAsNumber: true })}
                type="number"
                placeholder="e.g. 500"
                className={`${errors.tokenLimit ? "border-red-300 ring-red-200" : "focus:border-amber-500 focus:ring-amber-200"} transition-all duration-200`}
              />
              {errors.tokenLimit && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <span className="w-1 h-1 rounded-full bg-red-500"/>
                  {errors.tokenLimit.message}
                </p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Image Credits</Label>
              <Input
                {...register("imageLimit", { valueAsNumber: true })}
                type="number"
                placeholder="e.g. 50"
                className={`${errors.imageLimit ? "border-red-300 ring-red-200" : "focus:border-amber-500 focus:ring-amber-200"} transition-all duration-200`}
              />
              {errors.imageLimit && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <span className="w-1 h-1 rounded-full bg-red-500"/>
                  {errors.imageLimit.message}
                </p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">GPT Model</Label>
              <select
                {...register("modelType")}
                onChange={(e) => handleAIModelTypeChange(e.target.value)}
                className={`w-full h-10 px-3 rounded-md border bg-white ${
                  errors.modelType 
                    ? "border-red-300 ring-1 ring-red-200" 
                    : "border-gray-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-200"
                } transition-all duration-200`}
              >
                <option value="">Select AI Model</option>
                {AI_MODEL_OPTIONS.map((model) => (
                  <option key={model.value} value={model.value}>
                    {model.label}
                  </option>
                ))}
              </select>
              {errors.modelType && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <span className="w-1 h-1 rounded-full bg-red-500"/>
                  {errors.modelType.message}
                </p>
              )}
            </div>
            
            <div className="flex items-center space-x-3 bg-amber-50/50 p-3 rounded-lg border border-amber-100">
              <Controller
                name="isActive"
                control={control}
                render={({ field }) => (
                  <Switch 
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className="data-[state=checked]:bg-amber-500"
                  />
                )}
              />
              <div>
                <Label className="text-sm font-medium text-gray-700">Package Status</Label>
                <p className="text-xs text-gray-500">Toggle to set package availability</p>
              </div>
            </div>

            <div className="flex items-center space-x-3 bg-amber-50/50 p-3 rounded-lg border border-amber-100">
              <Controller
                name="isFree"
                control={control}
                render={({ field }) => (
                  <Switch 
                    checked={field.value}
                    onCheckedChange={(checked) => {
                      field.onChange(checked);
                      if (checked) {
                        setValue("price", 0);
                      }
                    }}
                    className="data-[state=checked]:bg-amber-500"
                  />
                )}
              />
              <div>
                <Label className="text-sm font-medium text-gray-700">Free Package</Label>
                <p className="text-xs text-gray-500">Toggle to make this a free package</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Description</Label>
            <Textarea
              {...register("description")}
              placeholder="Describe what this package offers..."
              className={`min-h-[100px] ${
                errors.description 
                  ? "border-red-300 ring-red-200" 
                  : "focus:border-amber-500 focus:ring-amber-200"
              } transition-all duration-200`}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-red-500"/>
                {errors.description.message}
              </p>
            )}
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <Label className="text-sm font-medium text-gray-700">Package Features</Label>
                <p className="text-xs text-gray-500">Add key features of this package</p>
              </div>
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={addFeature}
                className="text-amber-600 border-amber-200 hover:bg-amber-50 transition-colors duration-200"
              >
                <PlusCircle className="h-4 w-4 mr-1" />
                Add Feature
              </Button>
            </div>
            
            <div className="space-y-3">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Input
                    value={feature.value}
                    onChange={(e) => updateFeature(index, e.target.value)}
                    placeholder={`e.g. Access to premium features`}
                    className="flex-1 focus:border-amber-500 focus:ring-amber-200 transition-all duration-200"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeFeature(index)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors duration-200"
                    disabled={features.length === 1}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
          
          <DialogFooter className="gap-2 sm:gap-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              className="border-gray-200 hover:bg-gray-50 transition-colors duration-200"
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 transition-all duration-200 min-w-[100px]"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {editingPackage ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                <>
                  {editingPackage ? 'Update Package' : 'Create Package'}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}; 