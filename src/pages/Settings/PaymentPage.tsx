import { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { motion } from 'framer-motion';
import {  Coins, Shield, CheckCircle, ArrowRight } from 'lucide-react';
import PaymentCard from '@/components/payment/PaymentCard';
import { useToast } from '@/context/ToastContext';
import { ToastType } from '@/constant';
import { useCreatePaymentMutation, usePayWithExistingCardMutation } from '@/api/paymentApi';
import { useNavigate } from 'react-router-dom';
import { useUserMeQuery } from '@/api/userApi';

const PaymentPage = () => {
  const [amount, setAmount] = useState('50');
  const [selectedCardId, setSelectedCardId] = useState<string | undefined>(undefined);
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [createPayment, { isLoading }] = useCreatePaymentMutation();
  const [existingCardPayment, { isLoading: isExistingCardLoading}] = usePayWithExistingCardMutation();
  const { refetch: refetchUser } = useUserMeQuery();
  
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(e.target.value);
  };

  const handleAddCard = async (formData: any) => {
    try {
      console.log("paymentData========", formData);
      await createPayment(formData).unwrap();
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
        saveCard
      };
      
      await existingCardPayment({
         cardId,
        payload
      }).unwrap();
      
      addToast('Payment successful! Your account has been recharged.', ToastType.SUCCESS);
      await refetchUser();
      navigate(-1);
    } catch (error: any) {
      addToast(error?.data?.message || 'Payment failed. Please try again.', ToastType.ERROR);
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
                    Account Recharge
                  </h1>
                  <p className="text-sm text-gray-600">
                    Add credits to your account securely and quickly
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Main content area with two columns on larger screens */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Payment form column */}
            <div className="lg:col-span-7">
              <PaymentCard
                onAddNewCard={handleAddCard}
                onSavedMethodSelect={handleSavedCardSelect}
                onExistingCardPayment={handleExistingCardPayment}
                selectedMethodId={selectedCardId}
                isLoading={isLoading || isExistingCardLoading}
                amount={amount}
                onAmountChange={handleAmountChange}
              />
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