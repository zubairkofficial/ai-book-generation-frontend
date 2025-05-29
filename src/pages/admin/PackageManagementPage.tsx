import { useState, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Loader2, PlusCircle, Edit, Package, Shield, Sparkles, Zap, Check, X, Star, Crown } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  useGetSubscriptionPackagesQuery, 
  useCreateSubscriptionPackageMutation, 
  useUpdateSubscriptionPackageMutation, 
  CreatePackageRequest, 
  SubscriptionPackage 
} from '@/api/subscriptionApi';
import { useToast } from '@/context/ToastContext';
import { ToastType } from '@/constant';
import { PackageFormModal } from '@/components/admin/PackageFormModal';
import { cn } from '@/lib/utils';

// Constants
const SEARCH_FIELDS = {
  NAME: 'name',
  PRICE: 'price',
  STATUS: 'status',
  MODEL_TYPE: 'modelType',
  IMAGE_MODEL_TYPE: 'imageModelType',
  FEATURE: 'feature'
} as const;

interface SearchTerms {
  [SEARCH_FIELDS.NAME]: string;
  [SEARCH_FIELDS.PRICE]: string;
  [SEARCH_FIELDS.STATUS]: string;
  [SEARCH_FIELDS.MODEL_TYPE]: string;
  [SEARCH_FIELDS.IMAGE_MODEL_TYPE]: string;
  [SEARCH_FIELDS.FEATURE]: string;
}

// Base interface for common fields
interface BasePackage {
  name: string;
  price: number;
  modelType: string;
  durationDays: number;
  tokenLimit: number;
  imageLimit: number;
  imageModelURL: string;
  isActive: boolean;
  imageModelType: string;
}

// Form data interface
interface PackageFormData extends BasePackage {
  description: string | null;
  features?: Record<string, string>;
}

// Request data interface
interface PackageRequestData extends BasePackage {
  description?: string;
  features: Record<string, string>;
}

