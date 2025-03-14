import React, { useMemo } from 'react';
import Layout from '@/components/layout/Layout';
import { useGetAllUserAnalyticsQuery, UserAnalytics } from '@/api/analyticsApi';
import { Card } from '@/components/ui/card';
import { Loader2, BookOpen, PenTool, Users, BarChart3, Library, Clock, Search, Book, User, Shield, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, parseISO, isValid } from 'date-fns';

interface ProcessedAnalyticsData {
  totalBooks: number;
  totalUsers: number;
  activeUsers: number;
  adminUsers: number;
  mostActiveUser: UserAnalytics | null;
  users: UserAnalytics[];
}

const AnalyticsPage = () => {
  const { data: analyticsData, isLoading, isError, error } = useGetAllUserAnalyticsQuery();
console.log("analyticsData",analyticsData)
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
                    <BarChart3 className="w-8 h-8 mr-3 text-amber-500" />
                    User Analytics Dashboard
                  </h1>
                  <p className="text-sm text-gray-600">
                    Monitor user activity and book creation metrics
                  </p>
                </div>
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
                className="space-y-8"
              >
                {/* Statistics Cards */}
                <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                  {/* Total Users Card */}
                  <motion.div 
                    whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                    transition={{ duration: 0.2 }}
                    className="bg-gradient-to-br from-white to-blue-50 p-5 md:p-6 rounded-xl shadow-sm border border-gray-100 overflow-hidden relative"
                  >
                    <div className="absolute right-0 top-0 w-24 h-24 bg-blue-100 rounded-bl-full opacity-40"></div>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium text-gray-500 mb-1">Total Users</p>
                        <h3 className="text-2xl md:text-3xl font-bold text-gray-900">{processedData?.totalUsers || 0}</h3>
                      </div>
                      <div className="bg-blue-100 p-3 rounded-lg shadow-sm z-10">
                        <Users className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
                      </div>
                    </div>
                    <div className="mt-4 flex items-center text-xs md:text-sm">
                      <Shield className="w-4 h-4 mr-1 text-purple-500" />
                      <span className="text-gray-600">{processedData?.adminUsers || 0} admins</span>
                    </div>
                  </motion.div>

                  {/* Total Books Card */}
                  <motion.div 
                    whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                    transition={{ duration: 0.2 }}
                    className="bg-gradient-to-br from-white to-amber-50 p-5 md:p-6 rounded-xl shadow-sm border border-gray-100 overflow-hidden relative"
                  >
                    <div className="absolute right-0 top-0 w-24 h-24 bg-amber-100 rounded-bl-full opacity-40"></div>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium text-gray-500 mb-1">Total Books</p>
                        <h3 className="text-2xl md:text-3xl font-bold text-gray-900">{processedData?.totalBooks || 0}</h3>
                      </div>
                      <div className="bg-amber-100 p-3 rounded-lg shadow-sm z-10">
                        <BookOpen className="w-5 h-5 md:w-6 md:h-6 text-amber-600" />
                      </div>
                    </div>
                    <div className="mt-4 flex items-center text-xs md:text-sm">
                      <Book className="w-4 h-4 mr-1 text-amber-500" />
                      <span className="text-gray-600">Across all users</span>
                    </div>
                  </motion.div>

                  {/* Active Users Card */}
                  <motion.div 
                    whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                    transition={{ duration: 0.2 }}
                    className="bg-gradient-to-br from-white to-green-50 p-5 md:p-6 rounded-xl shadow-sm border border-gray-100 overflow-hidden relative"
                  >
                    <div className="absolute right-0 top-0 w-24 h-24 bg-green-100 rounded-bl-full opacity-40"></div>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium text-gray-500 mb-1">Active Users</p>
                        <h3 className="text-2xl md:text-3xl font-bold text-gray-900">{processedData?.activeUsers || 0}</h3>
                      </div>
                      <div className="bg-green-100 p-3 rounded-lg shadow-sm z-10">
                        <User className="w-5 h-5 md:w-6 md:h-6 text-green-600" />
                      </div>
                    </div>
                    <div className="mt-4 flex items-center text-xs md:text-sm">
                      <PenTool className="w-4 h-4 mr-1 text-green-500" />
                      <span className="text-gray-600">Creating content</span>
                    </div>
                  </motion.div>

                  {/* User Activity Card */}
                  <motion.div 
                    whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                    transition={{ duration: 0.2 }}
                    className="bg-gradient-to-br from-white to-purple-50 p-5 md:p-6 rounded-xl shadow-sm border border-gray-100 overflow-hidden relative"
                  >
                    <div className="absolute right-0 top-0 w-24 h-24 bg-purple-100 rounded-bl-full opacity-40"></div>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium text-gray-500 mb-1">Avg. Books per User</p>
                        <h3 className="text-2xl md:text-3xl font-bold text-gray-900">
                          {processedData && processedData.totalUsers > 0 
                            ? (processedData.totalBooks / processedData.totalUsers).toFixed(1) 
                            : '0'}
                        </h3>
                      </div>
                      <div className="bg-purple-100 p-3 rounded-lg shadow-sm z-10">
                        <BarChart3 className="w-5 h-5 md:w-6 md:h-6 text-purple-600" />
                      </div>
                    </div>
                    <div className="mt-4 flex items-center text-xs md:text-sm">
                      <Library className="w-4 h-4 mr-1 text-purple-500" />
                      <span className="text-gray-600">Engagement metric</span>
                    </div>
                  </motion.div>
                </section>

                {/* User Analytics Table */}
                <section>
                  <h2 className="text-xl font-semibold mb-6 text-gray-800 border-b pb-2">User Analytics</h2>
                  <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Books Created</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined Date</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email Verified</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {processedData?.users.map((user) => (
                            <tr key={user.user_id} className="hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="flex-shrink-0 h-10 w-10">
                                    <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-800 font-semibold">
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
                                <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  user.user_role === 'admin' 
                                    ? 'bg-purple-100 text-purple-800' 
                                    : 'bg-blue-100 text-blue-800'
                                }`}>
                                  {user.user_role === 'admin' ? 'Admin' : 'User'}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <BookOpen className="w-4 h-4 mr-2 text-amber-500" />
                                  <span className="text-sm text-gray-900 font-medium">{user.bookCount || '0'}</span>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {formatDate(user.user_createdAt)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  user.user_isEmailVerified 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {user.user_isEmailVerified ? 'Verified' : 'Pending'}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  parseInt(user.bookCount || '0', 10) > 0 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {parseInt(user.bookCount || '0', 10) > 0 ? 'Active' : 'Inactive'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </section>

                {/* Most Active User Card */}
                {processedData?.mostActiveUser && parseInt(processedData.mostActiveUser.bookCount || '0', 10) > 0 && (
                  <section>
                    <h2 className="text-xl font-semibold mb-6 text-gray-800 border-b pb-2">Top Contributor</h2>
                    <motion.div 
                      whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                      transition={{ duration: 0.2 }}
                      className="bg-gradient-to-br from-amber-50 to-amber-100 p-6 rounded-xl shadow-sm border border-amber-200 relative overflow-hidden"
                    >
                      <div className="absolute -right-10 -top-10 w-40 h-40 bg-amber-200 rounded-full opacity-30"></div>
                      <div className="flex flex-col sm:flex-row items-center sm:items-start relative z-10">
                        <div className="h-16 w-16 rounded-full bg-amber-200 flex items-center justify-center text-amber-800 font-bold text-xl shadow-md mb-4 sm:mb-0">
                          {processedData.mostActiveUser.user_name 
                            ? processedData.mostActiveUser.user_name.charAt(0).toUpperCase() 
                            : 'U'}
                        </div>
                        <div className="ml-0 sm:ml-6 text-center sm:text-left">
                          <h3 className="text-xl font-bold text-gray-900">{processedData.mostActiveUser.user_name || 'Unnamed User'}</h3>
                          <p className="text-sm text-gray-600">{processedData.mostActiveUser.user_email}</p>
                          <div className="mt-2 flex items-center justify-center sm:justify-start">
                            <div className="bg-amber-200 p-2 rounded-lg mr-3">
                              <BookOpen className="w-5 h-5 text-amber-700" />
                            </div>
                            <span className="text-md font-semibold text-amber-700">
                              {processedData.mostActiveUser.bookCount} books created
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </section>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </Layout>
  );
};

export default AnalyticsPage;
