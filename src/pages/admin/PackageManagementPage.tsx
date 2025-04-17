import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import { Loader2, PlusCircle, Edit,  X, Check, Package, Shield, Sparkles, Zap, ChevronDown, Search } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useUserMeQuery } from '@/api/userApi';
import { useGetSubscriptionPackagesQuery, useCreateSubscriptionPackageMutation, useDeleteSubscriptionPackageMutation, useUpdateSubscriptionPackageMutation, CreatePackageRequest, SubscriptionPackage } from '@/api/subscriptionApi';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/context/ToastContext';
import { ToastType } from '@/constant';
import { Badge } from '@/components/ui/badge';
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import './PackageManager.css';

// Schema for package validation
const packageSchema = z.object({
  name: z.string().min(3, { message: "Package name must be at least 3 characters" }),
  description: z.string().min(10, { message: "Description not empty" }).nullable(),
  price: z.number().positive({ message: "Price must be positive" }),
  durationDays: z.number().int().positive({ message: "Duration must be a positive integer" }),
  tokenLimit: z.number().int().positive({ message: "Token limit must be a positive integer" }),
  imageLimit: z.number().int().positive({ message: "Image limit must be a positive integer" }),
  modelType: z.string().min(3, { message: "Model type must be specified" }),
  imageModelType: z.string().min(3, { message: "Image model type must be specified" }),
  imageModelURL: z.string().url({ message: "Must be a valid URL" }).optional().or(z.literal('')),
  isActive: z.boolean(),
  features: z.record(z.string(), z.string()).optional(),
});

type PackageFormValues = z.infer<typeof packageSchema>;