const PackageManagementPage = () => {
  const { addToast } = useToast();
  const { 
    data: packages, 
    isLoading: packagesLoading, 
    refetch 
  } = useGetSubscriptionPackagesQuery({ includeInactive: true });

  const [createPackage, { isLoading: isCreating }] = useCreateSubscriptionPackageMutation();
  const [updatePackage, { isLoading: isUpdating }] = useUpdateSubscriptionPackageMutation();
  const [editingPackage, setEditingPackage] = useState<SubscriptionPackage | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Search state with typed interface
  const [searchTerms, setSearchTerms] = useState<SearchTerms>({
    [SEARCH_FIELDS.NAME]: '',
    [SEARCH_FIELDS.PRICE]: '',
    [SEARCH_FIELDS.STATUS]: '',
    [SEARCH_FIELDS.MODEL_TYPE]: '',
    [SEARCH_FIELDS.IMAGE_MODEL_TYPE]: '',
    [SEARCH_FIELDS.FEATURE]: ''
  });

  // Memoized filter function
  const filterPackage = useCallback((pkg: SubscriptionPackage, terms: SearchTerms) => {
    const pkgName = (pkg.name || '').toLowerCase();
    const pkgPrice = pkg.price?.toString() || '';
    const pkgStatus = pkg.isActive ? 'active' : 'inactive';
    const pkgModelType = (pkg.modelType || '').toLowerCase();
    const pkgImageModelType = (pkg.imageModelType || '').toLowerCase();
    
    const hasMatchingFeature = terms.feature ? 
      Object.values(pkg.features || {}).some(feature => 
        feature.toLowerCase().includes(terms.feature.toLowerCase())
      ) : true;
    
    return (
      (terms.name === '' || pkgName.includes(terms.name.toLowerCase())) &&
      (terms.price === '' || pkgPrice.includes(terms.price)) &&
      (terms.status === '' || pkgStatus === terms.status.toLowerCase()) &&
      (terms.modelType === '' || pkgModelType.includes(terms.modelType.toLowerCase())) &&
      (terms.imageModelType === '' || pkgImageModelType.includes(terms.imageModelType.toLowerCase())) &&
      (terms.feature === '' || hasMatchingFeature)
    );
  }, []);

  // Memoized filtered packages
  const filteredPackages = useMemo(() => 
    packages?.filter(pkg => filterPackage(pkg, searchTerms)) || [],
    [packages, searchTerms, filterPackage]
  );

  // Handlers
  const handleSubmit = useCallback(async (formData: PackageFormData) => {
    try {
      // Transform form data to match API request format
      const requestData: PackageRequestData = {
        ...formData,
        description: formData.description || undefined,
        features: formData.features || {},
        imageModelType: 'flux-dev'
      };

      if (editingPackage) {
        await updatePackage({ 
          id: editingPackage.id, 
          payload: requestData as CreatePackageRequest
        }).unwrap();
        addToast('Package updated successfully!', ToastType.SUCCESS);
        setEditingPackage(null);
      } else {
        await createPackage(requestData as CreatePackageRequest).unwrap();
        addToast('Package created successfully!', ToastType.SUCCESS);
      }
      refetch();
      setIsModalOpen(false);
    } catch (error) {
      addToast(`Failed to ${editingPackage ? 'update' : 'create'} package`, ToastType.ERROR);
      console.error('Package operation failed:', error);
    }
  }, [editingPackage, updatePackage, createPackage, addToast, refetch]);

  const handleEditPackage = useCallback((pkg: SubscriptionPackage) => {
    setEditingPackage(pkg);
    setIsModalOpen(true);
  }, []);

  const handleCreatePackage = useCallback(() => {
    setIsModalOpen(true);
    setEditingPackage(null);
  }, []);

  // Feature icon selector
  const getFeatureIcon = useCallback((feature: string) => {
    const lowerFeature = feature.toLowerCase();
    if (lowerFeature.includes('premium') || lowerFeature.includes('advanced')) 
      return <Sparkles className="h-4 w-4 text-amber-500 flex-shrink-0" />;
    if (lowerFeature.includes('priority') || lowerFeature.includes('fast')) 
      return <Zap className="h-4 w-4 text-amber-500 flex-shrink-0" />;
    if (lowerFeature.includes('support')) 
      return <Shield className="h-4 w-4 text-amber-500 flex-shrink-0" />;
    return <Check className="h-4 w-4 text-green-500 flex-shrink-0" />;
  }, []);

  if (packagesLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-[80vh]">
          <div className="text-center">
            <Loader2 className="h-14 w-14 animate-spin text-amber-500 mx-auto mb-4" />
            <p className="text-lg text-gray-600 animate-pulse">Loading subscription packages...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container max-w-7xl mx-auto py-10 px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
        >
          {/* Enhanced Header */}
          <div className="bg-gradient-to-r from-amber-50 via-amber-100/50 to-amber-50 p-8 rounded-2xl shadow-sm mb-8">
            <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between">
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 flex items-center gap-3">
                  <Package className="w-10 h-10 text-amber-500" />
                  Package Management
                </h1>
                <p className="text-lg text-gray-600 max-w-2xl">
                  Create and manage subscription plans to provide the perfect options for your users.
                </p>
              </div>
              <Button 
                onClick={handleCreatePackage}
                className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 shadow-lg hover:shadow-xl transition-all duration-300 text-lg px-6 py-6 h-auto"
              >
                <PlusCircle className="w-5 h-5 mr-2" />
                Create New Package
              </Button>
            </div>
          </div>

          {/* Package Form Modal */}
          <PackageFormModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSubmit={handleSubmit}
            editingPackage={editingPackage}
            isLoading={isCreating || isUpdating}
          />

          {/* Package Grid with animation stagger */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.1
                }
              }
            }}
          >
            {filteredPackages.map((pkg) => (
              <motion.div
                key={pkg.id}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 }
                }}
              >
                <PackageCard
                  package={pkg}
                  onEdit={handleEditPackage}
                  getFeatureIcon={getFeatureIcon}
                />
              </motion.div>
            ))}
          </motion.div>

          {/* Empty State */}
          {filteredPackages.length === 0 && !packagesLoading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16"
            >
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No Packages Found</h3>
              <p className="text-gray-500 mb-6">Get started by creating your first subscription package.</p>
              <Button
                onClick={handleCreatePackage}
                className="bg-amber-500 hover:bg-amber-600 transition-colors"
              >
                <PlusCircle className="w-5 h-5 mr-2" />
                Create Package
              </Button>
            </motion.div>
          )}
        </motion.div>
      </div>
    </Layout>
  );
};

