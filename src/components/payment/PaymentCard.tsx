import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CreditCard, Calendar, Lock, AlertCircle, Wallet, RefreshCw } from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import { ToastType } from '@/constant';
import { motion } from 'framer-motion';
import { useGetSavedCardsQuery, useDeleteCardMutation } from '@/api/paymentApi';
import ConfirmDialog from '../ui/ConfirmDialog';

interface PaymentCardProps {
  onSavedMethodSelect?: (methodId: string) => void;
  onAddNewCard?: (formData: any) => Promise<void>;
  onExistingCardPayment?: (cardId: number, amount: number, saveCard: boolean, isFree: boolean) => Promise<void>;
  selectedMethodId?: string;
  isLoading?: boolean;
  amount?: string;
  onAmountChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disableAmountChange?: boolean;
  layout?: 'vertical' | 'horizontal';
}

const PaymentCard = ({
  onAddNewCard,
  onSavedMethodSelect,
  onExistingCardPayment,
  selectedMethodId,
  isLoading = false,
  amount = '0.00',
  onAmountChange,
  disableAmountChange = false,
  layout = 'vertical'
}: PaymentCardProps) => {
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvc: '',
    saveCard: true,
    amount: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { addToast } = useToast();
  const [showNewCardForm, setShowNewCardForm] = useState(true);
  const { data: savedCards, isLoading: cardsLoading, refetch: refetchPayment } = useGetSavedCardsQuery();
  const [deleteCard, { isLoading: isDeleting }] = useDeleteCardMutation();
  const [cardToDelete, setCardToDelete] = useState<number | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);

  // Filter only successful cards
  const validSavedCards = savedCards?.filter(card => card.status === 'succeeded') || [];

  const validateCardDetails = () => {
    const newErrors: Record<string, string> = {};

    if (!cardDetails.cardNumber.trim() || cardDetails.cardNumber.replace(/\s/g, '').length !== 16) {
      newErrors.cardNumber = 'Please enter a valid 16-digit card number';
    }

    if (!cardDetails.cardName.trim()) {
      newErrors.cardName = 'Please enter the cardholder name';
    }

    if (!cardDetails.expiryDate.trim() || !/^\d{2}\/\d{2}$/.test(cardDetails.expiryDate)) {
      newErrors.expiryDate = 'Please enter a valid expiry date (MM/YY)';
    }

    if (!cardDetails.cvc.trim() || !/^\d{3,4}$/.test(cardDetails.cvc)) {
      newErrors.cvc = 'Please enter a valid CVV (3-4 digits)';
    }

    // Add amount validation
    const amountValue = (onAmountChange || disableAmountChange) ? amount : cardDetails.amount;
    if (!amountValue || parseFloat(amountValue) < 0) {
      newErrors.amount = 'Minimum amount is $1';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;

    if (name === 'amount' && onAmountChange) {
      onAmountChange(e);
      return;
    }

    let formattedValue = value;

    if (name === 'cardNumber') {
      formattedValue = value.replace(/\s/g, '').substring(0, 16);
      formattedValue = formattedValue.replace(/(.{4})/g, '$1 ').trim();
    }

    if (name === 'expiryDate') {
      formattedValue = value.replace(/\D/g, '').substring(0, 4);
      if (formattedValue.length > 2) {
        formattedValue = `${formattedValue.substring(0, 2)}/${formattedValue.substring(2)}`;
      }
    }

    setCardDetails({
      ...cardDetails,
      [name]: type === 'checkbox' ? checked : formattedValue,
    });

    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handleAddCard = async () => {
    if (validateCardDetails() && onAddNewCard) {
      try {
        const [month, year] = cardDetails.expiryDate.split('/');

        const formData = {
          cardHolderName: cardDetails.cardName,
          amount: (onAmountChange || disableAmountChange) ? parseFloat(amount) : parseFloat(cardDetails.amount),
          cvc: cardDetails.cvc,
          expiryMonth: month,
          expiryYear: `20${year}`,
          cardNumber: cardDetails.cardNumber,
          saveCard: cardDetails.saveCard,
          isFree: false
        };
        await onAddNewCard(formData);
        await refetchPayment();

      } catch (error: any) {
        addToast(error.message, ToastType.ERROR);
      }
    }
  };

  const handleDeleteCardClick = (e: React.MouseEvent, cardId: number) => {
    e.stopPropagation();
    setCardToDelete(cardId);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteCard = async () => {
    if (cardToDelete === null) return;

    try {
      await deleteCard(cardToDelete).unwrap();
      refetchPayment();
      addToast('Card deleted successfully', ToastType.SUCCESS);
    } catch (error) {
      addToast('Failed to delete card', ToastType.ERROR);
    } finally {
      setShowDeleteConfirm(false);
      setCardToDelete(null);
    }
  };

  const renderAmountSection = () => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="amount" className="text-sm font-medium text-gray-700 flex items-center mb-1.5">
          <Wallet className="w-4 h-4 mr-2 text-amber-500" />
          Payment Amount (min. $1)
        </Label>
        <div className="relative group">
          <Input
            id="amount"
            name="amount"
            type="number"
            placeholder="50.00"
            min="50"
            value={amount}
            onChange={onAmountChange}
            disabled={disableAmountChange}
            className={`pl-10 h-11 transition-all duration-200 ${errors.amount
              ? 'border-red-300 focus:ring-red-200'
              : 'border-gray-200 focus:border-amber-300 focus:ring-amber-100'
              } group-hover:border-amber-200 ${disableAmountChange ? 'bg-gray-100/50 cursor-not-allowed' : ''}`}
          />
          <span className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 group-hover:text-amber-500 transition-colors font-medium">$</span>
        </div>

        {errors.amount ? (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-1.5 text-xs text-red-500 flex items-center"
          >
            <AlertCircle className="h-3 w-3 mr-1" />
            {errors.amount}
          </motion.p>
        ) : (
          <p className="mt-1.5 text-xs text-gray-400 flex items-center gap-1">
            <Lock className="h-3 w-3" /> Secure E2E Encryption
          </p>
        )}

        {amount && !errors.amount && parseFloat(amount) >= 1 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-4 bg-amber-50/50 border border-amber-100/50 rounded-2xl space-y-2"
          >
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Subtotal:</span>
              <span className="font-semibold text-gray-800">${amount}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Network Fee:</span>
              <span className="text-green-600 font-medium">Free</span>
            </div>
            <div className="pt-2 border-t border-amber-100 flex justify-between items-center font-bold">
              <span className="text-gray-700">Due Today:</span>
              <span className="text-xl text-amber-600">${amount}</span>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );

  const renderCardForm = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4">
        <div>
          <Label htmlFor="cardNumber" className="text-sm font-medium text-gray-700 mb-1.5 block">Card Number</Label>
          <div className="relative">
            <Input
              id="cardNumber"
              name="cardNumber"
              placeholder="1234 5678 9012 3456"
              value={cardDetails.cardNumber}
              onChange={handleInputChange}
              className={`pl-10 h-11 ${errors.cardNumber ? 'border-red-300' : 'border-gray-200 focus:border-amber-300'}`}
            />
            <CreditCard className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>
          {errors.cardNumber && (
            <p className="mt-1 text-xs text-red-500 flex items-center">
              <AlertCircle className="h-3 w-3 mr-1" />
              {errors.cardNumber}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="cardName" className="text-sm font-medium text-gray-700 mb-1.5 block">Cardholder Name</Label>
          <Input
            id="cardName"
            name="cardName"
            placeholder="John Smith"
            value={cardDetails.cardName}
            onChange={handleInputChange}
            className={`h-11 ${errors.cardName ? 'border-red-300' : 'border-gray-200 focus:border-amber-300'}`}
          />
          {errors.cardName && (
            <p className="mt-1 text-xs text-red-500 flex items-center">
              <AlertCircle className="h-3 w-3 mr-1" />
              {errors.cardName}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="expiryDate" className="text-sm font-medium text-gray-700 mb-1.5 block">Expiry Date</Label>
            <div className="relative">
              <Input
                id="expiryDate"
                name="expiryDate"
                placeholder="MM/YY"
                value={cardDetails.expiryDate}
                onChange={handleInputChange}
                className={`pl-10 h-11 ${errors.expiryDate ? 'border-red-300' : 'border-gray-200 focus:border-amber-300'}`}
              />
              <Calendar className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
            {errors.expiryDate && (
              <p className="mt-1 text-xs text-red-500 flex items-center">
                <AlertCircle className="h-3 w-3 mr-1" />
                {errors.expiryDate}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="cvc" className="text-sm font-medium text-gray-700 mb-1.5 block">CVV</Label>
            <div className="relative">
              <Input
                id="cvc"
                name="cvc"
                placeholder="123"
                value={cardDetails.cvc}
                onChange={handleInputChange}
                type="password"
                className={`pl-10 h-11 ${errors.cvc ? 'border-red-300' : 'border-gray-200 focus:border-amber-300'}`}
              />
              <Lock className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
            {errors.cvc && (
              <p className="mt-1 text-xs text-red-500 flex items-center">
                <AlertCircle className="h-3 w-3 mr-1" />
                {errors.cvc}
              </p>
            )}
          </div>
        </div>
      </div>

      <Button
        className="w-full h-12 bg-amber-500 hover:bg-amber-600 text-white font-bold text-lg rounded-xl shadow-lg shadow-amber-500/10 mt-2"
        onClick={handleAddCard}
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
              className="mr-2"
            >
              <RefreshCw className="h-5 w-5 text-white" />
            </motion.div>
            Processing...
          </>
        ) : (
          'Complete Transaction'
        )}
      </Button>
    </div>
  );

  return (
    <>
      <Card className={`bg-transparent shadow-none border-none overflow-visible`}>
        <div className={`p-0 ${layout === 'horizontal' ? 'w-full' : ''}`}>
          {layout === 'vertical' ? (
            <div className="space-y-8">
              {renderAmountSection()}
              <div className="border-t border-gray-100 pt-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                  <CreditCard className="mr-2 h-5 w-5 text-amber-500" />
                  Enter Card Details
                </h3>
                {renderCardForm()}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
              <div className="bg-white p-6 rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-50 h-full flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                    <Wallet className="mr-3 h-6 w-6 text-amber-500" />
                    Transaction Summary
                  </h3>
                  {renderAmountSection()}
                </div>
                <div className="mt-8 pt-6 border-t border-gray-100">
                  <div className="flex items-center gap-3 grayscale opacity-40">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-3" />
                    <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-5" />
                    <img src="https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_logo%2C_revised_2016.svg" alt="Stripe" className="h-6" />
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-50">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                  <CreditCard className="mr-3 h-6 w-6 text-amber-500" />
                  Payment Details
                </h3>
                {renderCardForm()}
              </div>
            </div>
          )}
        </div>
      </Card>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Delete Payment Method"
        description="Are you sure you want to delete this payment method? This action cannot be undone."
        onConfirm={confirmDeleteCard}
        confirmText="Delete"
        onClose={() => setShowDeleteConfirm(false)}
      />
    </>
  );
};

export default PaymentCard;