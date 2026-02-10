import { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { motion } from 'framer-motion';
import { Coins, Shield, CheckCircle, ArrowRight, Clock, Wallet, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PaymentCard from '@/components/payment/PaymentCard';
import { useToast } from '@/context/ToastContext';
import { ToastType } from '@/constant';
import { useCreatePaymentMutation, usePayWithExistingCardMutation } from '@/api/paymentApi';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUserMeQuery } from '@/api/userApi';
import { useSubscribeToPackageMutation } from '@/api/subscriptionApi';
import { Badge } from '@/components/ui/badge';
import { Card as ShadcnCard } from '@/components/ui/card';

const PaymentPage = () => {
  const location = useLocation();
  const packageData = location.state?.packageData;
  const [amount, setAmount] = useState(packageData?.price || '50');
  const [autoRenew, setAutoRenew] = useState(false);
  const [selectedCardId, setSelectedCardId] = useState<string | undefined>(undefined);
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [createPayment, { isLoading }] = useCreatePaymentMutation();
  const [existingCardPayment, { isLoading: isExistingCardLoading }] = usePayWithExistingCardMutation();
  const { data: userInfo, refetch: refetchUser } = useUserMeQuery();
  const [subscribeToPackage, { isLoading: isSubscribing }] = useSubscribeToPackageMutation();
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'credit'>(
    packageData && Number(userInfo?.availableAmount) >= Number(packageData.price) ? 'credit' : 'card'
  );

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(e.target.value);
  };

  const handleAddCard = async (formData: any) => {
    try {
      const paymentData = {
        ...formData,
        isFree: packageData?.isFree || false
      };

      console.log('Attempting card payment with data:', paymentData);
      const paymentResult = await createPayment(paymentData).unwrap();
      console.log('Card payment result:', paymentResult);

      if (packageData) {
        await subscribeToPackage({
          packageId: packageData.id,
          cancelExisting: false,
          autoRenew,
          paymentMethod: 'card'
        }).unwrap();
      }

      addToast('Payment successful! Your account has been recharged.', ToastType.SUCCESS);
      await refetchUser();
      navigate(-1);
    } catch (error: any) {
      addToast(error?.data?.message || 'Payment failed. Please try again.', ToastType.ERROR);
    }
  };

  const handleSavedCardSelect = (cardId: string) => {
    setSelectedCardId(cardId);
  };

  const handleExistingCardPayment = async (cardId: number, paymentAmount: number, saveCard: boolean) => {
    try {
      const payload = {
        amount: paymentAmount,
        saveCard: true,
        isFree: packageData?.isFree || false
      };

      console.log('Attempting existing card payment:', { cardId, payload });
      const paymentResult = await existingCardPayment({
        cardId,
        payload
      }).unwrap();
      console.log('Existing card payment result:', paymentResult);

      if (packageData) {
        await subscribeToPackage({
          packageId: packageData.id,
          cancelExisting: false,
          autoRenew,
          paymentMethod: 'card'
        }).unwrap();
      }

      addToast('Payment successful! Your account has been recharged.', ToastType.SUCCESS);
      await refetchUser();
      navigate(-1);
    } catch (error: any) {
      addToast(error?.data?.message || 'Payment failed. Please try again.', ToastType.ERROR);
    }
  };

  const handlePayWithBalance = async () => {
    if (!packageData) return;

    try {
      console.log('Attempting to subscribe with balance:', {
        packageId: packageData.id,
        paymentMethod: 'credit'
      });

      const result = await subscribeToPackage({
        packageId: packageData.id,
        cancelExisting: false,
        autoRenew,
        paymentMethod: 'credit'
      }).unwrap();

      console.log('Subscription result:', result);
      addToast('Subscription successful! Deducted from credit balance.', ToastType.SUCCESS);
      await refetchUser();
      navigate('/home');
    } catch (error: any) {
      console.error('Subscription error detail:', error);
      addToast(error?.data?.message?.message || error?.data?.message || 'Subscription failed. Please try again.', ToastType.ERROR);
    }
  };

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-gradient-to-b from-gray-50 to-white"
      >
        <div className="p-4 md:p-8 max-w-[1400px] mx-auto">
          {/* Enhanced Header Section with gradient background */}
          <div className="mb-8 space-y-6">
            <div className="bg-gradient-to-r from-amber-50 to-amber-100/50 p-6 rounded-xl shadow-sm">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 flex items-center">
                    <Coins className="w-8 h-8 mr-3 text-amber-500" />
                    {packageData ? 'Subscribe to Package' : 'Account Recharge'}
                  </h1>
                  <p className="text-sm text-gray-600">
                    {packageData ? `Subscribe to ${packageData.name} package` : 'Add credits to your account securely and quickly'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Main content area with two columns on larger screens */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Payment form column */}
            <div className="lg:col-span-7">
              {packageData && (
                <div className="mb-6 p-4 bg-amber-50 rounded-lg border border-amber-100">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-amber-800">Package Details</h3>
                    <span className="text-2xl font-bold text-amber-600">${packageData.isFree && userInfo?.isNewUser ? '0.00' : packageData.price}</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Duration:</span>
                      <span className="font-medium">{packageData.durationDays} days</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Token Limit:</span>
                      <span className="font-medium">{packageData.tokenLimit.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Image Limit:</span>
                      <span className="font-medium">{packageData.imageLimit.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-amber-200">
                    <div className="flex items-center justify-between">
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
                </div>
              )}

              {packageData && (
                <div className="mb-8 p-6 bg-white rounded-xl shadow-md border border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <Wallet className="mr-2 h-5 w-5 text-amber-500" />
                    Select Payment Method
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Credit Balance Option */}
                    <ShadcnCard
                      className={`p-4 cursor-pointer transition-all duration-200 border-2 ${paymentMethod === 'credit'
                        ? 'border-amber-500 bg-amber-50/30'
                        : 'border-gray-100 hover:border-amber-200'
                        } ${Number(userInfo?.availableAmount) < Number(packageData.price) ? 'opacity-50 cursor-not-allowed' : ''}`}
                      onClick={() => Number(userInfo?.availableAmount) >= Number(packageData.price) && setPaymentMethod('credit')}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <Coins className="h-5 w-5 text-amber-500 mr-2" />
                          <span className="font-medium text-gray-800">Credit Balance</span>
                        </div>
                        {paymentMethod === 'credit' && <CheckCircle className="h-5 w-5 text-amber-500" />}
                      </div>
                      <div className="text-sm text-gray-600">
                        Current: <span className="font-bold text-gray-900">${Number(userInfo?.availableAmount || 0).toFixed(2)}</span>
                      </div>
                      {Number(userInfo?.availableAmount) < Number(packageData.price) && (
                        <Badge variant="destructive" className="mt-2 text-[10px] py-0 px-1.5 h-auto uppercase">Insufficient Balance</Badge>
                      )}
                    </ShadcnCard>

                    {/* Credit Card Option */}
                    <ShadcnCard
                      className={`p-4 cursor-pointer transition-all duration-200 border-2 ${paymentMethod === 'card'
                        ? 'border-amber-500 bg-amber-50/30'
                        : 'border-gray-100 hover:border-amber-200'
                        }`}
                      onClick={() => setPaymentMethod('card')}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <CreditCard className="h-5 w-5 text-amber-500 mr-2" />
                          <span className="font-medium text-gray-800">Credit Card</span>
                        </div>
                        {paymentMethod === 'card' && <CheckCircle className="h-5 w-5 text-amber-500" />}
                      </div>
                      <div className="text-sm text-gray-600">
                        Pay with saved card or add new
                      </div>
                    </ShadcnCard>
                  </div>
                </div>
              )}

              {paymentMethod === 'card' ? (
                <PaymentCard
                  onAddNewCard={handleAddCard}
                  onSavedMethodSelect={handleSavedCardSelect}
                  onExistingCardPayment={handleExistingCardPayment}
                  selectedMethodId={selectedCardId}
                  isLoading={isLoading || isExistingCardLoading}
                  amount={packageData?.isFree && userInfo?.isNewUser ? '0.00' : amount}
                  onAmountChange={handleAmountChange}
                  disableAmountChange={!!packageData}
                />
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-8 bg-white rounded-xl shadow-lg border border-amber-100 text-center"
                >
                  <div className="mb-6 inline-flex p-4 rounded-full bg-amber-50">
                    <Coins className="h-12 w-12 text-amber-500" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Confirm Subscription</h3>
                  <p className="text-gray-600 mb-8">
                    You are subscribing to <span className="font-bold text-gray-900">{packageData.name}</span>.<br />
                    An amount of <span className="font-bold text-amber-600">${packageData.price}</span> will be deducted from your credit balance.
                  </p>

                  <div className="flex flex-col gap-3">
                    <Button
                      className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white h-12 text-lg font-bold shadow-lg"
                      onClick={handlePayWithBalance}
                      disabled={isSubscribing}
                    >
                      {isSubscribing ? (
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Processing...
                        </div>
                      ) : (
                        `Confirm & Pay $${Number(packageData.price).toFixed(2)}`
                      )}
                    </Button>
                    <p className="text-xs text-gray-500 italic">
                      Current balance after payment: <span className="font-medium">${(Number(userInfo?.availableAmount) - Number(packageData.price)).toFixed(2)}</span>
                    </p>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Info cards column */}
            <div className="lg:col-span-5 space-y-6">
              {/* Security Info Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-xl shadow-md border border-gray-100 p-6 overflow-hidden relative"
              >
                <div className="absolute -right-12 -top-12 w-36 h-36 bg-amber-100 rounded-full opacity-20"></div>
                <div className="relative z-10">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <Shield className="mr-2 h-5 w-5 text-amber-500" />
                    Secure Payments
                  </h3>

                  <ul className="space-y-3 text-sm">
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span>All transactions are encrypted end-to-end</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span>Your card information is never stored on our servers</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span>We utilize industry-standard PCI compliant payment processing</span>
                    </li>
                  </ul>
                </div>
              </motion.div>

              {/* How it works card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-xl shadow-md border border-gray-100 p-6 overflow-hidden relative"
              >
                <div className="absolute -left-12 -bottom-12 w-36 h-36 bg-amber-100 rounded-full opacity-20"></div>
                <div className="relative z-10">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <ArrowRight className="mr-2 h-5 w-5 text-amber-500" />
                    How It Works
                  </h3>

                  <ol className="space-y-4 relative border-l border-gray-200 ml-3 pl-5">
                    <li className="mb-6">
                      <div className="absolute w-6 h-6 bg-amber-100 rounded-full -left-3 border border-amber-200 flex items-center justify-center">
                        <span className="text-amber-500 text-xs font-medium">1</span>
                      </div>
                      <h4 className="text-sm font-medium text-gray-800">Enter Payment Amount</h4>
                      <p className="text-xs text-gray-600 mt-1">Choose how much you want to add to your account (minimum $50)</p>
                    </li>
                    <li className="mb-6">
                      <div className="absolute w-6 h-6 bg-amber-100 rounded-full -left-3 border border-amber-200 flex items-center justify-center">
                        <span className="text-amber-500 text-xs font-medium">2</span>
                      </div>
                      <h4 className="text-sm font-medium text-gray-800">Enter Card Details</h4>
                      <p className="text-xs text-gray-600 mt-1">Provide your card information securely</p>
                    </li>
                    <li className="mb-6">
                      <div className="absolute w-6 h-6 bg-amber-100 rounded-full -left-3 border border-amber-200 flex items-center justify-center">
                        <span className="text-amber-500 text-xs font-medium">3</span>
                      </div>
                      <h4 className="text-sm font-medium text-gray-800">Instant Recharge</h4>
                      <p className="text-xs text-gray-600 mt-1">Your account will be credited immediately after successful payment</p>
                    </li>
                  </ol>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-40 left-10 w-64 h-64 bg-amber-300 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
        <div className="absolute top-80 right-10 w-72 h-72 bg-amber-200 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
      </motion.div>
    </Layout>
  );
};

export default PaymentPage; 