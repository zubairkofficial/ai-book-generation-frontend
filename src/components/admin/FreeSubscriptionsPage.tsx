import { useState, useMemo, useEffect } from 'react';
import { useGetFreeSubscriptionUsersQuery } from '@/api/userApi';
import { useCreateAndUpdateFreeSubscriptionMutation } from '@/api/subscriptionApi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatDate } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import Layout from '@/components/layout/Layout';
import { 
  Dialog, DialogContent, DialogDescription, 
  DialogFooter, DialogHeader, DialogTitle 
} from '@/components/ui/dialog';
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { format, addMonths } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarIcon, Check, Edit2, Loader2, RefreshCw, X, Search, ChevronDown, Gift } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { useToast } from '@/context/ToastContext';
import { ToastType } from '@/constant';

const FreeSubscriptionsPage = () => {
  const { data: users, isLoading, error, refetch } = useGetFreeSubscriptionUsersQuery();
  const [updateFreeSubscription, { isLoading: isUpdating }] = useCreateAndUpdateFreeSubscriptionMutation();
  const { addToast } = useToast();
  
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    totalTokens: 0,
    totalImages: 0,
    status: '',
    fullModelAccess: false
  });

  // Add these state variables
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerms, setSearchTerms] = useState({
    name: '',
    email: '',
    status: '',
    fullAccess: ''
  });

  useEffect(()=>{refetch()},[])
  // Filter users based on search criteria
  const filteredUsers = useMemo(() => {
    if (!users) return [];
    
    return users.filter(user => {
      const userName = (user.name || '').toLowerCase();
      const userEmail = (user.email || '').toLowerCase();
      const subscriptionStatus = user.userSubscription?.length > 0 
        ? user.userSubscription[0].status.toLowerCase() 
        : '';
      const hasFullAccess = user.userSubscription?.length > 0 
        ? (user.userSubscription[0].fullModelAccess ? 'enabled' : 'limited') 
        : '';
      
      return (
        (searchTerms.name === '' || userName.includes(searchTerms.name.toLowerCase())) &&
          (searchTerms.email === '' || userEmail.includes(searchTerms.email.toLowerCase())) &&
          (searchTerms.status === '' || subscriptionStatus === searchTerms.status.toLowerCase()) &&
          (searchTerms.fullAccess === '' || hasFullAccess === searchTerms.fullAccess.toLowerCase())
      );
    });
  }, [users, searchTerms]);

  // Calculate total pages
  const totalPages = Math.ceil((filteredUsers?.length || 0) / pageSize);

  // Get current page of data
  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredUsers.slice(startIndex, startIndex + pageSize);
  }, [filteredUsers, currentPage, pageSize]);

  // Handle search input change
  const handleSearchChange = (field: keyof typeof searchTerms, value: string) => {
    setSearchTerms(prev => ({ ...prev, [field]: value }));
    setCurrentPage(1); // Reset to first page when search changes
  };

  // Handle opening the edit dialog
  const handleEditSubscription = (user: any) => {
    setSelectedUser(user);
    
    if (!user.userSubscription || user.userSubscription.length === 0) {
      // Set default values for a new subscription
      setFormData({
        startDate: new Date().toISOString(),
        endDate: addMonths(new Date(), 1).toISOString(),
        totalTokens: 5000, // Default token limit
        totalImages: 100,  // Default image limit
        status: 'active',
        fullModelAccess: false
      });
    } else {
      // Use existing subscription data
      const subscription = user.userSubscription[0];
      setFormData({
        startDate: subscription.startDate,
        endDate: subscription.endDate,
        totalTokens: subscription.totalTokens,
        totalImages: subscription.totalImages,
        status: subscription.status,
        fullModelAccess: user.fullModelAccess || false
      });
    }
    
    setIsEditDialogOpen(true);
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!selectedUser) return;
    
    try {
      await updateFreeSubscription({
        userId: selectedUser.id,
        startDate: formData.startDate,
        endDate: formData.endDate,
        tokenLimit: formData.totalTokens,
        imageLimit: formData.totalImages,
        status: formData.status,
        fullModelAccess: formData.fullModelAccess
      }).unwrap();
      
      addToast(
        !selectedUser.userSubscription || selectedUser.userSubscription.length === 0
          ? "Subscription created successfully"
          : "Subscription updated successfully", 
        ToastType.SUCCESS
      );
      
      setIsEditDialogOpen(false);
      refetch(); // Refresh the data
    } catch (error: any) {
      addToast(error.message || "There was an error managing the subscription.", ToastType.ERROR);
    }
  };

  // Helper to extend subscription by 1 month
  const extendSubscriptionOneMonth = () => {
    if (!formData.endDate) return;
    const currentEndDate = new Date(formData.endDate);
    const newEndDate = addMonths(currentEndDate, 1);
    setFormData({
      ...formData,
      endDate: newEndDate.toISOString()
    });
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto p-4 flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-4">
            <Skeleton className="h-12 w-12 rounded-full mx-auto" />
            <Skeleton className="h-6 w-48 mx-auto" />
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="container mx-auto p-4 flex items-center justify-center min-h-[60vh]">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-red-700 max-w-md">
            <p className="text-lg font-medium mb-2">Error loading subscription data</p>
            <p className="text-sm">Please try refreshing the page or contact support if the problem persists.</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="w-full px-4 sm:px-6 md:px-8 py-6 max-w-[1400px] mx-auto">
        <Card className="w-full shadow-sm">
          <CardHeader className="bg-gradient-to-r from-amber-50 to-white border-b border-amber-100/50 px-4 sm:px-6 py-4 sm:py-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                
              <div>
              <div className="flex items-center">
        <Gift className="h-8 w-8 text-amber-500 mr-2" />
        <CardTitle className="text-xl sm:text-4xl font-bold">Free Subscription Users</CardTitle>
      </div>  <CardDescription className="text-sm mt-1">Manage users with active free subscriptions</CardDescription>
              </div>
              <Button 
                onClick={() => refetch()}
                variant="outline" 
                size="sm"
                className="flex items-center gap-1.5 border-amber-200 text-amber-700 whitespace-nowrap"
              >
                <RefreshCw className="h-4 w-4" />
                <span className="hidden sm:inline">Refresh</span>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="p-5 bg-gradient-to-r from-amber-50/50 to-white border-b border-gray-200">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
                <div className="text-sm text-gray-500">
                  {filteredUsers.length} {filteredUsers.length === 1 ? 'user' : 'users'} found
                </div>
                
                {/* Search Input */}
                <div className="relative w-full md:w-72">
      <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
      <input
        type="text"
        placeholder="Search by name or email..."
        className="pl-10 pr-4 w-full h-10 text-sm rounded-md border border-gray-300 bg-white shadow-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-500 transition duration-200 ease-in-out"
        value={searchTerms.name || searchTerms.email}
        onChange={(e) => {
          handleSearchChange('name', e.target.value);
          handleSearchChange('email', e.target.value);
        }}
        aria-label="Search by name or email"
      />
    </div>
              </div>

              {/* Filter Pills - Professional dropdown filters */}
              <div className="mt-4">
                <div className="flex items-center mb-2">
                  <span className="text-xs font-medium text-gray-500 mr-2">Filters:</span>
                  <button 
                    className="text-xs text-amber-600 hover:text-amber-800 font-medium flex items-center"
                    onClick={() => setSearchTerms({
                      name: '',
                      email: '',
                      status: '',
                      fullAccess: ''
                    })}
                  >
                    Clear All
                  </button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {/* Status Filter Pill */}
                  <div className="relative group hover:z-20">
                    <div className={`px-3 py-1.5 text-sm rounded-full border flex items-center gap-1 cursor-pointer transition-all ${
                      searchTerms.status 
                        ? 'bg-amber-50 border-amber-200 text-amber-800' 
                        : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                    }`}>
                      <span className={`w-2 h-2 rounded-full mr-2 ${
                        searchTerms.status === 'active' 
                          ? 'bg-green-500' 
                          : searchTerms.status === 'expired' 
                            ? 'bg-red-500' 
                            : 'bg-gray-300'
                      }`}></span>
                      {searchTerms.status ? `Status: ${searchTerms.status}` : 'Status'}
                      <ChevronDown className="w-3.5 h-3.5 opacity-50" />
                    </div>
                    
                    {/* Status Dropdown */}
                    <div className="absolute left-0 top-full mt-1 w-64 bg-white rounded-lg shadow-lg border border-gray-200 p-3 z-10 
                                  invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-300 
                                  cursor-default transform translate-y-1 group-hover:translate-y-0">
                      <div className="absolute -top-3 left-0 right-0 h-3 bg-transparent"></div>
                      
                      <label className="text-xs font-medium text-gray-500 mb-1 block">Subscription Status</label>
                      <div className="space-y-2">
                        <button 
                          className="w-full text-left px-3 py-2 rounded flex items-center bg-gray-50 hover:bg-green-50 text-sm transition-colors"
                          onClick={() => handleSearchChange('status', 'active')}
                        >
                          <span className="w-3 h-3 rounded-full bg-green-500 mr-2"></span>
                          Active
                        </button>
                        <button 
                          className="w-full text-left px-3 py-2 rounded flex items-center bg-gray-50 hover:bg-red-50 text-sm transition-colors"
                          onClick={() => handleSearchChange('status', 'expired')}
                        >
                          <span className="w-3 h-3 rounded-full bg-red-500 mr-2"></span>
                          Expired
                        </button>
                        <button 
                          className="w-full text-left px-3 py-2 rounded flex items-center bg-gray-50 hover:bg-gray-100 text-sm transition-colors"
                          onClick={() => handleSearchChange('status', 'cancelled')}
                        >
                          <span className="w-3 h-3 rounded-full bg-gray-400 mr-2"></span>
                          Cancelled
                        </button>
                        <button 
                          className="w-full text-left px-3 py-2 rounded flex items-center bg-gray-50 hover:bg-amber-50 text-sm transition-colors"
                          onClick={() => handleSearchChange('status', '')}
                        >
                          <span className="w-3 h-3 rounded-full bg-gray-300 mr-2"></span>
                          All Statuses
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Model Access Filter Pill */}
                  <div className="relative group hover:z-20">
                    <div className={`px-3 py-1.5 text-sm rounded-full border flex items-center gap-1 cursor-pointer transition-all ${
                      searchTerms.fullAccess
                        ? searchTerms.fullAccess === 'enabled' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-gray-100 border-gray-200 text-gray-700'
                        : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                    }`}>
                      <span className={`w-2 h-2 rounded-full mr-2 ${
                        searchTerms.fullAccess === 'enabled' 
                          ? 'bg-green-500' 
                          : searchTerms.fullAccess === 'limited' 
                            ? 'bg-gray-400' 
                            : 'bg-gray-300'
                      }`}></span>
                      {searchTerms.fullAccess ? `Access: ${searchTerms.fullAccess}` : 'Model Access'}
                      <ChevronDown className="w-3.5 h-3.5 opacity-50" />
                    </div>
                    
                    {/* Model Access Dropdown */}
                    <div className="absolute left-0 top-full mt-1 w-64 bg-white rounded-lg shadow-lg border border-gray-200 p-3 z-10 
                                  invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-300 
                                  cursor-default transform translate-y-1 group-hover:translate-y-0">
                      <div className="absolute -top-3 left-0 right-0 h-3 bg-transparent"></div>
                      
                      <label className="text-xs font-medium text-gray-500 mb-1 block">Model Access</label>
                      <div className="space-y-2">
                        <button 
                          className="w-full text-left px-3 py-2 rounded flex items-center bg-gray-50 hover:bg-green-50 text-sm transition-colors"
                          onClick={() => handleSearchChange('fullAccess', 'enabled')}
                        >
                          <span className="w-3 h-3 rounded-full bg-green-500 mr-2"></span>
                          Full Access Enabled
                        </button>
                        <button 
                          className="w-full text-left px-3 py-2 rounded flex items-center bg-gray-50 hover:bg-gray-100 text-sm transition-colors"
                          onClick={() => handleSearchChange('fullAccess', 'limited')}
                        >
                          <span className="w-3 h-3 rounded-full bg-gray-400 mr-2"></span>
                          Limited Access
                        </button>
                        <button 
                          className="w-full text-left px-3 py-2 rounded flex items-center bg-gray-50 hover:bg-amber-50 text-sm transition-colors"
                          onClick={() => handleSearchChange('fullAccess', '')}
                        >
                          <span className="w-3 h-3 rounded-full bg-gray-300 mr-2"></span>
                          All Access Types
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <Table className="min-w-full border-collapse">
                <TableHeader className="bg-amber-50">
                  <TableRow>
                    <TableHead className="font-semibold whitespace-nowrap px-3 sm:px-6">Name</TableHead>
                    <TableHead className="font-semibold whitespace-nowrap px-3 sm:px-6 hidden md:table-cell">Email</TableHead>
                    <TableHead className="font-semibold whitespace-nowrap px-3 sm:px-6 hidden lg:table-cell">Start Date</TableHead>
                    <TableHead className="font-semibold whitespace-nowrap px-3 sm:px-6 hidden lg:table-cell">End Date</TableHead>
                    <TableHead className="font-semibold whitespace-nowrap px-3 sm:px-6">Status</TableHead>
                    <TableHead className="font-semibold whitespace-nowrap px-3 sm:px-6 hidden xl:table-cell">Tokens Used</TableHead>
                    <TableHead className="font-semibold whitespace-nowrap px-3 sm:px-6 hidden lg:table-cell">Total Tokens</TableHead>
                    <TableHead className="font-semibold whitespace-nowrap px-3 sm:px-6 hidden xl:table-cell">Images Used</TableHead>
                    <TableHead className="font-semibold whitespace-nowrap px-3 sm:px-6 hidden lg:table-cell">Total Images</TableHead>
                    {/* <TableHead className="font-semibold whitespace-nowrap px-3 sm:px-6 hidden md:table-cell">Full Access</TableHead> */}
                    <TableHead className="font-semibold whitespace-nowrap px-3 sm:px-6">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedUsers && paginatedUsers.length > 0 ? (
                    paginatedUsers.map((user) => (
                      <TableRow key={user.id} className="hover:bg-amber-50/50 transition-colors">
                        <TableCell className="font-medium px-3 sm:px-6">
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-800 text-sm font-medium">
                              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                            </div>
                            <span className="hidden sm:inline">{user.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="px-3 sm:px-6 hidden md:table-cell">
                          <span className="truncate block max-w-[200px]" title={user.email}>{user.email}</span>
                        </TableCell>
                        <TableCell className="px-3 sm:px-6 hidden lg:table-cell">
                          {user.userSubscription?.length > 0
                            ? formatDate(user.userSubscription[0].startDate)
                            : "N/A"}
                        </TableCell>
                        <TableCell className="px-3 sm:px-6 hidden lg:table-cell">
                          {user.userSubscription?.length > 0
                            ? formatDate(user.userSubscription[0].endDate)
                            : "N/A"}
                        </TableCell>
                        <TableCell className="px-3 sm:px-6">
                          {user.userSubscription?.length > 0 ? (
                            <Badge variant={user.userSubscription[0].status === "active" ? "success" : "destructive"} className="whitespace-nowrap">
                              {user.userSubscription[0].status}
                            </Badge>
                          ) : (
                            "N/A"
                          )}
                        </TableCell>
                        <TableCell className="px-3 sm:px-6 hidden xl:table-cell">
                          {user.userSubscription?.length > 0
                            ? user.userSubscription[0].tokensUsed.toLocaleString()
                            : "0"}
                        </TableCell>
                        <TableCell className="px-3 sm:px-6 hidden lg:table-cell">
                          {user.userSubscription?.length > 0
                            ? user.userSubscription[0].totalTokens.toLocaleString()
                            : "0"}
                        </TableCell>
                        <TableCell className="px-3 sm:px-6 hidden xl:table-cell">
                          {user.userSubscription?.length > 0
                            ? user.userSubscription[0].imagesGenerated.toLocaleString()
                            : "0"}
                        </TableCell>
                        <TableCell className="px-3 sm:px-6 hidden lg:table-cell">
                          {user.userSubscription?.length > 0
                            ? user.userSubscription[0].totalImages.toLocaleString()
                            : "0"}
                        </TableCell>
                        {/* <TableCell className="px-3 sm:px-6 hidden md:table-cell">
                          {user.userSubscription?.length > 0 ? (
                            <Badge variant={user.userSubscription[0].fullModelAccess ? "success" : "outline"} className="flex items-center gap-1.5 whitespace-nowrap">
                              {user.fullModelAccess ? (
                                <>
                                  <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                  <span className="hidden sm:inline">Enabled</span>
                                </>
                              ) : (
                                <>
                                  <span className="w-2 h-2 rounded-full bg-gray-300"></span>
                                  <span className="hidden sm:inline">Limited</span>
                                </>
                              )}
                            </Badge>
                          ) : (
                            "N/A"
                          )}
                        </TableCell> */}
                        <TableCell className="px-3 sm:px-6">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditSubscription(user)}
                            className="hover:bg-amber-100 text-amber-700 p-2 h-auto"
                          >
                            <Edit2 className="h-4 w-4 sm:mr-1" />
                            <span className="hidden sm:inline">Edit</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={11} className="text-center py-8">
                        <div className="flex flex-col items-center justify-center text-gray-500 space-y-3 px-4">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <p className="text-lg font-medium">No subscriptions found</p>
                          <p className="text-sm max-w-md text-center">There are no users with free subscriptions in the system.</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Professional Pagination Controls */}
            <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-white border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
              {/* Page Status Information */}
              <div className="text-sm text-gray-500">
                {filteredUsers.length > 0 ? (
                  <span>
                    Showing <span className="font-medium">{(currentPage - 1) * pageSize + 1}</span> to <span className="font-medium">{Math.min(currentPage * pageSize, filteredUsers.length)}</span> of <span className="font-medium">{filteredUsers.length}</span> users
                  </span>
                ) : (
                  <span>No results</span>
                )}
              </div>
              
              {/* Right Side: Page Size + Navigation Controls */}
              {filteredUsers.length > 0 && (
                <div className="flex items-center gap-3">
                  {/* Page Size Selector */}
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
                  
                  {/* Pagination Navigation Buttons */}
                  <div className="flex rounded-md shadow-sm">
                    {/* First Page Button */}
                    <button 
                      onClick={() => setCurrentPage(1)}
                      disabled={currentPage === 1}
                      className="px-2 py-1 rounded-l-md border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                      </svg>
                    </button>
                    
                    {/* Previous Page Button */}
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
                            className={`w-9 h-9 flex items-center justify-center border-t border-b border-r border-gray-300 ${
                              currentPage === pageNumber
                                ? 'bg-amber-500 text-white font-medium border-amber-500'
                                : 'bg-white text-gray-600 hover:bg-gray-50'
                            }`}
                          >
                            {pageNumber}
                          </button>
                        );
                      })}
                    </div>
                    
                    {/* Next Page Button */}
                    <button 
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages || totalPages === 0}
                      className="px-2 py-1 border-t border-b border-r border-gray-300 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                    
                    {/* Last Page Button */}
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
          </CardContent>
        </Card>

        {/* Edit Subscription Dialog - Make responsive */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-md max-w-[95vw] p-0 overflow-hidden">
            <DialogHeader className="px-6 pt-6 pb-3">
              <DialogTitle className="text-xl font-semibold text-amber-800">
                Edit Free Subscription
              </DialogTitle>
              <DialogDescription>
                Update the subscription details for <span className="font-medium">{selectedUser?.name}</span>
              </DialogDescription>
            </DialogHeader>

            <div className="px-6 mb-4 pb-4 border-b">
              <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200">
                <div className={`w-2 h-2 rounded-full mr-2 ${
                  formData.status === 'active' 
                    ? 'bg-green-500' 
                    : formData.status === 'expired' 
                      ? 'bg-red-500' 
                      : 'bg-gray-500'
                }`}></div>
                <span className="text-sm font-medium text-amber-800">
                  Editing subscription {formData.status && `• ${formData.status.charAt(0).toUpperCase() + formData.status.slice(1)}`}
                </span>
              </div>
            </div>

            <div className="space-y-5 px-6 py-2 max-h-[60vh] overflow-y-auto">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="status" className="text-sm font-medium">Subscription Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger id="status" className="border-amber-200 focus:ring-amber-500">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="expired">Expired</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* <div className="flex items-center justify-between border p-3 rounded-md bg-amber-50/40">
                  <div className="space-y-0.5">
                    <Label htmlFor="fullModelAccess" className="text-sm font-medium">Full Model Access</Label>
                    <p className="text-xs text-gray-500">Allow user to access all AI and image models</p>
                  </div>
                  <Switch 
                    id="fullModelAccess"
                    checked={formData.fullModelAccess}
                    onCheckedChange={(checked) => setFormData({ ...formData, fullModelAccess: checked })}
                    className="data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500"
                  />
                </div> */}
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Subscription Period</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-gray-500">Start Date</Label>
                    <div className="relative">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal border-amber-200"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4 text-amber-500" />
                            {formData.startDate ? format(new Date(formData.startDate), 'PPP') : "Select date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={formData.startDate ? new Date(formData.startDate) : undefined}
                            onSelect={(date) => date && setFormData({ ...formData, startDate: date.toISOString() })}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs text-gray-500">End Date</Label>
                    <div className="relative">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal border-amber-200"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4 text-amber-500" />
                            {formData.endDate ? format(new Date(formData.endDate), 'PPP') : "Select date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={formData.endDate ? new Date(formData.endDate) : undefined}
                            onSelect={(date) => date && setFormData({ ...formData, endDate: date.toISOString() })}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                </div>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full mt-2 text-amber-600 border-amber-200 hover:bg-amber-50"
                  onClick={extendSubscriptionOneMonth}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Extend by 1 Month
                </Button>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Usage Limits</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="totalTokens" className="text-xs text-gray-500">Total Tokens</Label>
                    <Input
                      id="totalTokens"
                      type="number"
                      value={formData.totalTokens}
                      onChange={(e) => setFormData({ ...formData, totalTokens: parseInt(e.target.value) || 0 })}
                      className="border-amber-200 focus:border-amber-400"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="totalImages" className="text-xs text-gray-500">Total Images</Label>
                    <Input
                      id="totalImages"
                      type="number"
                      value={formData.totalImages}
                      onChange={(e) => setFormData({ ...formData, totalImages: parseInt(e.target.value) || 0 })}
                      className="border-amber-200 focus:border-amber-400"
                    />
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:justify-end px-6 py-4 mt-2 border-t">
              <Button 
                variant="outline" 
                onClick={() => setIsEditDialogOpen(false)}
                className="border-red-200 text-red-600 hover:bg-red-50 w-full sm:w-auto"
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button 
                onClick={handleSubmit}
                disabled={isUpdating}
                className="bg-amber-500 hover:bg-amber-600 text-white w-full sm:w-auto"
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default FreeSubscriptionsPage; 