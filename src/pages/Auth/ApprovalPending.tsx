import { motion } from 'framer-motion';
import { Clock, ShieldCheck, Mail, ArrowRight, BookOpen, UserCheck, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useGetMeQuery } from '@/api/authApi';
import { useDispatch } from 'react-redux';
import { setUserStatus, setCredentials } from '@/features/auth/authSlice';
import { useToast } from '@/context/ToastContext';
import { ToastType } from '@/constant';
import { useState, useEffect, useRef } from 'react';

export default function ApprovalPending() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { addToast } = useToast();
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Fetch latest user data
    const { data: userData, refetch, isFetching } = useGetMeQuery();

    // Prevent potential double-fires or redirect loops
    const hasRedirected = useRef(false);

    // Auto-redirect if status turns ACTIVE
    useEffect(() => {
        if (userData?.status === 'ACTIVE' && !hasRedirected.current) {
            hasRedirected.current = true;
            addToast("Your account has been approved! Redirecting...", ToastType.SUCCESS);

            // Update local state and Redux
            dispatch(setUserStatus({
                status: userData.status,
                paymentStatus: userData.paymentStatus
            }));

            // Short delay to ensure state propagates and user sees the message
            setTimeout(() => {
                navigate('/home', { replace: true });
            }, 1000);
        } else if (userData?.status === 'REJECTED' && !hasRedirected.current) {
            // Only toast once for rejection too
            hasRedirected.current = true;
            addToast("Please check your email. The details why your application has been rejected have been sent to your email address.", ToastType.ERROR);
        }
    }, [userData, dispatch, navigate, addToast]);

    const handleRefreshStatus = async () => {
        // Allow checking even if previously redirected/notified
        // if (hasRedirected.current) return;

        setIsRefreshing(true);
        try {
            const result = await refetch();
            const updatedUser = result.data;

            if (updatedUser) {
                // If active, the useEffect will handle it as userData updates
                // We just handle non-terminal states or explicit feedback here

                if (updatedUser.status === 'REJECTED') {
                    addToast("Please check your email. The details why your application has been rejected have been sent to your email address.", ToastType.ERROR);
                } else if (updatedUser.status !== 'ACTIVE') {
                    addToast("Review still in progress. Please check back later.", ToastType.INFO);

                    // Ensure Redux is in sync even if not active
                    dispatch(setUserStatus({
                        status: updatedUser.status,
                        paymentStatus: updatedUser.paymentStatus
                    }));
                }
            }
        } catch (error) {
            addToast("Unable to reach the server. Please try again.", ToastType.ERROR);
        } finally {
            setIsRefreshing(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col md:flex-row bg-white overflow-hidden">
            {/* Left: Branding & Status Graphic */}
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
                        <UserCheck className="h-10 w-10 text-white" />
                    </motion.div>

                    <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
                        Application in Review
                    </h1>
                    <p className="text-lg text-amber-50 mb-10 leading-relaxed opacity-90">
                        Your payment was successful and your account is now entering our premium verification queue. We carefully review every application to maintain our high community standards.
                    </p>

                    <div className="space-y-4">
                        <div className="flex items-center gap-4 text-amber-100">
                            <Clock className="h-5 w-5" />
                            <span>Typically processed within 24 hours</span>
                        </div>
                        <div className="flex items-center gap-4 text-amber-100">
                            <Mail className="h-5 w-5" />
                            <span>Watch your inbox for an activation code</span>
                        </div>
                    </div>
                </div>

                <div className="mt-auto pt-10 text-amber-200/50 text-sm">
                    Verified Application #AIBL-{Math.floor(Math.random() * 100000)}
                </div>
            </motion.div>

            {/* Right: Next Steps Area */}
            <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="w-full md:w-1/2 p-8 md:p-16 flex flex-col justify-center items-center bg-gray-50/50"
            >
                <div className="w-full max-w-md">
                    <div className="text-center mb-10">
                        <h2 className="text-3xl font-bold text-gray-900 mb-3">Verification Started</h2>
                        <p className="text-gray-600">
                            Here's what happens next while you wait
                        </p>
                    </div>

                    <div className="space-y-6 mb-12">
                        {[
                            { title: "Manual Validation", desc: "Our team verifies your registration details for security purposes." },
                            { title: "AI Instance Provisioning", desc: "We allocate dedicated compute resources for your writing engine." },
                            { title: "Final Activation", desc: "Once approved, you'll receive a full setup guide and login access." }
                        ].map((step, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.5 + (i * 0.1) }}
                                className="flex gap-4 p-5 rounded-2xl bg-white shadow-sm border border-gray-100"
                            >
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center font-bold text-sm">
                                    {i + 1}
                                </div>
                                <div className="text-left">
                                    <h3 className="font-bold text-gray-900">{step.title}</h3>
                                    <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    <div className="flex flex-col gap-4">
                        <Button
                            onClick={handleRefreshStatus}
                            disabled={isRefreshing || isFetching}
                            className="w-full h-14 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-lg shadow-xl shadow-amber-500/10 flex items-center justify-center gap-2"
                        >
                            <RefreshCw className={`h-5 w-5 ${isRefreshing || isFetching ? 'animate-spin' : ''}`} />
                            {isRefreshing || isFetching ? 'Checking Status...' : 'Check Approval Status'}
                        </Button>

                        <p className="text-center text-sm text-gray-400 mt-6">
                            Questions? Contact <a href="mailto:support@aibooklegacy.com" className="text-amber-600 hover:underline">support@aibooklegacy.com</a>
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
