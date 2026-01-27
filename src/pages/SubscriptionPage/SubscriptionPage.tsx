import { useEffect, useState } from 'react';
import { useGetSubscriptionPackagesQuery, useGetCurrentSubscriptionQuery, useSubscribeToPackageMutation, useUnsubscribeFromPackageMutation } from '@/api/subscriptionApi';
import { Button } from '@/components/ui/button';
import { Check, Loader2, Sparkles, Clock, Zap, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import Layout from '@/components/layout/Layout';
import { useToast } from '@/context/ToastContext';
import { ToastType } from '@/constant';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { useUserMeQuery } from '@/api/userApi';
import { useNavigate } from 'react-router-dom';
import { useGetTokenSettingsQuery } from '@/api/tokenSettingsApi';

const SubscriptionPage = () => {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const { addToast } = useToast();
  const [subscribeToPackage, { isLoading: isSubscribing }] = useSubscribeToPackageMutation();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showUnsubscribeDialog, setShowUnsubscribeDialog] = useState(false);
  const [selectedPackageId, setSelectedPackageId] = useState<number | null>(null);
  const [selectedPackageIdForUnsubscribe, setSelectedPackageIdForUnsubscribe] = useState<number | null>(null);
  const [unsubscribeFromPackage, { isLoading: isUnsubscribing }] = useUnsubscribeFromPackageMutation();
  const { data: userInfo, refetch: refetchUser } = useUserMeQuery();
  const { data: packages, isLoading: packagesLoading, error, refetch: refetchPackages } = useGetSubscriptionPackagesQuery({ includeInactive: false });
  const { data: currentSubscriptions, refetch: refetchSubscription } = useGetCurrentSubscriptionQuery();
  const [autoRenew, setAutoRenew] = useState(false);
  const navigate = useNavigate();
  const { data: tokenSettings } = useGetTokenSettingsQuery();

  // if (packagesLoading) {
  //   return (
  //     <Layout>
  //       <div className="flex flex-col items-center justify-center min-h-[80vh]">
  //         <Loader2 className="h-12 w-12 animate-spin text-amber-500 mb-4" />
  //         <p className="text-gray-500">Loading subscription plans...</p>
  //       </div>
  //     </Layout>
  //   );
  // }

  // if (error) {
  //   return (
  //     <Layout>
  //       <div className="flex flex-col items-center justify-center min-h-[80vh]">
  //         <div className="p-6 bg-red-50 rounded-lg max-w-md w-full text-center">
  //           <h3 className="text-lg font-medium text-red-800 mb-2">Unable to load plans</h3>
  //           <p className="text-red-600">Please try again later or contact support.</p>
  //         </div>
  //       </div>
  //     </Layout>
  //   );
  // }
  useEffect(() => {
    refreshSubscriptionData()

  }, [])


  const refreshSubscriptionData = async () => {
    await refetchPackages()
    await refetchSubscription()
  };

  // Check if user has any active subscription
  const hasActiveSubscription = () => {
    return currentSubscriptions && Array.isArray(currentSubscriptions) && currentSubscriptions.length > 0;
  };

  // Check if this specific package is the user's current plan
  const isCurrentPlan = (packageId: number) => {
    if (!currentSubscriptions || !Array.isArray(currentSubscriptions)) return false;
    return currentSubscriptions.some(sub => sub.package?.id === packageId);
  };

  // Updated handler to show confirmation dialog first
  const handleSubscribeClick = (packageId: number) => {
    const selectedPackage = packages?.find(pkg => pkg.id === packageId);
    navigate('/payment', {
      state: {
        packageData: selectedPackage
      }
    });
  };

  // Actual subscription handler when confirmed
  const handleSubscribe = async () => {
    if (!selectedPackageId) return;

    try {
      const payload = {
        packageId: selectedPackageId,
        cancelExisting: false,
        autoRenew: autoRenew,
      };

      const response = await subscribeToPackage(payload).unwrap();

      // Refetch current subscription data to update UI
      await refetchSubscription();

      // Close dialog after successful subscription
      setShowConfirmDialog(false);

      addToast(
        `You have successfully subscribed to ${response.package.name}`,
        ToastType.SUCCESS
      );
      await refetchUser();
    } catch (error: any) {
      console.error('Subscription failed:', error);
      addToast(error?.data?.message?.message,
        ToastType.ERROR
      );
    }
  };

  // Show unsubscribe dialog with the package id
  const handleUnsubscribeClick = (packageId: number) => {
    setSelectedPackageIdForUnsubscribe(packageId);
    setShowUnsubscribeDialog(true);
  };

  // Updated unsubscribe handler
  const handleUnsubscribe = async () => {
    if (!selectedPackageIdForUnsubscribe) return;

    try {
      await unsubscribeFromPackage(selectedPackageIdForUnsubscribe).unwrap();

      // Refetch current subscription data to update UI
      await refetchSubscription();

      // Close dialog after successful unsubscription
      setShowUnsubscribeDialog(false);

      addToast(
        "You have successfully unsubscribed",
        ToastType.SUCCESS
      );
      await refetchUser();
    } catch (error: any) {
      console.error('Unsubscription failed:', error);
      addToast(error?.data?.message?.message,
        ToastType.ERROR
      );
    }
  };

  // Get a feature icon based on the feature text
  const getFeatureIcon = (feature: string) => {
    if (feature.toLowerCase().includes('premium') || feature.toLowerCase().includes('advanced'))
      return <Sparkles className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />;
    if (feature.toLowerCase().includes('priority') || feature.toLowerCase().includes('fast'))
      return <Zap className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />;
    if (feature.toLowerCase().includes('support'))
      return <Shield className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />;
    if (feature.toLowerCase().includes('report') || feature.toLowerCase().includes('analytics'))
      return <Clock className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />;
    return <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />;
  };

  // Find the recommended package (usually the middle one)
  const getRecommendedPackage = () => {
    if (!packages || packages.length <= 1) return null;
    // If there are 3 packages, recommend the middle one; otherwise the last but one
    const recommendedIndex = packages.length === 3 ? 1 : packages.length - 2;
    return packages[recommendedIndex]?.id;
  };

  const recommendedPackageId = getRecommendedPackage();

  // Render usage metrics for all active subscriptions
  const renderUsageMetrics = () => {
    if (!currentSubscriptions || !Array.isArray(currentSubscriptions) || currentSubscriptions.length === 0) return null;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-white border border-amber-100 rounded-xl p-6 shadow-lg mb-10"
      >
        <h2 className="text-xl font-bold text-amber-800 mb-4">Your Active Subscriptions</h2>

        <div className="space-y-8">
          {currentSubscriptions?.map((subscription, index) => (
            <div key={index} className="border-t pt-4 border-amber-100 first:border-0 first:pt-0">
              <div className="flex flex-col md:flex-row justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    {subscription.package?.name || "Free Subscription"}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Expires: {new Date(subscription.endDate).toLocaleDateString()}
                    ({subscription.daysRemaining} days remaining)
                  </p>
                </div>
                <div className="mt-2 md:mt-0 flex items-center gap-2">

                  {subscription.package && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-red-300 text-red-600 hover:bg-red-50"
                      onClick={() => handleUnsubscribeClick(subscription.package?.id)}
                    >
                      Unsubscribe
                    </Button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-gray-700">Credits GPT Usage</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Used: {Math.round(subscription.tokensUsed / Number(tokenSettings?.creditsPerModelToken || 1))} Credits</span>
                      <span>Limit: {Math.round(subscription.tokenLimit / Number(tokenSettings?.creditsPerModelToken || 1))} Credits</span>
                    </div>

                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-amber-600 h-2.5 rounded-full"
                        style={{
                          width: `${Math.min(
                            (subscription.tokensUsed / subscription.tokenLimit) * 100,
                            100
                          )}%`
                        }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-gray-700">Image Credits Usage</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Generated: {Math.round(subscription.imagesGenerated / Number(tokenSettings?.creditsPerImageToken || 1))} Credits</span>
                      <span>Limit: {Math.round(subscription.imageLimit / Number(tokenSettings?.creditsPerImageToken || 1))} Credits</span>
                    </div>

                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-amber-600 h-2.5 rounded-full"
                        style={{
                          width: `${Math.min(
                            (subscription.imagesGenerated / subscription.imageLimit) * 100,
                            100
                          )}%`
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    );
  };



  return (
    <Layout>
      <div className="container max-w-7xl mx-auto py-10 px-4 sm:px-6">
        <div className="text-start mb-12">
          <div className="bg-gradient-to-r from-amber-50 to-amber-100/50 p-6 rounded-xl shadow-sm">

            <motion.h1
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-amber-500 to-amber-600 bg-clip-text text-transparent mb-2"
            >
              Choose Your Subscription Plan
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-sm text-gray-600 max-w-2xl "
            >
              Unlock powerful AI features and enhanced capabilities with our subscription packages.
            </motion.p>
          </div>
        </div>

        {/* Subscription Usage Metrics */}
        {renderUsageMetrics()}

        {userInfo?.isNewUser && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-8">
            <h3 className="text-lg font-semibold text-amber-800 mb-2">Welcome to Our Service! 🎉</h3>
            <p className="text-amber-700">
              As a new user, you can explore all our packages. Look for the "Free Trial" badge to start with our trial package and test our services before committing to a paid subscription.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {packages?.filter(pkg => pkg.isActive || isCurrentPlan(pkg.id))
            .map((pkg, index) => (
              <motion.div
                key={pkg.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className={`relative bg-white border rounded-xl overflow-hidden 
                  ${hoveredCard === pkg.id ? 'shadow-2xl scale-[1.02]' : 'shadow-lg'}
                  ${pkg.id === recommendedPackageId ? 'border-amber-300 ring-2 ring-amber-200' : 'border-gray-100'}
                  transition-all duration-300`}
                onMouseEnter={() => setHoveredCard(pkg.id)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                {/* Popular badge if this is the recommended package */}
                {pkg.id === recommendedPackageId && (
                  <div className="absolute top-0 right-0">
                    <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg shadow-md">
                      POPULAR
                    </div>
                  </div>
                )}

                {/* Current plan badge */}
                {isCurrentPlan(pkg.id) && (
                  <div className="absolute top-0 left-0 mx-4 my-1">
                    <div className="bg-green-100 text-green-800 text-xs font-medium px-2.5  rounded-full border border-green-200">
                      Current Plan
                    </div>
                  </div>
                )}

                <div className={`p-6 border-b 
                  ${pkg.id === recommendedPackageId ?
                    'bg-gradient-to-br from-amber-50 to-amber-100' :
                    'bg-gradient-to-br from-amber-50/50 to-amber-50/10'}`}>
                  <h3 className="text-xl font-bold text-amber-800 mb-1">
                    {pkg.name}
                    {userInfo?.isNewUser && pkg.isFree && (
                      <span className="ml-2 text-sm bg-green-100 text-green-800 px-2 py-1 rounded-full">
                        Free Trial
                      </span>
                    )}
                  </h3>
                  <p className="text-gray-600 mb-4 text-sm">
                    {pkg.description}
                  </p>
                  <div className="flex items-end gap-1 mb-1">
                    {userInfo?.isNewUser && pkg.isFree ? (
                      <>
                        <span className="text-3xl font-bold text-amber-700">$0.00</span>
                        <span className="text-xl text-gray-500 line-through mb-1">
                          ${parseFloat(pkg.price).toFixed(2)}
                        </span>
                      </>
                    ) : (
                      <span className="text-3xl font-bold text-amber-700">
                        ${parseFloat(pkg.price).toFixed(2)}
                      </span>
                    )}
                    <span className="text-gray-500 mb-1">
                      /{pkg.durationDays} days
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-gray-700 uppercase mb-3">
                      Package Features
                    </h4>
                    <ul className="space-y-3">
                      {Object.values(pkg.features).map((feature, index) => (
                        <li key={index} className="flex items-start gap-2">
                          {getFeatureIcon(feature)}
                          <span className="text-gray-600 text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between items-center p-2 rounded-lg bg-amber-50/50 text-sm">
                      <span className="text-gray-600">CreditsToken Limit:</span>
                      <span className="font-medium text-amber-700">{pkg.tokenLimit.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 rounded-lg bg-amber-50/50 text-sm">
                      <span className="text-gray-600">Credits Image Limit:</span>
                      <span className="font-medium text-amber-700">{pkg.imageLimit.toLocaleString()}</span>
                    </div>

                    {/* <div className="flex justify-between items-center p-2 rounded-lg bg-amber-50/50 text-sm">
                      <span className="text-gray-600">Image Model:</span>
                      <span className="font-medium text-amber-700">{pkg.imageModelType}</span>
                    </div> */}
                  </div>

                  <Button
                    className={`w-full group relative overflow-hidden shadow-md hover:shadow-lg transition-all duration-200 
                      ${isCurrentPlan(pkg.id)
                        ? 'bg-green-500 hover:bg-green-600'

                        : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700'}`}
                    disabled={isCurrentPlan(pkg.id) || isSubscribing || (hasActiveSubscription() && !isCurrentPlan(pkg.id))}
                    onClick={() => handleSubscribeClick(pkg.id)}
                  >
                    {isSubscribing && selectedPackageId === pkg.id ? (
                      <div className="flex items-center justify-center">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </div>
                    ) : isCurrentPlan(pkg.id) ? (
                      <div className="flex items-center justify-center">
                        <Check className="mr-2 h-4 w-4" />
                        Current Plan
                      </div>
                    ) : hasActiveSubscription() && !isCurrentPlan(pkg.id) ? (
                      <div className="flex items-center justify-center">
                        Subscribed Now
                      </div>
                    ) : (
                      <>
                        <span className="relative z-10">Subscribe Now</span>
                        <div className="absolute inset-0 h-full w-0 bg-white/20 transition-all duration-300 group-hover:w-full"></div>
                      </>
                    )}
                  </Button>
                </div>
              </motion.div>
            ))}
        </div>

        <div className="mt-10 text-center">
          <p className="text-sm text-gray-500">
            All plans include access to our basic AI features. For custom enterprise solutions, please{' '}
            <a href="#" className="text-amber-600 hover:text-amber-700 underline">contact our sales team</a>.
          </p>
        </div>

        {/* Confirmation Dialog */}
        <ConfirmDialog
          isOpen={showConfirmDialog}
          title="Confirm Subscription"
          description="Are you sure you want to subscribe to this plan?"
          onConfirm={handleSubscribe}
          confirmText="Subscribe"
          onClose={() => setShowConfirmDialog(false)}
          customContent={
            <div className="mt-6 mb-2">
              <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-amber-600 mr-2" />
                  <span className="text-sm font-medium text-amber-800">Auto-Renewal</span>
                </div>
                <button
                  type="button"
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${autoRenew ? 'bg-amber-500' : 'bg-gray-200'
                    }`}
                  onClick={() => setAutoRenew(!autoRenew)}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${autoRenew ? 'translate-x-5' : 'translate-x-0'
                      }`}
                  />
                </button>
              </div>
              <p className="mt-2 text-xs text-gray-500">
                {autoRenew
                  ? "Your subscription will automatically renew at the end of the billing period."
                  : "Your subscription will expire at the end of the billing period."}
              </p>
            </div>
          }
        />

        {/* Unsubscribe Confirmation Dialog */}
        <ConfirmDialog
          isOpen={showUnsubscribeDialog}
          title="Confirm Unsubscribe"
          description="Are you sure you want to unsubscribe? You will lose access to premium features."
          onConfirm={handleUnsubscribe}
          isLoading={isUnsubscribing}
          confirmText="Unsubscribe"
          onClose={() => setShowUnsubscribeDialog(false)}
        />
      </div>
    </Layout>
  );
};

export default SubscriptionPage;