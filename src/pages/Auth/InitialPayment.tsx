import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useDispatch } from 'react-redux';
import { ShieldCheck, Zap, Star, Layout, BookOpen, Loader2 } from 'lucide-react';
import { useCompleteInitialPaymentMutation } from '@/api/authApi';
import { useGetPublicPaymentFeeQuery } from '@/api/systemSettingsApi';
import PaymentCard from '@/components/payment/PaymentCard';
import Loader from '@/components/ui/loader';
import { useToast } from '@/context/ToastContext';
import { ToastType } from '@/constant';
import { setUserStatus, setCredentials } from '@/features/auth/authSlice';

export default function InitialPayment() {
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();
    const { addToast } = useToast();
    const userId = location.state?.userId;

    const { data: feeData, isLoading: isFeeLoading } = useGetPublicPaymentFeeQuery();
    const [completePayment, { isLoading }] = useCompleteInitialPaymentMutation();

    const paymentAmount = feeData?.fee || 500;

    useEffect(() => {
        if (!userId) {
            navigate('/auth');
            addToast("Session expired or invalid access.", ToastType.ERROR);
        }
    }, [userId, navigate, addToast]);

    const handlePayment = async (formData: any) => {
        if (!userId) return;

        try {
            const paymentData = {
                userId,
                cardData: {
                    cardNumber: formData.cardNumber,
                    expiryMonth: formData.expiryMonth,
                    expiryYear: formData.expiryYear,
                    cvc: formData.cvc,
                    amount: paymentAmount,
                    cardHolderName: formData.cardHolderName,
                    saveCard: formData.saveCard,
                    isFree: false
                }
            };

            const response = await completePayment(paymentData).unwrap();

            if (response?.accessToken) {
                // Save credentials to maintain authentication
                dispatch(setCredentials({
                    user: response.user,
                    accessToken: response.accessToken
                }));

                addToast(response.message || "Payment successful!", ToastType.SUCCESS);
                navigate('/auth/approval-pending');
            } else {
                addToast("Payment successful! Please log in to check status.", ToastType.SUCCESS);
                navigate('/auth/signin');
            }
        } catch (error: any) {
            console.error("Payment Error:", error);
            addToast(error.data?.message || 'Payment failed. Please try again.', ToastType.ERROR);
        }
    };

    if (!userId) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <Loader2 className="h-10 w-10 animate-spin text-amber-500" />
        </div>
    );

    return (
        <div className="min-h-screen flex flex-col md:flex-row bg-white overflow-hidden">
            {/* Left: Branding & Benefits (High-end Graphic Section) */}
            <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="w-full md:w-1/2 bg-gradient-to-br from-amber-600 via-amber-700 to-amber-900 p-8 md:p-16 flex flex-col justify-center text-white relative"
            >
                {/* Abstract background elements */}
                <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-white rounded-full blur-[150px]"></div>
                </div>

                <div className="relative z-10 flex items-center gap-3 mb-12">
                    <div className="bg-white p-2 rounded-xl text-amber-600">
                        <BookOpen className="h-8 w-8" />
                    </div>
                    <span className="text-2xl font-bold tracking-tight">AI BOOK LEGACY</span>
                </div>

                <div className="relative z-10 max-w-lg">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                        className="mb-8 inline-flex items-center justify-center p-4 rounded-full bg-white/10 backdrop-blur-md border border-white/20"
                    >
                        <ShieldCheck className="h-10 w-10 text-white" />
                    </motion.div>

                    <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
                        Unlock Your Creative Potential
                    </h1>
                    <p className="text-lg text-amber-50 mb-10 leading-relaxed opacity-90">
                        Join our exclusive community of authors and creators. Your setup fee activates your premium lifetime-ready account and grants immediate access to our specialized AI writing engine.
                    </p>

                    <div className="space-y-4">
                        {[
                            { icon: <Zap className="h-5 w-5" />, title: "Hyper-Responsive AI", desc: "Access our fastest, most capable models." },
                            { icon: <ShieldCheck className="h-5 w-5" />, title: "Full IP Ownership", desc: "You own every word generated by our system." },
                            { icon: <Star className="h-5 w-5" />, title: "Priority Support", desc: "Direct access to our expert author concierge." },
                            { icon: <Layout className="h-5 w-5" />, title: "Advanced Formatting", desc: "Export to industry-standard formats instantly." }
                        ].map((benefit, i) => (
                            <div key={i} className="flex items-center gap-4 text-amber-100">
                                <div className="p-1">
                                    {benefit.icon}
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-semibold text-white">{benefit.title}</span>
                                    <span className="text-sm text-amber-100/70">{benefit.desc}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mt-auto pt-10 text-amber-200/50 text-sm">
                    © 2026 AI Book Legacy. Professional Edition.
                </div>
            </motion.div>

            {/* Right: Payment Form Area */}
            <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="w-full md:w-1/2 p-4 md:p-12 lg:p-16 flex flex-col justify-center items-center bg-gray-50/50"
            >
                <div className="w-full max-w-4xl">
                    <div className="text-center mb-10">
                        <div className="inline-flex items-center justify-center p-3 mb-4 rounded-2xl bg-amber-100 text-amber-600">
                            <ShieldCheck className="h-8 w-8" />
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-3">Complete Your Activation</h2>
                        <p className="text-gray-600">
                            Secure payment and resource allocation
                        </p>
                    </div>

                    {isFeeLoading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4 bg-white rounded-3xl shadow-xl shadow-gray-200/50">
                            <Loader2 className="h-10 w-10 animate-spin text-amber-500" />
                            <p className="text-gray-500 font-medium tracking-tight">Initializing secure gateway...</p>
                        </div>
                    ) : (
                        <PaymentCard
                            amount={paymentAmount.toString()}
                            isLoading={isLoading}
                            onAddNewCard={handlePayment}
                            disableAmountChange={true}
                            layout="horizontal"
                        />
                    )}

                    <p className="mt-10 text-center text-xs text-gray-400 px-10 leading-relaxed max-w-2xl mx-auto">
                        By completing this payment, you agree to our Terms of Service and Privacy Policy. All transactions are encrypted and processed securely via Stripe. Your data is protected by industry-standard encryption protocols.
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
