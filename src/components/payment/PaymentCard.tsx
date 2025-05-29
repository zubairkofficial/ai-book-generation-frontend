import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CreditCard, Calendar, Lock, AlertCircle, Wallet, Plus, Check, Trash2 } from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import { ToastType } from '@/constant';
import { motion } from 'framer-motion';
import { useGetSavedCardsQuery, useDeleteCardMutation } from '@/api/paymentApi';
import ConfirmDialog from '../ui/ConfirmDialog';

interface PaymentCardProps {
  onSavedMethodSelect?: (methodId: string) => void;
  onAddNewCard?: (formData: any) => Promise<void>;
  onExistingCardPayment?: (cardId: number, amount: number, saveCard: boolean) => Promise<void>;
  selectedMethodId?: string;
  isLoading?: boolean;
  amount?: string;
  onAmountChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disableAmountChange?: boolean;
}

const PaymentCard = ({
  onAddNewCard,
  onSavedMethodSelect,
  onExistingCardPayment,
  selectedMethodId,
  isLoading = false,
  amount = '',
  onAmountChange,
  disableAmountChange = false
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
  const [showNewCardForm, setShowNewCardForm] = useState(false);
  const { data: savedCards, isLoading: cardsLoading ,refetch:refetchPayment} = useGetSavedCardsQuery();
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
    const amountValue = onAmountChange ? amount : cardDetails.amount;
    if (!amountValue || parseFloat(amountValue) < 50) {
      newErrors.amount = 'Minimum amount is $50';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    
    // If onAmountChange is provided and this is the amount field, use the prop
    if (name === 'amount' && onAmountChange) {
      onAmountChange(e);
      return;
    }
    
    let formattedValue = value;
    
    // Format card number with spaces
    if (name === 'cardNumber') {
      formattedValue = value.replace(/\s/g, '').substring(0, 16);
      formattedValue = formattedValue.replace(/(.{4})/g, '$1 ').trim();
    }
    
    // Format expiry date
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
    
    // Clear error when typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handleAddCard = async () => {
    if (validateCardDetails() && onAddNewCard) {
      try {
        // Transform the card details to match the API requirements
        const [month, year] = cardDetails.expiryDate.split('/');
        
        const formData = {
          cardHolderName: cardDetails.cardName,
          amount: onAmountChange ? parseInt(amount) : parseInt(cardDetails.amount),
          // currency: 'USD',
          cvc: cardDetails.cvc,
          expiryMonth: month,
          expiryYear: `20${year}`, // Convert to 4-digit year format
          cardNumber:cardDetails.cardNumber,
          saveCard:cardDetails.saveCard
          // Don't include cardName and expiryDate as they're not expected by the API
        };
        console.log("formdata",formData)
        await onAddNewCard(formData);
        await refetchPayment()
       
      } catch (error:any) {
        addToast(error.message, ToastType.ERROR);
      }
    }
  };

  const handleSavedCardSelect = (cardId: string) => {
    
    if (onSavedMethodSelect) {
      onSavedMethodSelect(cardId);
    }
  };

  const handleDeleteCardClick = (e: React.MouseEvent, cardId: number) => {
    e.stopPropagation(); // Prevent triggering card selection
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

  const handlePayWithSavedCard = async () => {
    if (!selectedMethodId || !onExistingCardPayment) return;
    
    const amountValue = onAmountChange ? amount : cardDetails.amount;
    if (!amountValue || parseFloat(amountValue) < 50) {
      setErrors({ ...errors, amount: 'Minimum amount is $50' });
      return;
    }
    
    setProcessingPayment(true);
    try {
      await onExistingCardPayment(
        parseInt(selectedMethodId),
        parseFloat(amountValue),
        true
      );
     } catch (error: any) {
      addToast(error.message || 'Payment failed', ToastType.ERROR);
    } finally {
      setProcessingPayment(false);
    }
  };

  return (
    <>
      <Card className="bg-white shadow-md border border-gray-100 overflow-hidden transition-all duration-300">
        <div className="p-4 sm:p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <CreditCard className="mr-2 h-5 w-5 text-amber-500" />
            Payment Method
          </h3>

          {/* Amount input section (same regardless of card selection) */}
          <div>
            <Label htmlFor="amount" className="text-sm font-medium text-gray-700 flex items-center">
              <Wallet className="w-4 h-4 mr-2 text-amber-500" />
              Payment Amount (min. $50)
            </Label>
            <div className="relative mt-1 group">
              <Input
                id="amount"
                name="amount"
                type="number"
                placeholder="50.00"
                min="50"
                value={amount}
                onChange={onAmountChange}
                disabled={disableAmountChange}
                className={`pl-10 transition-all duration-200 ${
                  errors.amount 
                    ? 'border-red-300 focus:ring-red-200' 
                    : 'border-gray-200 focus:border-amber-300 focus:ring-amber-100'
                } group-hover:border-amber-200 ${disableAmountChange ? 'bg-gray-100' : ''}`}
              />
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-hover:text-amber-500 transition-colors">$</span>
              
              {/* Add animated ripple effect on focus */}
              <div className="absolute inset-0 pointer-events-none rounded-md -z-10 opacity-0 group-hover:opacity-10 group-focus-within:opacity-20 bg-amber-300 transition-opacity"></div>
            </div>
            
            {errors.amount ? (
              <motion.p 
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-1 text-xs text-red-500 flex items-center"
              >
                <AlertCircle className="h-3 w-3 mr-1" />
                {errors.amount}
              </motion.p>
            ) : (
              <p className="mt-1 text-xs text-gray-500">
                All payments are processed securely with end-to-end encryption
              </p>
            )}
            
            {/* Additional UI for payment summary */}
            {amount && 
             !errors.amount && 
             parseFloat(amount) >= 50 && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-3 p-3 bg-amber-50 border border-amber-100 rounded-md"
              >
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Amount:</span>
                  <span className="font-medium text-gray-800">${amount}</span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-gray-600">Processing fee:</span>
                  <span className="font-medium text-gray-800">$0.00</span>
                </div>
                <div className="border-t border-amber-200 my-2"></div>
                <div className="flex justify-between text-sm font-medium">
                  <span className="text-gray-700">Total:</span>
                  <span className="text-amber-600">${amount}</span>
                </div>
              </motion.div>
            )}
          </div>

          {/* Saved Cards Section */}
          {!cardsLoading && validSavedCards.length > 0 && (
            <div className="mt-6">
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-md font-medium text-gray-700">Saved Cards</h4>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowNewCardForm(!showNewCardForm)}
                  className="text-amber-500 hover:text-amber-600"
                >
                  {showNewCardForm ? 'Use Saved Card' : 'Add New Card'}
                </Button>
              </div>
              
              {!showNewCardForm && (
                <div className="space-y-3">
                  {validSavedCards.map((card) => (
                    <div
                      key={card.id}
                      onClick={() => handleSavedCardSelect(card.id.toString())}
                      className={`p-3 border rounded-md cursor-pointer transition-all ${
                        selectedMethodId === card.id.toString() 
                          ? 'border-amber-400 bg-amber-50' 
                          : 'border-gray-200 hover:border-amber-200'
                      }`}
                      
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <CreditCard className="h-5 w-5 text-amber-500 mr-3" />
                          <div>
                            <p className="font-medium text-gray-800">
                              •••• {card.cardNumber.split(' ').pop()}
                            </p>
                            <p className="text-xs text-gray-500">
                              Expires {card.expiryMonth}/{card.expiryYear}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          {selectedMethodId === card.id.toString() && (
                            <Check className="h-5 w-5 text-amber-500 mr-2" />
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => handleDeleteCardClick(e, Number(card.id))}
                            disabled={isDeleting}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full p-1"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Add Pay Now button when a card is selected */}
                  {selectedMethodId && onExistingCardPayment && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-4"
                    >
                      <Button 
                        className="w-full bg-amber-500 hover:bg-amber-600 text-white"
                        onClick={handlePayWithSavedCard}
                        disabled={processingPayment}
                      >
                        {processingPayment ? (
                          <>
                            <span className="animate-spin mr-2">⏳</span>
                            Processing...
                          </>
                        ) : (
                          'Pay Now'
                        )}
                      </Button>
                    </motion.div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* New Card Form */}
          {(showNewCardForm || validSavedCards.length === 0) && (
            <div className="space-y-4 mt-4">
              {validSavedCards.length > 0 && (
                <div className="border-t border-gray-200 pt-4 mb-2">
                  <h4 className="text-md font-medium text-gray-700 mb-3">Add New Card</h4>
                </div>
              )}
              
              {/* Existing card form fields */}
              <div>
                <Label htmlFor="cardNumber" className="text-sm font-medium text-gray-700">Card Number</Label>
                <div className="relative mt-1">
                  <Input
                    id="cardNumber"
                    name="cardNumber"
                    placeholder="1234 5678 9012 3456"
                    value={cardDetails.cardNumber}
                    onChange={handleInputChange}
                    className={`pl-10 ${errors.cardNumber ? 'border-red-300' : ''}`}
                  />
                  <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
                {errors.cardNumber && (
                  <p className="mt-1 text-xs text-red-500 flex items-center">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {errors.cardNumber}
                  </p>
                )}
              </div>
              
              <div>
                <Label htmlFor="cardName" className="text-sm font-medium text-gray-700">Cardholder Name</Label>
                <Input
                  id="cardName"
                  name="cardName"
                  placeholder="John Smith"
                  value={cardDetails.cardName}
                  onChange={handleInputChange}
                  className={errors.cardName ? 'border-red-300' : ''}
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
                  <Label htmlFor="expiryDate" className="text-sm font-medium text-gray-700">Expiry Date</Label>
                  <div className="relative mt-1">
                    <Input
                      id="expiryDate"
                      name="expiryDate"
                      placeholder="MM/YY"
                      value={cardDetails.expiryDate}
                      onChange={handleInputChange}
                      className={`pl-10 ${errors.expiryDate ? 'border-red-300' : ''}`}
                    />
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>
                  {errors.expiryDate && (
                    <p className="mt-1 text-xs text-red-500 flex items-center">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {errors.expiryDate}
                    </p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="cvc" className="text-sm font-medium text-gray-700">CVV</Label>
                  <div className="relative mt-1">
                    <Input
                      id="cvc"
                      name="cvc"
                      placeholder="123"
                      value={cardDetails.cvc}
                      onChange={handleInputChange}
                      type="password"
                      className={`pl-10 ${errors.cvc ? 'border-red-300' : ''}`}
                    />
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>
                  {errors.cvc && (
                    <p className="mt-1 text-xs text-red-500 flex items-center">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {errors.cvc}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center mt-4">
                <input
                  type="checkbox"
                  id="saveCard"
                  name="saveCard"
                  checked={cardDetails.saveCard}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                />
                <label htmlFor="saveCard" className="ml-2 block text-sm text-gray-700">
                  Save this card for future payments
                </label>
              </div>
              
              <Button 
                className="w-full bg-amber-500 hover:bg-amber-600 text-white mt-6"
                onClick={handleAddCard}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    Processing...
                  </>
                ) : (
                  'Purchase'
                )}
              </Button>
            </div>
          )}
        </div>
      </Card>
      
      {/* Add the Confirm Dialog */}
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