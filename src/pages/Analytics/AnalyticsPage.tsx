import React, { useMemo, useState } from 'react';
import Layout from '@/components/layout/Layout';
import { useGetAllUserAnalyticsQuery, UserAnalytics } from '@/api/analyticsApi';
import { Card } from '@/components/ui/card';
import { Loader2, BookOpen, PenTool, Users, BarChart3, Library, Clock, Search, Book, User, Shield, Calendar, X, ChevronDown, Check, AlertCircle, User2, UserPlus, Settings2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, parseISO, isValid } from 'date-fns';
import { Button } from '@/components/ui/button';
import CreateUserModal from '@/components/modals/CreateUserModal';
import TokenSettingsModal from '@/components/admin/TokenSettingsModal';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useApproveUserMutation, useRejectUserMutation, useBlockUserMutation, useUnblockUserMutation } from '@/api/adminApi';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/context/ToastContext';
import { ToastType } from '@/constant';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface ProcessedAnalyticsData {
  totalBooks: number;
  totalUsers: number;
  activeUsers: number;
  adminUsers: number;
  mostActiveUser: UserAnalytics | null;
  users: UserAnalytics[];
}

const AnalyticsPage = () => {
  const { data: analyticsData, isLoading, isError, error } = useGetAllUserAnalyticsQuery(undefined, {
    pollingInterval: 10000, // Poll every 10 seconds
  });
  const [searchTerms, setSearchTerms] = useState({
    user: '',
    role: '',
    books: '',
    joined: '',
    verified: '',
    status: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isCreateUserModalOpen, setIsCreateUserModalOpen] = useState(false);
  const [isTokenSettingsModalOpen, setIsTokenSettingsModalOpen] = useState(false);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState('all');

  // Rejection Modal State
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [userToReject, setUserToReject] = useState<number | null>(null);

  const [approveUser] = useApproveUserMutation();
  const [rejectUser] = useRejectUserMutation();
  const [blockUser] = useBlockUserMutation();
  const [unblockUser] = useUnblockUserMutation();
  const { addToast } = useToast();

  // Transform API data into user-friendly analytics
  const processedData = useMemo<ProcessedAnalyticsData | null>(() => {
    if (!analyticsData || !Array.isArray(analyticsData)) return null;

    // Calculate total books with proper type safety
    const totalBooks = analyticsData.reduce((sum, user) =>
      sum + parseInt(user.bookCount || '0', 10), 0);

    // Count active users (users with at least one book)
    const activeUsers = analyticsData.filter(user =>
      parseInt(user.bookCount || '0', 10) > 0).length;

    // Count admin vs regular users
    const adminUsers = analyticsData.filter(user =>
      user.user_role === 'admin').length;

    // Find most active user
    let mostActiveUser: UserAnalytics | null = null;
    if (analyticsData.length > 0) {
      mostActiveUser = [...analyticsData].sort((a, b) =>
        parseInt(b.bookCount || '0', 10) - parseInt(a.bookCount || '0', 10)
      )[0];
    }

    return {
      totalBooks,
      totalUsers: analyticsData.length,
      activeUsers,
      adminUsers,
      mostActiveUser,
      users: analyticsData
    };
  }, [analyticsData]);

  // Safe date formatting function to handle invalid dates
  const formatDate = (dateString: string): string => {
    try {
      const date = parseISO(dateString);
      if (!isValid(date)) return 'Invalid date';
      return format(date, 'MMM dd, yyyy');
    } catch (e) {
      return 'Invalid date';
    }
  };

  // Filter users based on search terms
  const filteredUsers = useMemo(() => {
    if (!processedData?.users) return [];

    return processedData.users.filter(user => {
      // Convert all values to lowercase for case-insensitive comparison
      const userName = (user.user_name || '').toLowerCase();
      const userEmail = (user.user_email || '').toLowerCase();
      const userRole = (user.user_role || '').toLowerCase();
      const bookCount = (user.bookCount || '').toString();
      const joinDate = formatDate(user.user_createdAt || '').toLowerCase();
      const verifiedStatus = user.user_isEmailVerified ? 'verified' : 'pending';

      // Map status for filtering
      let statusFilterMatch = true;
      if (searchTerms.status) {
        if (searchTerms.status === 'blocked') {
          statusFilterMatch = user.user_isBlocked;
        } else {
          // optimized: check if blocked is false before checking status to avoid showing blocked users in other categories
          statusFilterMatch = !user.user_isBlocked && user.user_status === searchTerms.status;
        }
      }

      // Check if user matches all non-empty search criteria
      return (
        (searchTerms.user === '' ||
          userName.includes(searchTerms.user.toLowerCase()) ||
          userEmail.includes(searchTerms.user.toLowerCase())) &&
        (searchTerms.role === '' || userRole.includes(searchTerms.role.toLowerCase())) &&
        (searchTerms.books === '' || bookCount.includes(searchTerms.books)) &&
        (searchTerms.joined === '' || joinDate.includes(searchTerms.joined.toLowerCase())) &&
        (searchTerms.verified === '' || verifiedStatus === searchTerms.verified.toLowerCase()) &&
        statusFilterMatch
      );
    });
  }, [processedData, searchTerms, formatDate]);

  // Calculate pagination
  const totalPages = Math.ceil((filteredUsers?.length || 0) / pageSize);
  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredUsers.slice(startIndex, startIndex + pageSize);
  }, [filteredUsers, currentPage, pageSize]);

  // Handle search input change
  const handleSearchChange = (column: keyof typeof searchTerms, value: string) => {
    setSearchTerms(prev => ({ ...prev, [column]: value }));
    setCurrentPage(1); // Reset to first page when search changes
  };

  const handleApprove = async (id: number) => {
    setProcessingId(id);
    try {
      await approveUser({ id }).unwrap();
      addToast("User approved successfully", ToastType.SUCCESS);
    } catch (error: any) {
      addToast(error.data?.message || "Failed to approve user", ToastType.ERROR);
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectClick = (id: number) => {
    setUserToReject(id);
    setRejectionReason('');
    setIsRejectModalOpen(true);
  };

  const handleConfirmReject = async () => {
    if (!userToReject) return;

    setProcessingId(userToReject);
    try {
      await rejectUser({ id: userToReject, reason: rejectionReason }).unwrap();
      addToast("User rejected successfully", ToastType.SUCCESS);
      setIsRejectModalOpen(false);
    } catch (error: any) {
      addToast(error.data?.message || "Failed to reject user", ToastType.ERROR);
    } finally {
      setProcessingId(null);
      setUserToReject(null);
    }
  };

  const handleBlockUser = async (id: number) => {
    setProcessingId(id);
    try {
      await blockUser({ id }).unwrap();
      addToast("User blocked successfully", ToastType.SUCCESS);
    } catch (error: any) {
      addToast(error.data?.message || "Failed to block user", ToastType.ERROR);
    } finally {
      setProcessingId(null);
    }
  };

  const handleUnblockUser = async (id: number) => {
    setProcessingId(id);
    try {
      await unblockUser({ id }).unwrap();
      addToast("User unblocked successfully", ToastType.SUCCESS);
    } catch (error: any) {
      addToast(error.data?.message || "Failed to unblock user", ToastType.ERROR);
    } finally {
      setProcessingId(null);
    }
  };

  const newRequests = useMemo(() => {
    if (!processedData?.users) return [];
    return processedData.users.filter(u => u.user_status === 'PENDING_APPROVAL');
  }, [processedData]);

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-gradient-to-b from-gray-50 to-white"
      >
        <div className="p-4 md:p-8 max-w-[1400px] mx-auto">
          {/* Enhanced Header Section */}
          <div className="bg-gradient-to-r from-amber-50 to-amber-100/50 p-6 rounded-xl shadow-sm mb-6">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 flex items-center">
                  <Users className="w-7 h-7 mr-3 text-amber-500" />
                  User Analytics
                </h1>
                <p className="text-sm text-gray-600">
                  Track user activity and book creation metrics
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="bg-amber-100 px-4 py-2 rounded-lg flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-amber-600" />
                  <span className="text-sm font-medium text-amber-800">
                    {new Date().toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </span>
                </div>

                <Button
                  onClick={() => setIsCreateUserModalOpen(true)}
                  className="bg-amber-500 hover:bg-amber-600 text-white flex items-center gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  Create User
                </Button>
              </div>
            </div>
          </div>

          {/* Loading, Error, or Content States */}
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center h-64 space-y-4"
              >
                <div className="p-3 bg-amber-50 rounded-full">
                  <Loader2 className="animate-spin text-amber-500" size={40} />
                </div>
                <p className="text-gray-600 font-medium">Loading analytics data...</p>
              </motion.div>
            ) : isError ? (
              <motion.div
                key="error"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-red-50 border border-red-200 rounded-lg p-6 text-red-700 flex flex-col items-center"
              >
                <p className="font-medium mb-2">Error loading analytics</p>
                <p className="text-sm">{error instanceof Error ? error.message : 'Unknown error occurred'}</p>
              </motion.div>
            ) : (
              <motion.div
                key="content"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="space-y-6">
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="bg-white border p-1 rounded-xl mb-6">
                      <TabsTrigger value="all" className="rounded-lg px-6 py-2.5 data-[state=active]:bg-amber-500 data-[state=active]:text-white">
                        All Users
                      </TabsTrigger>
                      <TabsTrigger value="requests" className="rounded-lg px-6 py-2.5 data-[state=active]:bg-amber-500 data-[state=active]:text-white relative">
                        New Requests
                        {newRequests.length > 0 && (
                          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-white animate-pulse">
                            {newRequests.length}
                          </span>
                        )}
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="all" className="mt-0">
                      {/* User Analytics Table with Improved Search UI */}
                      <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
                        {/* Enhanced Professional Search Panel */}
                        <div className="p-5 bg-gradient-to-r from-amber-50/50 to-white border-b border-gray-200">
                          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">



                          </div>

                          {/* Advanced Filter Pills with improved hover behavior */}
                          <div className="mt-4">
                            <div className="flex items-center mb-2">
                              <span className="text-xs font-medium text-gray-500 mr-2">Advanced Filters:</span>
                              <button
                                className="text-xs text-amber-600 hover:text-amber-800 font-medium flex items-center"
                                onClick={() => setSearchTerms({
                                  user: '',
                                  role: '',
                                  books: '',
                                  joined: '',
                                  verified: '',
                                  status: ''
                                })}
                              >
                                Clear All
                              </button>
                            </div>

                            <div className="flex flex-wrap gap-2">
                              {/* User Filter with improved hover */}
                              <div className="relative group hover:z-20">
                                <div className={`px-3 py-1.5 text-sm rounded-full border flex items-center gap-1 cursor-pointer transition-all ${searchTerms.user
                                  ? 'bg-amber-50 border-amber-200 text-amber-800'
                                  : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                                  }`}>
                                  <User className="w-3.5 h-3.5 mr-1" />
                                  {searchTerms.user ? `User: ${searchTerms.user}` : 'User'}
                                  <ChevronDown className="w-3.5 h-3.5 opacity-50" />
                                </div>

                                <div className="absolute left-0 top-full mt-1 w-64 bg-white rounded-lg shadow-lg border border-gray-200 p-3 z-10 
                                          invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-300 
                                          cursor-default transform translate-y-1 group-hover:translate-y-0">
                                  {/* Extended hover area to prevent accidental mouseout */}
                                  <div className="absolute -top-3 left-0 right-0 h-3 bg-transparent"></div>

                                  <label className="text-xs font-medium text-gray-500 mb-1 block">User Name or Email</label>
                                  <div className="relative">
                                    <Search className="w-4 h-4 absolute left-2.5 top-2.5 text-gray-400" />
                                    <input
                                      type="text"
                                      className="pl-8 w-full h-9 text-sm rounded-md border-gray-200 bg-white shadow-sm focus:border-amber-500 focus:ring-amber-500"
                                      placeholder="Search users..."
                                      value={searchTerms.user}
                                      onChange={(e) => handleSearchChange('user', e.target.value)}
                                    />
                                  </div>
                                </div>
                              </div>

                              {/* Role Filter with improved hover */}
                              <div className="relative group hover:z-20">
                                <div className={`px-3 py-1.5 text-sm rounded-full border flex items-center gap-1 cursor-pointer transition-all ${searchTerms.role
                                  ? 'bg-purple-50 border-purple-200 text-purple-800'
                                  : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                                  }`}>
                                  <Shield className="w-3.5 h-3.5 mr-1" />
                                  {searchTerms.role ? `Role: ${searchTerms.role}` : 'Role'}
                                  <ChevronDown className="w-3.5 h-3.5 opacity-50" />
                                </div>

                                <div className="absolute left-0 top-full mt-1 w-64 bg-white rounded-lg shadow-lg border border-gray-200 p-3 z-10 
                                          invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-300
                                          cursor-default transform translate-y-1 group-hover:translate-y-0">
                                  {/* Extended hover area */}
                                  <div className="absolute -top-3 left-0 right-0 h-3 bg-transparent"></div>

                                  <label className="text-xs font-medium text-gray-500 mb-1 block">User Role</label>
                                  <div className="space-y-2">
                                    <button
                                      className="w-full text-left px-3 py-2 rounded bg-gray-50 hover:bg-purple-50 text-sm transition-colors"
                                      onClick={() => handleSearchChange('role', 'admin')}
                                    >
                                      Admin
                                    </button>
                                    <button
                                      className="w-full text-left px-3 py-2 rounded bg-gray-50 hover:bg-blue-50 text-sm transition-colors"
                                      onClick={() => handleSearchChange('role', 'user')}
                                    >
                                      User
                                    </button>
                                    <div className="relative">
                                      <Search className="w-4 h-4 absolute left-2.5 top-2.5 text-gray-400" />
                                      <input
                                        type="text"
                                        className="pl-8 w-full h-9 text-sm rounded-md border-gray-200 bg-white shadow-sm focus:border-amber-500 focus:ring-amber-500"
                                        placeholder="Custom role search..."
                                        value={searchTerms.role}
                                        onChange={(e) => handleSearchChange('role', e.target.value)}
                                      />
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Books Filter with improved hover */}
                              <div className="relative group hover:z-20">
                                <div className={`px-3 py-1.5 text-sm rounded-full border flex items-center gap-1 cursor-pointer transition-all ${searchTerms.books
                                  ? 'bg-blue-50 border-blue-200 text-blue-800'
                                  : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                                  }`}>
                                  <Book className="w-3.5 h-3.5 mr-1" />
                                  {searchTerms.books ? `Books: ${searchTerms.books}` : 'Books'}
                                  <ChevronDown className="w-3.5 h-3.5 opacity-50" />
                                </div>

                                <div className="absolute left-0 top-full mt-1 w-64 bg-white rounded-lg shadow-lg border border-gray-200 p-3 z-10 
                                          invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-300
                                          cursor-default transform translate-y-1 group-hover:translate-y-0">
                                  {/* Extended hover area */}
                                  <div className="absolute -top-3 left-0 right-0 h-3 bg-transparent"></div>

                                  <label className="text-xs font-medium text-gray-500 mb-1 block">Book Count</label>
                                  <div className="space-y-2">
                                    <button
                                      className="w-full text-left px-3 py-2 rounded bg-gray-50 hover:bg-blue-50 text-sm transition-colors"
                                      onClick={() => handleSearchChange('books', '0')}
                                    >
                                      No books (0)
                                    </button>
                                    <button
                                      className="w-full text-left px-3 py-2 rounded bg-gray-50 hover:bg-blue-50 text-sm transition-colors"
                                      onClick={() => handleSearchChange('books', '')}
                                    >
                                      Any number
                                    </button>
                                    <div className="relative">
                                      <Search className="w-4 h-4 absolute left-2.5 top-2.5 text-gray-400" />
                                      <input
                                        type="text"
                                        className="pl-8 w-full h-9 text-sm rounded-md border-gray-200 bg-white shadow-sm focus:border-amber-500 focus:ring-amber-500"
                                        placeholder="Enter book count..."
                                        value={searchTerms.books}
                                        onChange={(e) => handleSearchChange('books', e.target.value)}
                                      />
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Status Filter with improved hover */}
                              <div className="relative group hover:z-20">
                                <div className={`px-3 py-1.5 text-sm rounded-full border flex items-center gap-1 cursor-pointer transition-all ${searchTerms.status
                                  ? 'bg-green-50 border-green-200 text-green-800'
                                  : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                                  }`}>
                                  <span className={`w-2 h-2 rounded-full ${searchTerms.status === 'ACTIVE'
                                    ? 'bg-green-500'
                                    : searchTerms.status === 'blocked' || searchTerms.status === 'REJECTED'
                                      ? 'bg-red-500'
                                      : searchTerms.status === 'PENDING_APPROVAL'
                                        ? 'bg-yellow-500'
                                        : searchTerms.status === 'PENDING_PAYMENT'
                                          ? 'bg-blue-500'
                                          : 'bg-gray-300'
                                    }`}></span>
                                  {searchTerms.status ? `Status: ${searchTerms.status}` : 'Status'}
                                  <ChevronDown className="w-3.5 h-3.5 opacity-50" />
                                </div>

                                <div className="absolute left-0 top-full mt-1 w-64 bg-white rounded-lg shadow-lg border border-gray-200 p-3 z-10 
                                          invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-500
                                          cursor-default transform translate-y-1 group-hover:translate-y-0">
                                  {/* Extended hover area */}
                                  <div className="absolute -top-3 left-0 right-0 h-3 bg-transparent"></div>

                                  <label className="text-xs font-medium text-gray-500 mb-1 block">User Status</label>
                                  <div className="space-y-2">
                                    <button
                                      className="w-full text-left px-3 py-2 rounded flex items-center bg-gray-50 hover:bg-green-50 text-sm transition-colors"
                                      onClick={() => handleSearchChange('status', 'ACTIVE')}
                                    >
                                      <span className="w-3 h-3 rounded-full bg-green-500 mr-2"></span>
                                      Active Users
                                    </button>
                                    <button
                                      className="w-full text-left px-3 py-2 rounded flex items-center bg-gray-50 hover:bg-red-50 text-sm transition-colors"
                                      onClick={() => handleSearchChange('status', 'blocked')}
                                    >
                                      <span className="w-3 h-3 rounded-full bg-red-500 mr-2"></span>
                                      Blocked Users
                                    </button>
                                    <button
                                      className="w-full text-left px-3 py-2 rounded flex items-center bg-gray-50 hover:bg-yellow-50 text-sm transition-colors"
                                      onClick={() => handleSearchChange('status', 'PENDING_APPROVAL')}
                                    >
                                      <span className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></span>
                                      Pending Approval
                                    </button>
                                    <button
                                      className="w-full text-left px-3 py-2 rounded flex items-center bg-gray-50 hover:bg-blue-50 text-sm transition-colors"
                                      onClick={() => handleSearchChange('status', 'PENDING_PAYMENT')}
                                    >
                                      <span className="w-3 h-3 rounded-full bg-blue-500 mr-2"></span>
                                      Pending Payment
                                    </button>
                                    <button
                                      className="w-full text-left px-3 py-2 rounded flex items-center bg-gray-50 hover:bg-red-50 text-sm transition-colors"
                                      onClick={() => handleSearchChange('status', 'REJECTED')}
                                    >
                                      <span className="w-3 h-3 rounded-full bg-red-500 mr-2"></span>
                                      Rejected Users
                                    </button>
                                    <button
                                      className="w-full text-left px-3 py-2 rounded flex items-center bg-gray-50 hover:bg-gray-100 text-sm transition-colors"
                                      onClick={() => handleSearchChange('status', '')}
                                    >
                                      <span className="w-3 h-3 rounded-full bg-gray-300 mr-2"></span>
                                      All Users
                                    </button>
                                  </div>
                                </div>
                              </div>

                              {/* Verification Filter with improved hover */}
                              <div className="relative group hover:z-20">
                                <div className={`px-3 py-1.5 text-sm rounded-full border flex items-center gap-1 cursor-pointer transition-all ${searchTerms.verified
                                  ? searchTerms.verified === 'verified' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-yellow-50 border-yellow-200 text-yellow-800'
                                  : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                                  }`}>
                                  <Check className={`w-3.5 h-3.5 mr-1 ${searchTerms.verified === 'verified' ? 'text-green-500' : searchTerms.verified === 'pending' ? 'text-yellow-500' : 'text-gray-400'}`} />
                                  {searchTerms.verified ? `Email: ${searchTerms.verified}` : 'Verification'}
                                  <ChevronDown className="w-3.5 h-3.5 opacity-50" />
                                </div>

                                <div className="absolute left-0 top-full mt-1 w-64 bg-white rounded-lg shadow-lg border border-gray-200 p-3 z-10 
                                          invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-500
                                          cursor-default transform translate-y-1 group-hover:translate-y-0">
                                  {/* Extended hover area */}
                                  <div className="absolute -top-3 left-0 right-0 h-3 bg-transparent"></div>

                                  <label className="text-xs font-medium text-gray-500 mb-1 block">Email Verification</label>
                                  <div className="space-y-2">
                                    <button
                                      className="w-full text-left px-3 py-2 rounded bg-gray-50 hover:bg-green-50 text-sm transition-colors flex items-center"
                                      onClick={() => handleSearchChange('verified', 'verified')}
                                    >
                                      <Check className="w-4 h-4 text-green-500 mr-2" />
                                      Verified
                                    </button>
                                    <button
                                      className="w-full text-left px-3 py-2 rounded bg-gray-50 hover:bg-yellow-50 text-sm transition-colors flex items-center"
                                      onClick={() => handleSearchChange('verified', 'pending')}
                                    >
                                      <AlertCircle className="w-4 h-4 text-yellow-500 mr-2" />
                                      Pending
                                    </button>
                                    <button
                                      className="w-full text-left px-3 py-2 rounded bg-gray-50 hover:bg-amber-50 text-sm transition-colors"
                                      onClick={() => handleSearchChange('verified', '')}
                                    >
                                      All Verification Status
                                    </button>
                                  </div>
                                </div>
                              </div>

                              {/* Joined Date Filter with improved hover */}
                              <div className="relative group hover:z-20">
                                <div className={`px-3 py-1.5 text-sm rounded-full border flex items-center gap-1 cursor-pointer transition-all ${searchTerms.joined
                                  ? 'bg-amber-50 border-amber-200 text-amber-800'
                                  : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                                  }`}>
                                  <Calendar className="w-3.5 h-3.5 mr-1" />
                                  {searchTerms.joined ? `Joined: ${searchTerms.joined}` : 'Joined Date'}
                                  <ChevronDown className="w-3.5 h-3.5 opacity-50" />
                                </div>

                                <div className="absolute left-0 top-full mt-1 w-64 bg-white rounded-lg shadow-lg border border-gray-200 p-3 z-10 
                                          invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-500
                                          cursor-default transform translate-y-1 group-hover:translate-y-0">
                                  {/* Extended hover area */}
                                  <div className="absolute -top-3 left-0 right-0 h-3 bg-transparent"></div>

                                  <label className="text-xs font-medium text-gray-500 mb-1 block">Joined Date</label>
                                  <div className="space-y-2">
                                    <button
                                      className="w-full text-left px-3 py-2 rounded bg-gray-50 hover:bg-amber-50 text-sm transition-colors"
                                      onClick={() => handleSearchChange('joined', '2024')}
                                    >
                                      Year 2024
                                    </button>
                                    <button
                                      className="w-full text-left px-3 py-2 rounded bg-gray-50 hover:bg-amber-50 text-sm transition-colors"
                                      onClick={() => handleSearchChange('joined', '2025')}
                                    >
                                      Year 2025
                                    </button>
                                    <div className="relative">
                                      <Search className="w-4 h-4 absolute left-2.5 top-2.5 text-gray-400" />
                                      <input
                                        type="text"
                                        className="pl-8 w-full h-9 text-sm rounded-md border-gray-200 bg-white shadow-sm focus:border-amber-500 focus:ring-amber-500"
                                        placeholder="Month or year..."
                                        value={searchTerms.joined}
                                        onChange={(e) => handleSearchChange('joined', e.target.value)}
                                      />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Table */}
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Books Created</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined Date</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {paginatedUsers.length > 0 ? (
                                paginatedUsers.map((user) => (
                                  <tr key={user.user_id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <div className="flex items-center">
                                        <div className="flex-shrink-0 h-10 w-10">
                                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center text-amber-800 font-semibold shadow-sm">
                                            {user.user_name ? user.user_name.charAt(0).toUpperCase() : 'U'}
                                          </div>
                                        </div>
                                        <div className="ml-4">
                                          <div className="text-sm font-medium text-gray-900">{user.user_name || 'Unnamed User'}</div>
                                          <div className="text-sm text-gray-500">{user.user_email}</div>
                                        </div>
                                      </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-medium rounded-full ${user.user_role === 'admin'
                                        ? 'bg-purple-100 text-purple-800 border border-purple-200'
                                        : 'bg-blue-100 text-blue-800 border border-blue-200'
                                        }`}>
                                        {user.user_role === 'admin' ? (
                                          <><Shield className="mt-1 w-3 h-3 mr-1" /> Admin</>
                                        ) : (
                                          <><User className="mt-1 w-3 h-3 mr-1" /> User</>
                                        )}
                                      </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <div className="flex items-center">
                                        <Book className="w-4 h-4 mr-2 text-amber-500" />
                                        <span className="text-sm text-gray-900 font-medium">{user.bookCount || '0'}</span>
                                      </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                      {formatDate(user.user_createdAt)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <div className="flex items-center">
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${user.user_isBlocked
                                          ? 'bg-red-100 text-red-800'
                                          : user.user_status === 'ACTIVE'
                                            ? 'bg-green-100 text-green-800'
                                            : user.user_status === 'REJECTED'
                                              ? 'bg-red-100 text-red-800'
                                              : user.user_status === 'PENDING_PAYMENT'
                                                ? 'bg-blue-100 text-blue-800'
                                                : 'bg-yellow-100 text-yellow-800' // Default / Pending Approval
                                          }`}>
                                          <span className={`w-2 h-2 rounded-full mr-1.5 ${user.user_isBlocked
                                            ? 'bg-red-500'
                                            : user.user_status === 'ACTIVE'
                                              ? 'bg-green-500'
                                              : user.user_status === 'REJECTED'
                                                ? 'bg-red-500'
                                                : user.user_status === 'PENDING_PAYMENT'
                                                  ? 'bg-blue-500'
                                                  : 'bg-yellow-500'
                                            }`}></span>
                                          {user.user_isBlocked ? 'Blocked' : user.user_status || 'Inactive'}
                                        </span>
                                      </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                      <div className="flex justify-end gap-2">
                                        {user.user_status === 'REJECTED' && (
                                          <Button
                                            onClick={() => handleApprove(user.user_id)}
                                            disabled={processingId === user.user_id}
                                            size="sm"
                                            variant="outline"
                                            className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                          >
                                            Approve
                                          </Button>
                                        )}

                                        {user.user_isBlocked ? (
                                          <Button
                                            onClick={() => handleUnblockUser(user.user_id)}
                                            disabled={processingId === user.user_id}
                                            size="sm"
                                            variant="outline"
                                            className="text-gray-600 hover:text-gray-900 border-gray-300"
                                          >
                                            Unblock
                                          </Button>
                                        ) : (
                                          <Button
                                            onClick={() => handleBlockUser(user.user_id)}
                                            disabled={processingId === user.user_id || user.user_role === 'admin'}
                                            size="sm"
                                            variant="outline"
                                            className="text-red-500 hover:text-red-700 hover:bg-red-50 border-red-200"
                                          >
                                            Block
                                          </Button>
                                        )}
                                      </div>
                                    </td>
                                  </tr>
                                ))
                              ) : (
                                <tr>
                                  <td colSpan={6} className="px-6 py-12 text-center">
                                    <div className="flex flex-col items-center justify-center text-gray-500 space-y-3">
                                      <Search className="w-12 h-12 text-gray-300" />
                                      <p className="text-lg font-medium">No users found</p>
                                      <p className="text-sm max-w-md">No users match your search criteria. Try adjusting your filters.</p>
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>

                        {/* Pagination Controls */}
                        <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-white border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                          <div className="text-sm text-gray-500">
                            {filteredUsers.length > 0 ? (
                              <span>
                                Showing <span className="font-medium">{(currentPage - 1) * pageSize + 1}</span> to <span className="font-medium">{Math.min(currentPage * pageSize, filteredUsers.length)}</span> of <span className="font-medium">{filteredUsers.length}</span> users
                              </span>
                            ) : (
                              <span>No results</span>
                            )}
                          </div>

                          {filteredUsers.length > 0 && (
                            <div className="flex items-center gap-3">
                              <select
                                className="text-sm border-gray-200 rounded-md shadow-sm focus:border-amber-500 focus:ring-amber-500 bg-white"
                                value={pageSize}
                                onChange={(e) => {
                                  setPageSize(Number(e.target.value));
                                  setCurrentPage(1);
                                }}
                              >
                                <option value={10}>10 per page</option>
                                <option value={25}>25 per page</option>
                                <option value={50}>50 per page</option>
                                <option value={100}>100 per page</option>
                              </select>

                              <div className="flex rounded-md shadow-sm">
                                <button
                                  onClick={() => setCurrentPage(1)}
                                  disabled={currentPage === 1}
                                  className="px-2 py-1 rounded-l-md border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                                  </svg>
                                </button>

                                <button
                                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                  disabled={currentPage === 1}
                                  className="px-2 py-1 border-t border-b border-r border-gray-300 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                  </svg>
                                </button>

                                {/* Page Numbers */}
                                <div className="flex">
                                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                                    let pageNumber;
                                    if (totalPages <= 5) {
                                      pageNumber = i + 1;
                                    } else if (currentPage <= 3) {
                                      pageNumber = i + 1;
                                    } else if (currentPage >= totalPages - 2) {
                                      pageNumber = totalPages - 4 + i;
                                    } else {
                                      pageNumber = currentPage - 2 + i;
                                    }

                                    return (
                                      <button
                                        key={pageNumber}
                                        onClick={() => setCurrentPage(pageNumber)}
                                        className={`w-9 h-9 flex items-center justify-center border-t border-b border-r border-gray-300 ${currentPage === pageNumber
                                          ? 'bg-amber-500 text-white font-medium border-amber-500'
                                          : 'bg-white text-gray-600 hover:bg-gray-50'
                                          }`}
                                      >
                                        {pageNumber}
                                      </button>
                                    );
                                  })}
                                </div>

                                <button
                                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                  disabled={currentPage === totalPages || totalPages === 0}
                                  className="px-2 py-1 border-t border-b border-r border-gray-300 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                  </svg>
                                </button>

                                <button
                                  onClick={() => setCurrentPage(totalPages)}
                                  disabled={currentPage === totalPages || totalPages === 0}
                                  className="px-2 py-1 rounded-r-md border-t border-b border-r border-gray-300 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                                  </svg>
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="requests" className="mt-0">
                      <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
                        <div className="p-5 border-b border-gray-200 bg-gradient-to-r from-amber-50/30 to-white">
                          <h3 className="font-bold text-gray-900 flex items-center gap-2">
                            <UserPlus className="w-5 h-5 text-amber-500" />
                            Pending Requests
                          </h3>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined Date</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {newRequests.length > 0 ? (
                                newRequests.map((user) => (
                                  <tr key={user.user_id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <div className="flex items-center">
                                        <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-800 font-semibold uppercase">
                                          {user.user_name?.charAt(0) || 'U'}
                                        </div>
                                        <div className="ml-4">
                                          <div className="text-sm font-medium text-gray-900">{user.user_name}</div>
                                          <div className="text-sm text-gray-500">{user.user_email}</div>
                                        </div>
                                      </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                      {formatDate(user.user_createdAt)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                      <div className="flex justify-end gap-2">
                                        <Button
                                          size="sm"
                                          onClick={() => handleApprove(user.user_id)}
                                          disabled={processingId === user.user_id}
                                          className="bg-green-500 hover:bg-green-600 text-white flex items-center gap-1.5 h-9"
                                        >
                                          {processingId === user.user_id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                                          Approve
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="destructive"
                                          onClick={() => handleRejectClick(user.user_id)}
                                          disabled={processingId === user.user_id}
                                          className="flex items-center gap-1.5 h-9"
                                        >
                                          {processingId === user.user_id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <X className="w-3.5 h-3.5" />}
                                          Reject
                                        </Button>
                                      </div>
                                    </td>
                                  </tr>
                                ))
                              ) : (
                                <tr>
                                  <td colSpan={3} className="px-6 py-12 text-center text-gray-500">
                                    No pending requests found.
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      <CreateUserModal
        isOpen={isCreateUserModalOpen}
        onClose={() => setIsCreateUserModalOpen(false)}
      />
      <TokenSettingsModal
        isOpen={isTokenSettingsModalOpen}
        onClose={() => setIsTokenSettingsModalOpen(false)}
      />
      {/* Rejection Reason Modal */}
      <Dialog open={isRejectModalOpen} onOpenChange={setIsRejectModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Shield className="w-5 h-5" />
              Reject User Application
            </DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this user. This will be sent to them via email.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reason">Rejection Reason</Label>
              <Textarea
                id="reason"
                placeholder="e.g. Incomplete application details..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRejectModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmReject}
              disabled={!rejectionReason.trim() || processingId === userToReject}
            >
              {processingId === userToReject ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Rejecting...
                </>
              ) : (
                'Confirm Rejection'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default AnalyticsPage;