// Separate Package Card Component for better organization
interface PackageCardProps {
  package: SubscriptionPackage;
  onEdit: (pkg: SubscriptionPackage) => void;
  getFeatureIcon: (feature: string) => JSX.Element;
}

const StatusBadge = ({ isActive }: { isActive: boolean }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className={cn(
      "absolute top-0 right-4 -translate-y-1/2 px-3 py-1 rounded-full",
      "text-white font-medium text-xs flex items-center gap-1.5",
      "shadow-lg backdrop-blur-sm border",
      isActive 
        ? "bg-gradient-to-r from-green-500/90 to-green-600/90 border-green-400/30 shadow-green-500/20"
        : "bg-gradient-to-r from-gray-500/90 to-gray-600/90 border-gray-400/30 shadow-gray-500/20"
    )}
  >
    <motion.div
      animate={{
        scale: [1, 1.2, 1],
        opacity: [0.4, 0, 0.4]
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }}
      className={cn(
        "absolute w-full h-full rounded-full opacity-40",
        isActive ? "bg-green-500" : "bg-gray-500"
      )}
    />
    <span className="flex items-center gap-1 relative z-10">
      {isActive ? (
        <>
          <Check className="w-3 h-3" />
          Active
        </>
      ) : (
        <>
          <X className="w-3 h-3" />
          Inactive
        </>
      )}
    </span>
  </motion.div>
);

const PackageCard = ({ package: pkg, onEdit, getFeatureIcon }: PackageCardProps) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    whileHover={{ y: -4, boxShadow: "0 12px 24px -10px rgba(0, 0, 0, 0.1)" }}
    transition={{ duration: 0.2 }}
    className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:border-amber-200 transition-all duration-300"
  >
    {/* Card Header */}
    <div className="relative p-6 border-b bg-gradient-to-r from-amber-50/80 to-amber-50/30">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-semibold text-xl text-amber-800 mb-1">{pkg.name}</h3>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-gray-900">
              ${parseFloat(pkg.price).toFixed(2)}
            </span>
            <span className="text-sm text-gray-600">/ {pkg.durationDays} days</span>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-200 text-amber-600 hover:text-amber-800 hover:bg-amber-50 rounded-full"
          onClick={() => onEdit(pkg)}
        >
          <Edit className="h-5 w-5" />
        </Button>
      </div>

      <StatusBadge isActive={pkg.isActive} />
    </div>

    {/* Card Content */}
    <div className="p-6">
      {/* Description */}
      <div className="mb-6">
        <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
          {pkg.description || 'No description available'}
        </p>
      </div>

      {/* Credits Info */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-gradient-to-br from-amber-50 to-amber-100/50 rounded-lg p-4 text-center transition-transform hover:scale-105 duration-200">
          <p className="text-xs text-gray-500 mb-1">GPT Credits</p>
          <p className="font-bold text-lg text-amber-700">{pkg.tokenLimit.toLocaleString()}</p>
        </div>
        <div className="bg-gradient-to-br from-amber-50 to-amber-100/50 rounded-lg p-4 text-center transition-transform hover:scale-105 duration-200">
          <p className="text-xs text-gray-500 mb-1">Image Credits</p>
          <p className="font-bold text-lg text-amber-700">{pkg.imageLimit.toLocaleString()}</p>
        </div>
      </div>

      {/* Features */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-amber-500" />
          Package Features
        </h4>
        <ul className="space-y-2">
          {Object.values(pkg.features || {}).map((feature, index) => (
            <motion.li
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-start gap-3 bg-gray-50 hover:bg-gray-100 p-3 rounded-lg transition-colors duration-200"
            >
              {getFeatureIcon(feature)}
              <span className="text-sm text-gray-700">{feature}</span>
            </motion.li>
          ))}
        </ul>
      </div>
    </div>
  </motion.div>
);

export default PackageManagementPage; 