const PackageManagementPage = () => {
  const { addToast } = useToast();
  const navigate = useNavigate();
  const { data: user, isLoading: userLoading } = useUserMeQuery();
  const { data: packages, isLoading: packagesLoading, refetch } = useGetSubscriptionPackagesQuery({includeInactive:true}as any );
  const [createPackage, { isLoading: isCreating }] = useCreateSubscriptionPackageMutation();
 const [updatePackage, { isLoading: isUpdating }] = useUpdateSubscriptionPackageMutation();
  const [editingPackage, setEditingPackage] = useState<SubscriptionPackage | null>(null);
  
  const [features, setFeatures] = useState<{ key: string; value: string }[]>([
    { key: "feature1", value: "" }
  ]);

  // Add filter states for package searching
  const [searchTerms, setSearchTerms] = useState({
    name: '',
    price: '',
    status: '',
    modelType: '',
    imageModelType: '',
    feature: ''
  });
  
  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<PackageFormValues>({
    resolver: zodResolver(packageSchema),
    defaultValues: {
      isActive: true,
      features: {},
    }
  });

  // Filter packages based on search criteria
  const filteredPackages = useMemo(() => {
    if (!packages) return [];
    
    return packages.filter(pkg => {
      const pkgName = (pkg.name || '').toLowerCase();
      const pkgPrice = pkg.price?.toString() || '';
      const pkgStatus = pkg.isActive ? 'active' : 'inactive';
      const pkgModelType = (pkg.modelType || '').toLowerCase();
      const pkgImageModelType = (pkg.imageModelType || '').toLowerCase();
      
      // Check if any feature matches the feature search term
      const hasMatchingFeature = searchTerms.feature ? 
        Object.values(pkg.features || {}).some(feature => 
          feature.toLowerCase().includes(searchTerms.feature.toLowerCase())
        ) : true;
      
      return (
        (searchTerms.name === '' || pkgName.includes(searchTerms.name.toLowerCase())) &&
        (searchTerms.price === '' || pkgPrice.includes(searchTerms.price)) &&
        (searchTerms.status === '' || pkgStatus === searchTerms.status.toLowerCase()) &&
        (searchTerms.modelType === '' || pkgModelType.includes(searchTerms.modelType.toLowerCase())) &&
        (searchTerms.imageModelType === '' || pkgImageModelType.includes(searchTerms.imageModelType.toLowerCase())) &&
        (searchTerms.feature === '' || hasMatchingFeature)
      );
    });
  }, [packages, searchTerms]);

  // Handle search input change
  const handleSearchChange = (field: keyof typeof searchTerms, value: string) => {
    setSearchTerms(prev => ({ ...prev, [field]: value }));
  };
  
  // Clear all filters
  const clearAllFilters = () => {
    setSearchTerms({
      name: '',
      price: '',
      status: '',
      modelType: '',
      imageModelType: '',
      feature: ''
    });
  };

  // Redirect non-admin users
  if (!userLoading && user?.role !== 'admin') {
    navigate('/home');
    return null;
  }

  const onSubmit = async (data: PackageFormValues) => {
    // Build features object from array
    const featureObj: Record<string, string> = {};
    features.forEach(feat => {
      if (feat.value.trim()) {
        featureObj[feat.key] = feat.value;
      }
    });
    
    data.features = featureObj;
    
    try {
      if (editingPackage) {
        // Update existing package
        await updatePackage({ id: editingPackage.id, payload: data as CreatePackageRequest }).unwrap();
        addToast('Package updated successfully!', ToastType.SUCCESS);
        
        setEditingPackage(null);
      } else {
        // Create new package
        await createPackage(data as CreatePackageRequest).unwrap();
        addToast('Package created successfully!', ToastType.SUCCESS);
      }
      refetch();
      reset();
      setFeatures([{ key: "feature1", value: "" }]);
    } catch (error) {
      addToast(`Failed to ${editingPackage ? 'update' : 'create'} package`, ToastType.ERROR);
      console.error(error);
    }
  };

  // Function to handle edit button click
  const handleEditPackage = (pkg: SubscriptionPackage) => {
    setEditingPackage(pkg);
    
    // Set form values
    setValue("name", pkg.name);
    setValue("description", pkg.description);
    setValue("price", parseFloat(pkg.price));
    setValue("durationDays", pkg.durationDays);
    setValue("tokenLimit", pkg.tokenLimit);
    setValue("imageLimit", pkg.imageLimit);
    setValue("modelType", pkg.modelType);
    setValue("imageModelType", pkg.imageModelType);
    setValue("imageModelURL", pkg.imageModelURL || '');
    setValue("isActive", pkg.isActive);
    
    // Set features
    const featureArray = Object.entries(pkg.features || {}).map(([key, value], index) => ({
      key: key,
      value: value
    }));
    
    if (featureArray.length > 0) {
      setFeatures(featureArray);
    } else {
      setFeatures([{ key: "feature1", value: "" }]);
    }
    
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  // Function to cancel editing
  const cancelEdit = () => {
    setEditingPackage(null);
    reset();
    setFeatures([{ key: "feature1", value: "" }]);
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

  // Get feature icon based on text content
  const getFeatureIcon = (feature: string) => {
    if (feature.toLowerCase().includes('premium') || feature.toLowerCase().includes('advanced')) 
      return <Sparkles className="h-4 w-4 text-amber-500 flex-shrink-0" />;
    if (feature.toLowerCase().includes('priority') || feature.toLowerCase().includes('fast')) 
      return <Zap className="h-4 w-4 text-amber-500 flex-shrink-0" />;
    if (feature.toLowerCase().includes('support')) 
      return <Shield className="h-4 w-4 text-amber-500 flex-shrink-0" />;
    return <Check className="h-4 w-4 text-green-500 flex-shrink-0" />;
  };

  if (userLoading || packagesLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-[80vh]">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-amber-500 mx-auto mb-4" />
            <p className="text-gray-600 animate-pulse">Loading subscription packages...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container overflow-auto max-w-7xl mx-auto py-10 px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Enhanced Header with gradient background */}
          <div className="bg-gradient-to-r from-amber-50 to-amber-100/50 p-6 rounded-xl shadow-sm mb-8">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 flex items-center">
                  <Package className="w-8 h-8 mr-3 text-amber-500" />
                  Subscription Package Management
                </h1>
                <p className="text-sm text-gray-600">
                  Create and manage subscription plans for your users
                </p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Create Package Form - Takes 2 columns on large screens */}
            <div className="lg:col-span-2">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1, duration: 0.4 }}
                className="bg-white shadow-lg rounded-xl p-6 border border-gray-100 sticky top-20"
              >
                <h2 className="text-xl font-semibold text-amber-800 mb-6 flex items-center">
                  {editingPackage ? (
                    <>
                      <Edit className="w-5 h-5 mr-2 text-amber-600" />
                      Edit Package: {editingPackage.name}
                    </>
                  ) : (
                    <>
                      <PlusCircle className="w-5 h-5 mr-2 text-amber-600" />
                      Create New Package
                    </>
                  )}
                </h2>
                
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Package Name</label>
                      <Input
                        {...register("name")}
                        placeholder="e.g. Premium Package"
                        className={errors.name ? "border-red-300 focus:ring-red-500" : "focus:ring-amber-500"}
                      />
                      {errors.name && (
                        <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                      <Input
                        {...register("price", { valueAsNumber: true })}
                        type="number"
                        step="0.01"
                        placeholder="e.g. 49.99"
                        className={errors.price ? "border-red-300 focus:ring-red-500" : "focus:ring-amber-500"}
                      />
                      {errors.price && (
                        <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Duration (days)</label>
                      <Input
                        {...register("durationDays", { valueAsNumber: true })}
                        type="number"
                        placeholder="e.g. 30"
                        className={errors.durationDays ? "border-red-300 focus:ring-red-500" : "focus:ring-amber-500"}
                      />
                      {errors.durationDays && (
                        <p className="mt-1 text-sm text-red-600">{errors.durationDays.message}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Token Limit</label>
                      <Input
                        {...register("tokenLimit", { valueAsNumber: true })}
                        type="number"
                        placeholder="e.g. 500"
                        className={errors.tokenLimit ? "border-red-300 focus:ring-red-500" : "focus:ring-amber-500"}
                      />
                      {errors.tokenLimit && (
                        <p className="mt-1 text-sm text-red-600">{errors.tokenLimit.message}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Image Limit</label>
                      <Input
                        {...register("imageLimit", { valueAsNumber: true })}
                        type="number"
                        placeholder="e.g. 50"
                        className={errors.imageLimit ? "border-red-300 focus:ring-red-500" : "focus:ring-amber-500"}
                      />
                      {errors.imageLimit && (
                        <p className="mt-1 text-sm text-red-600">{errors.imageLimit.message}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">AI Model Type</label>
                      <Input
                        {...register("modelType")}
                        placeholder="e.g. Advanced AI Model"
                        className={errors.modelType ? "border-red-300 focus:ring-red-500" : "focus:ring-amber-500"}
                      />
                      {errors.modelType && (
                        <p className="mt-1 text-sm text-red-600">{errors.modelType.message}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Image Model Type</label>
                      <Input
                        {...register("imageModelType")}
                        placeholder="e.g. Premium Image Model"
                        className={errors.imageModelType ? "border-red-300 focus:ring-red-500" : "focus:ring-amber-500"}
                      />
                      {errors.imageModelType && (
                        <p className="mt-1 text-sm text-red-600">{errors.imageModelType.message}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Image Model URL</label>
                      <Input
                        {...register("imageModelURL")}
                        placeholder="e.g. https://api.example.com/image-model"
                        className={errors.imageModelURL ? "border-red-300 focus:ring-red-500" : "focus:ring-amber-500"}
                      />
                      {errors.imageModelURL && (
                        <p className="mt-1 text-sm text-red-600">{errors.imageModelURL.message}</p>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch 
                        {...register("isActive")} 
                        defaultChecked
                        onCheckedChange={(checked) => setValue("isActive", checked)}
                        className="data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500"
                      />
                      <label className="text-sm font-medium text-gray-700">Active Package</label>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <Textarea
                      {...register("description")}
                      placeholder="Describe what this package offers..."
                      className={`min-h-[100px] resize-none ${errors.description ? "border-red-300 focus:ring-red-500" : "focus:ring-amber-500"}`}
                    />
                    {errors.description && (
                      <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <label className="block text-sm font-medium text-gray-700">Package Features</label>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm" 
                        onClick={addFeature}
                        className="text-amber-600 border-amber-200 hover:bg-amber-50"
                      >
                        <PlusCircle className="h-4 w-4 mr-1" />
                        Add Feature
                      </Button>
                    </div>
                    
                    <div className="space-y-3 bg-gray-50 p-4 rounded-lg border border-gray-100">
                      {features.map((feature, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <Input
                            value={feature.value}
                            onChange={(e) => updateFeature(index, e.target.value)}
                            placeholder={`e.g. Access to premium features`}
                            className="flex-1 bg-white focus:ring-amber-500"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeFeature(index)}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            disabled={features.length === 1}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    {editingPackage && (
                      <Button 
                        type="button"
                        variant="outline"
                        className="flex-1 border-gray-300"
                        onClick={cancelEdit}
                      >
                        Cancel
                      </Button>
                    )}
                    <Button 
                      type="submit"
                      className={`${editingPackage ? 'flex-1' : 'w-full'} bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-md transition-all duration-300`}
                      disabled={isCreating || isUpdating}
                    >
                      {isCreating || isUpdating ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {editingPackage ? 'Updating...' : 'Creating...'}
                        </>
                      ) : (
                        <>
                          {editingPackage ? (
                            <>
                              <Check className="mr-2 h-4 w-4" />
                              Update Package
                            </>
                          ) : (
                            <>
                              <PlusCircle className="mr-2 h-4 w-4" />
                              Create Package
                            </>
                          )}
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </motion.div>
            </div>
            
            {/* Package List - Takes 3 columns on large screens */}
            <div className="lg:col-span-3">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.4 }}
              >
                <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-100 mb-6">
                  <h2 className="text-xl font-semibold text-amber-800 mb-4 flex items-center">
                    <Package className="w-5 h-5 mr-2 text-amber-600" />
                    Existing Packages
                  </h2>
                  
                  <p className="text-sm text-gray-600 mb-4">
                    Manage your subscription packages. Active packages will be displayed to users.
                  </p>
                  
                  {/* Add search/filter panel */}
                  <div className="bg-gradient-to-r from-amber-50/50 to-white border-b border-gray-200  rounded-lg">
                    {/* Advanced Filter Pills */}
                    <div className="mb-4">
                      <div className="flex items-center mb-2">
                        <span className="text-xs font-medium text-gray-500 mr-2">Package Filters:</span>
                        <button 
                          className="text-xs text-amber-600 hover:text-amber-800 font-medium flex items-center"
                          onClick={clearAllFilters}
                        >
                          Clear All
                        </button>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {/* Package Name Filter */}
                        <div className="relative group hover:z-20">
                          <div className={`px-3 py-1.5 text-sm rounded-full border flex items-center gap-1 cursor-pointer transition-all ${
                            searchTerms.name 
                              ? 'bg-amber-50 border-amber-200 text-amber-800' 
                              : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                          }`}>
                            <Package className="w-3.5 h-3.5 mr-1" />
                            {searchTerms.name ? `Name: ${searchTerms.name}` : 'Package Name'}
                            <ChevronDown className="w-3.5 h-3.5 opacity-50" />
                          </div>
                          
                          <div className="absolute left-0 top-full mt-1 w-64 bg-white rounded-lg shadow-lg border border-gray-200 p-3 z-10 
                                          invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-300 
                                          cursor-default transform translate-y-1 group-hover:translate-y-0">
                            <div className="absolute -top-3 left-0 right-0 h-3 bg-transparent"></div>
                            
                            <label className="text-xs font-medium text-gray-500 mb-1 block">Search by Package Name</label>
                            <div className="relative">
                              <Search className="w-4 h-4 absolute left-2.5 top-2.5 text-gray-400" />
                              <input
                                type="text"
                                className="pl-8 w-full h-9 text-sm rounded-md border-gray-200 bg-white shadow-sm focus:border-amber-500 focus:ring-amber-500"
                                placeholder="Search packages..."
                                value={searchTerms.name}
                                onChange={(e) => handleSearchChange('name', e.target.value)}
                              />
                            </div>
                          </div>
                        </div>
                        
                        {/* Price Filter */}
                        <div className="relative group hover:z-20">
                          <div className={`px-3 py-1.5 text-sm rounded-full border flex items-center gap-1 cursor-pointer transition-all ${
                            searchTerms.price 
                              ? 'bg-blue-50 border-blue-200 text-blue-800' 
                              : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                          }`}>
                            <span className="font-mono">$</span>
                            {searchTerms.price ? `Price: ${searchTerms.price}` : 'Price'}
                            <ChevronDown className="w-3.5 h-3.5 opacity-50" />
                          </div>
                          
                          <div className="absolute left-0 top-full mt-1 w-64 bg-white rounded-lg shadow-lg border border-gray-200 p-3 z-10 
                                          invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-300
                                          cursor-default transform translate-y-1 group-hover:translate-y-0">
                            <div className="absolute -top-3 left-0 right-0 h-3 bg-transparent"></div>
                            
                            <label className="text-xs font-medium text-gray-500 mb-1 block">Price Range</label>
                            <div className="space-y-2">
                              <button 
                                className="w-full text-left px-3 py-2 rounded bg-gray-50 hover:bg-blue-50 text-sm transition-colors"
                                onClick={() => handleSearchChange('price', '9.99')}
                              >
                                9.99
                              </button>
                              <button 
                                className="w-full text-left px-3 py-2 rounded bg-gray-50 hover:bg-blue-50 text-sm transition-colors"
                                onClick={() => handleSearchChange('price', '19.99')}
                              >
                                19.99
                              </button>
                              <div className="relative">
                                <Search className="w-4 h-4 absolute left-2.5 top-2.5 text-gray-400" />
                                <input
                                  type="text"
                                  className="pl-8 w-full h-9 text-sm rounded-md border-gray-200 bg-white shadow-sm focus:border-amber-500 focus:ring-amber-500"
                                  placeholder="Enter price..."
                                  value={searchTerms.price}
                                  onChange={(e) => handleSearchChange('price', e.target.value)}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Status Filter */}
                        <div className="relative group hover:z-20">
                          <div className={`px-3 py-1.5 text-sm rounded-full border flex items-center gap-1 cursor-pointer transition-all ${
                            searchTerms.status 
                              ? searchTerms.status === 'active' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-gray-100 border-gray-300 text-gray-800'
                              : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                          }`}>
                            <span className={`w-2 h-2 rounded-full ${
                              searchTerms.status === 'active' 
                                ? 'bg-green-500' 
                                : searchTerms.status === 'inactive' 
                                  ? 'bg-gray-400' 
                                  : 'bg-gray-300'
                            }`}></span>
                            {searchTerms.status ? `Status: ${searchTerms.status}` : 'Status'}
                            <ChevronDown className="w-3.5 h-3.5 opacity-50" />
                          </div>
                          
                          <div className="absolute left-0 top-full mt-1 w-64 bg-white rounded-lg shadow-lg border border-gray-200 p-3 z-10 
                                          invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-500
                                          cursor-default transform translate-y-1 group-hover:translate-y-0">
                            <div className="absolute -top-3 left-0 right-0 h-3 bg-transparent"></div>
                            
                            <label className="text-xs font-medium text-gray-500 mb-1 block">Package Status</label>
                            <div className="space-y-2">
                              <button 
                                className="w-full text-left px-3 py-2 rounded flex items-center bg-gray-50 hover:bg-green-50 text-sm transition-colors"
                                onClick={() => handleSearchChange('status', 'active')}
                              >
                                <span className="w-3 h-3 rounded-full bg-green-500 mr-2"></span>
                                Active Packages
                              </button>
                              <button 
                                className="w-full text-left px-3 py-2 rounded flex items-center bg-gray-50 hover:bg-red-50 text-sm transition-colors"
                                onClick={() => handleSearchChange('status', 'inactive')}
                              >
                                <span className="w-3 h-3 rounded-full bg-gray-400 mr-2"></span>
                                Inactive Packages
                              </button>
                              <button 
                                className="w-full text-left px-3 py-2 rounded flex items-center bg-gray-50 hover:bg-amber-50 text-sm transition-colors"
                                onClick={() => handleSearchChange('status', '')}
                              >
                                <span className="w-3 h-3 rounded-full bg-gray-300 mr-2"></span>
                                All Packages
                              </button>
                            </div>
                          </div>
                        </div>
                        
                        {/* AI Model Type Filter */}
                        <div className="relative group hover:z-20">
                          <div className={`px-3 py-1.5 text-sm rounded-full border flex items-center gap-1 cursor-pointer transition-all ${
                            searchTerms.modelType 
                              ? 'bg-purple-50 border-purple-200 text-purple-800' 
                              : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                          }`}>
                            <Sparkles className="w-3.5 h-3.5 mr-1" />
                            {searchTerms.modelType ? `AI Model: ${searchTerms.modelType}` : 'AI Model'}
                            <ChevronDown className="w-3.5 h-3.5 opacity-50" />
                          </div>
                          
                          <div className="absolute left-0 top-full mt-1 w-64 bg-white rounded-lg shadow-lg border border-gray-200 p-3 z-10 
                                          invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-300
                                          cursor-default transform translate-y-1 group-hover:translate-y-0">
                            <div className="absolute -top-3 left-0 right-0 h-3 bg-transparent"></div>
                            
                            <label className="text-xs font-medium text-gray-500 mb-1 block">AI Model Type</label>
                            <div className="relative">
                              <Search className="w-4 h-4 absolute left-2.5 top-2.5 text-gray-400" />
                              <input
                                type="text"
                                className="pl-8 w-full h-9 text-sm rounded-md border-gray-200 bg-white shadow-sm focus:border-amber-500 focus:ring-amber-500"
                                placeholder="Search AI models..."
                                value={searchTerms.modelType}
                                onChange={(e) => handleSearchChange('modelType', e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                                onFocus={(e) => e.stopPropagation()}
                              />
                            </div>
                          </div>
                        </div>
                        
                        {/* Image Model Type Filter - New */}
                        <div className="relative group hover:z-20">
                          <div className={`px-3 py-1.5 text-sm rounded-full border flex items-center gap-1 cursor-pointer transition-all ${
                            searchTerms.imageModelType 
                              ? 'bg-rose-50 border-rose-200 text-rose-800' 
                              : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                          }`}>
                            <Sparkles className="w-3.5 h-3.5 mr-1" />
                            {searchTerms.imageModelType ? `Image Model: ${searchTerms.imageModelType}` : 'Image Model'}
                            <ChevronDown className="w-3.5 h-3.5 opacity-50" />
                          </div>
                          
                          <div className="absolute left-0 top-full mt-1 w-64 bg-white rounded-lg shadow-lg border border-gray-200 p-3 z-10 
                                          invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-300
                                          cursor-default transform translate-y-1 group-hover:translate-y-0">
                            <div className="absolute -top-3 left-0 right-0 h-3 bg-transparent"></div>
                            
                            <label className="text-xs font-medium text-gray-500 mb-1 block">Image Model Type</label>
                            <div className="relative">
                              <Search className="w-4 h-4 absolute left-2.5 top-2.5 text-gray-400" />
                              <input
                                type="text"
                                className="pl-8 w-full h-9 text-sm rounded-md border-gray-200 bg-white shadow-sm focus:border-amber-500 focus:ring-amber-500"
                                placeholder="Search image models..."
                                value={searchTerms.imageModelType}
                                onChange={(e) => handleSearchChange('imageModelType', e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                                onFocus={(e) => e.stopPropagation()}
                              />
                            </div>
                          </div>
                        </div>
                        
                        {/* Feature Filter */}
                        <div className="relative group hover:z-20">
                          <div className={`px-3 py-1.5 text-sm rounded-full border flex items-center gap-1 cursor-pointer transition-all ${
                            searchTerms.feature 
                              ? 'bg-indigo-50 border-indigo-200 text-indigo-800' 
                              : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                          }`}>
                            <Check className="w-3.5 h-3.5 mr-1" />
                            {searchTerms.feature ? `Feature: ${searchTerms.feature}` : 'Features'}
                            <ChevronDown className="w-3.5 h-3.5 opacity-50" />
                          </div>
                          
                          <div className="absolute left-0 top-full mt-1 w-64 bg-white rounded-lg shadow-lg border border-gray-200 p-3 z-10 
                                          invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-300
                                          cursor-default transform translate-y-1 group-hover:translate-y-0">
                            <div className="absolute -top-3 left-0 right-0 h-3 bg-transparent"></div>
                            
                            <label className="text-xs font-medium text-gray-500 mb-1 block">Search by Features</label>
                            <div className="relative">
                              <Search className="w-4 h-4 absolute left-2.5 top-2.5 text-gray-400" />
                              <input
                                type="text"
                                className="pl-8 w-full h-9 text-sm rounded-md border-gray-200 bg-white shadow-sm focus:border-amber-500 focus:ring-amber-500"
                                placeholder="Search for features..."
                                value={searchTerms.feature}
                                onChange={(e) => handleSearchChange('feature', e.target.value)}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {filteredPackages?.length === 0 ? (
                    <div className="text-center py-10 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                      <Package className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                      <p className="text-gray-500 mb-2">No packages found</p>
                      <p className="text-sm text-gray-400">
                        {packages?.length ? 'Try adjusting your search filters' : 'Create your first package using the form'}
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Slider
                        infinite={filteredPackages.length > 1}
                        speed={500}
                        slidesToShow={1}
                        slidesToScroll={1}
                        autoplay={true}
                        autoplaySpeed={1500}
                        pauseOnHover={true}
                        responsive={[
                          {
                            breakpoint: 1024,
                            settings: {
                              slidesToShow: 2,
                              slidesToScroll: 1,
                            }
                          },
                          {
                            breakpoint: 768,
                            settings: {
                              slidesToShow: 1,
                              slidesToScroll: 1,
                            }
                          }
                        ]}
                        // className="package-slider"
                      >
                        {filteredPackages?.map((pkg) => (
                          <div key={pkg.id} className="px-2">
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              whileHover={{ y: -4, boxShadow: "0 12px 24px -10px rgba(0, 0, 0, 0.1)" }}
                              transition={{ duration: 0.2 }}
                              className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100 h-full"
                            >
                              <div className="relative p-5 border-b bg-gradient-to-r from-amber-50 to-amber-50/30">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <h3 className="font-semibold text-lg text-amber-800">{pkg.name}</h3>
                                    <p className="text-sm text-gray-600">${parseFloat(pkg.price).toFixed(2)} / {pkg.durationDays} days</p>
                                  </div>
                                  <div className="flex space-x-1">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 text-amber-600 hover:text-amber-800 hover:bg-amber-50"
                                      onClick={() => handleEditPackage(pkg)}
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                                
                                <Badge 
                                  variant={pkg.isActive ? "default" : "outline"}
                                  className={`absolute top-3 left-1 translate-x-2 -translate-y-2 ${
                                    pkg.isActive 
                                      ? 'bg-green-100 text-green-800 hover:bg-green-100'
                                      : 'text-gray-500'
                                  }`}
                                >
                                  {pkg.isActive ? "Active" : "Inactive"}
                                </Badge>
                              </div>
                              
                              <div className="p-5">
                                <div className="mb-4">
                                  <p className="text-sm text-gray-600 line-clamp-2">{pkg.description}</p>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-2 mb-4">
                                  <div className="bg-amber-50 rounded-md p-2 text-center">
                                    <p className="text-xs text-gray-500">Token Limit</p>
                                    <p className="font-medium text-amber-700">{pkg.tokenLimit.toLocaleString()}</p>
                                  </div>
                                  <div className="bg-amber-50 rounded-md p-2 text-center">
                                    <p className="text-xs text-gray-500">Image Limit</p>
                                    <p className="font-medium text-amber-700">{pkg.imageLimit.toLocaleString()}</p>
                                  </div>
                                  <div className="bg-amber-50 rounded-md p-2 text-center">
                                    <p className="text-xs text-gray-500">AI Model</p>
                                    <p className="font-medium text-amber-700 truncate" title={pkg.modelType}>{pkg.modelType}</p>
                                  </div>
                                  <div className="bg-amber-50 rounded-md p-2 text-center">
                                    <p className="text-xs text-gray-500">Image Model</p>
                                    <p className="font-medium text-amber-700 truncate" title={pkg.imageModelType}>{pkg.imageModelType}</p>
                                  </div>
                                  {pkg.imageModelURL && (
                                    <div className="bg-amber-50 rounded-md p-2 text-center col-span-2">
                                      <p className="text-xs text-gray-500">Image Model URL</p>
                                      <p className="font-medium text-amber-700 truncate" title={pkg.imageModelURL}>
                                        {pkg.imageModelURL}
                                      </p>
                                    </div>
                                  )}
                                </div>
                                
                                <div className="mt-4">
                                  <h4 className="text-xs font-medium text-gray-500 mb-3">Features</h4>
                                  <ul className="space-y-2 h-52 overflow-auto">
                                    {Object.values(pkg.features || {}).map((feature, index) => (
                                      <li key={index} className="flex items-start gap-2 bg-gray-50 p-2 rounded-md">
                                        {getFeatureIcon(feature)}
                                        <span className="text-xs text-gray-700">{feature}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            </motion.div>
                          </div>
                        ))}
                      </Slider>
                    </div>
                  )}
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="bg-amber-50 rounded-lg p-4 border border-amber-100"
              >
                <h3 className="text-sm font-medium text-amber-800 mb-2">Package Management Tips</h3>
                <ul className="text-sm text-amber-700 space-y-1 list-disc pl-5">
                  <li>Define clear and competitive pricing tiers</li>
                  <li>Highlight premium features to increase conversion</li>
                  <li>Set appropriate token and image limits based on usage patterns</li>
                  <li>Use descriptive package names that communicate value</li>
                </ul>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
};

export default PackageManagementPage; 