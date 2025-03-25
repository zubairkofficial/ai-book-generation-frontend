import Layout from '@/components/layout/Layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpenCheck,  Edit, Activity, User, Users, BookOpen, BarChart3, Library, PenTool, Star, Check } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LabelList } from 'recharts';
import { useGetAllStatsQuery } from '@/api/statsApi';
import { useUserMeQuery, useGetUserStatsQuery } from '@/api/userApi';
import { format, parseISO } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { useEffect, useMemo } from 'react';
import { useGetAllUserAnalyticsQuery } from '@/api/analyticsApi';
import { motion } from 'framer-motion';
import { Clock, Shield, Book } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useGetRecentActivityQuery } from '@/api/bookApi';
import { Skeleton } from '@/components/ui/skeleton';

// Update the interface to match the provided data structure




const HomePage = () => {
  const {data:statsData,refetch:refetchStats}:any = useGetAllStatsQuery();
  const { data:userData,refetch:refetchUser } = useUserMeQuery();
  const { data: userStatsData, refetch: refetchUserStats } = useGetUserStatsQuery();
  const { data: analyticsData } = useGetAllUserAnalyticsQuery();
  const { data: recentActivityData, isLoading: isLoadingActivity,refetch:refetchRecentActivity } = useGetRecentActivityQuery();
  const navigate = useNavigate();
  
  // Format date safely
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'N/A';
    try {
      return format(parseISO(dateString), 'MMM dd, yyyy');
    } catch (error) {
      return 'Invalid Date';
    }
  };

  // Add processed analytics data calculation
  const processedAnalytics = useMemo(() => {
    if (!analyticsData || !Array.isArray(analyticsData)) return null;
    
    const totalBooks = analyticsData.reduce((sum, user) => 
      sum + parseInt(user.bookCount || '0', 10), 0);
    
    const activeUsers = analyticsData.filter(user => 
      parseInt(user.bookCount || '0', 10) > 0).length;
    
    return {
      totalBooks,
      totalUsers: analyticsData.length,
      activeUsers,
      avgBooksPerUser: analyticsData.length > 0 
        ? (totalBooks / analyticsData.length).toFixed(1) 
        : '0'
    };
  }, [analyticsData]);

  // Add Most Active User calculation
  const mostActiveUser = useMemo(() => {
    if (!analyticsData || !Array.isArray(analyticsData)) return null;
    return [...analyticsData].sort((a, b) => 
      parseInt(b.bookCount || '0', 10) - parseInt(a.bookCount || '0', 10)
    )[0];
  }, [analyticsData]);

  // User-specific stats cards - Separated into welcome card and stat cards
  const getUserWelcomeCard = () => {
    if (!userData) return null;
    
    return {
      id: 1,
      metric: 'Welcome to AI Book Legacy',
      value: userData?.name ?? 'Guest User',
      subValue: userData?.email ?? 'No email provided',
      role: userData?.role ?? 'user',
      joinDate: userData?.createdAt,
      verificationStatus: userData?.isEmailVerified ?? false,
      icon: <User className="h-6 w-6 text-amber-500" />,
      isWelcomeCard: true
    };
  };
  
  const getUserStatCards = () => {
    if (!userStatsData) return [];
    
    return [
      {
        id: 2,
        metric: 'Total Books',
        value: userStatsData.stats.totalBooks ?? 0,
        icon: <BookOpenCheck className="h-6 w-6 text-amber-500" />,
        navigateTo: '/books',
        color: 'amber'
      },
      {
        id: 3,
        metric: 'Completed Books',
        value: userStatsData.stats.completed ?? 0,
        icon: <Check className="h-6 w-6 text-green-500" />,
        navigateTo: '/books',
        color: 'green'
      },
      {
        id: 4,
        metric: 'In Progress',
        value: userStatsData.stats.inProgress ?? 0,
        icon: <Edit className="h-6 w-6 text-blue-500" />,
        navigateTo: '/books',
        color: 'blue'
      }
    ];
  };

  // Admin-specific stats cards
  const getAdminStatsCards = () => {
    return [
      {
        id: 1,
        metric: 'Total Users',
        value: processedAnalytics?.totalUsers || 0,
        icon: <Users className="w-6 h-6 text-blue-600" />,
        bgcolor: 'from-white to-blue-50',
        iconbg: 'bg-blue-100',
        iconcolor: 'text-blue-600',
        navigateTo: '/analytics'
      },
      {
        id: 2,
        metric: 'Total Books',
        value: processedAnalytics?.totalBooks || 0,
        icon: <BookOpen className="w-6 h-6 text-amber-600" />,
        bgcolor: 'from-white to-amber-50',
        iconbg: 'bg-amber-100',
        iconcolor: 'text-amber-600',
        navigateTo: '/books'
      },
      {
        id: 3,
        metric: 'Active Users',
        value: processedAnalytics?.activeUsers || 0,
        icon: <PenTool className="w-6 h-6 text-green-600" />,
        bgcolor: 'from-white to-green-50',
        iconbg: 'bg-green-100',
        iconcolor: 'text-green-600',
        navigateTo: '/analytics'
      },
      {
        id: 4,
        metric: 'Avg Books/User',
        value: processedAnalytics?.avgBooksPerUser || 0,
        icon: <BarChart3 className="w-6 h-6 text-purple-600" />,
        bgcolor: 'from-white to-purple-50',
        iconbg: 'bg-purple-100',
        iconcolor: 'text-purple-600',
        navigateTo: '/analytics'
      }
    ];
  };

  // Get the appropriate cards based on user role
  const welcomeCard = userData?.role === 'admin' ? null : getUserWelcomeCard();
  const statCards = userData?.role === 'admin' ? getAdminStatsCards() : getUserStatCards();

  useEffect(() => {
    refetchStats();
    refetchUser();
    refetchRecentActivity()
    if (userData?.role === 'user') {
      refetchUserStats();
    }
  }, [userData?.role]);

  // Update to use chartData from statsData
  const chartData = statsData?.chartData || [
    { name: 'Jan', books: 0 },
    { name: 'Feb', books: 0 },
    { name: 'Mar', books: 0 },
    { name: 'Apr', books: 0 },
    { name: 'May', books: 0 },
    { name: 'Jun', books: 0 },
    { name: 'Jul', books: 0 },
    { name: 'Aug', books: 0 },
    { name: 'Sep', books: 0 },
    { name: 'Oct', books: 0 },
    { name: 'Nov', books: 0 },
    { name: 'Dec', books: 0 }
  ];

  // Helper function to format time ago
  const formatTimeAgo = (timestamp: string) => {
    if (!timestamp) return 'N/A';
    try {
      const date = parseISO(timestamp);
      const now = new Date();
      const diffInHours = Math.round(Math.abs(now.getTime() - date.getTime()) / (1000 * 60 * 60));
      
      if (diffInHours < 1) {
        return 'Just now';
      } else if (diffInHours < 24) {
        return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;
      } else {
        const days = Math.floor(diffInHours / 24);
        return `${days} ${days === 1 ? 'day' : 'days'} ago`;
      }
    } catch (error) {
      return 'Invalid date';
    }
  };

  // Function to get the appropriate icon based on action type
  const getActivityIcon = (actionType: string) => {
    switch(actionType.toLowerCase()) {
      case 'created':
        return <BookOpenCheck className="h-6 w-6 text-amber-500" />;
      case 'edited':
        return <Edit className="h-6 w-6 text-green-500" />;
      case 'started':
        return <Activity className="h-6 w-6 text-blue-500" />;
      default:
        return <Book className="h-6 w-6 text-gray-500" />;
    }
  };

  // Replace the existing renderRecentActivity function
  const renderRecentActivity = () => {
    if (isLoadingActivity) {
      return (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-4">
                <Skeleton className="h-6 w-6 rounded-full" />
                <div>
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-4 w-24 mt-2" />
                </div>
              </div>
              <Skeleton className="h-9 w-16 rounded-md" />
            </div>
          ))}
        </div>
      );
    }

    if (!recentActivityData?.data?.length) {
      return (
        <div className="p-8 text-center">
          <p className="text-gray-500">No recent activity found</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {recentActivityData.data.map((activity, index) => (
          <div key={`${activity.bookId}-${activity.actionType}-${index}`} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-4">
              {getActivityIcon(activity.actionType)}
              <div>
                <p className="font-medium">{activity.actionType} "{activity.bookTitle}"</p>
                <p className="text-sm text-gray-500">{formatTimeAgo(activity.timestamp)}</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              className="text-sm"
              onClick={() => navigate(`/book-modal?id=${activity.bookId}`)}
            >
              View
            </Button>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Layout>
      <div className="max-w-[1400px] mx-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          
        </div>
          {/* Enhanced Top Contributor Card */}
          {userData?.role === 'admin' && mostActiveUser && parseInt(mostActiveUser.bookCount || '0', 10) > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-white rounded-xl shadow-md border border-gray-100 p-6 mb-8 overflow-hidden relative"
          >
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-amber-100 rounded-full opacity-50 blur-xl"></div>
            <div className="absolute bottom-0 left-20 w-32 h-32 bg-amber-200/30 rounded-full blur-lg"></div>
            
            <div className="relative">
              <h2 className="text-xl font-semibold mb-6 text-gray-800 flex items-center">
             
               <Check className='rounded-full border-2 border-amber-600 bg-amber-100  w-5 h-5 text-amber-600 mr-2' />
                Top Contributor
              </h2>
              
              <div className="flex flex-col md:flex-row items-center gap-6 p-4 bg-gradient-to-r from-amber-50 to-transparent rounded-xl">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-300 to-amber-600 rounded-full blur-sm animate-pulse"></div>
                  <div className="h-24 w-24 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white font-bold text-3xl shadow-lg relative">
                    {mostActiveUser.user_name 
                      ? mostActiveUser.user_name.charAt(0).toUpperCase() 
                      : 'U'}
                  </div>
                  <div className="absolute -right-1 -bottom-1 bg-amber-100 p-1.5 rounded-full border-2 border-white">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-amber-600">
                       <Star className='w-5 h-5 text-amber-600' />
                    </svg>
                  </div>
                </div>
                
                <div className="text-center md:text-left flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{mostActiveUser.user_name || 'Unnamed User'}</h3>
                  <p className="text-sm text-gray-600 mb-4">{mostActiveUser.user_email}</p>
                  
                  <div className="flex items-center justify-center md:justify-start space-x-4">
                    <div className="flex items-center px-3 py-2 bg-amber-100 rounded-lg">
                      <BookOpen className="w-5 h-5 text-amber-600 mr-2" />
                      <span className="font-medium text-amber-800">{mostActiveUser.bookCount} Books</span>
                    </div>
                    
                    <div className="flex items-center px-3 py-2 bg-purple-100 rounded-lg">
                      <Clock className="w-5 h-5 text-purple-600 mr-2" />
                      <span className="font-medium text-purple-800">Active {formatDate(mostActiveUser.user_createdAt)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 md:mt-0">
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 shadow-sm">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-amber-600 mb-1">#1</div>
                      <div className="text-xs text-amber-700 uppercase font-semibold tracking-wider">Top Ranking</div>
                    </div>
                  </div>
                </div>
              </div>
              
             
            </div>
          </motion.div>
        )}
 
        {/* Welcome Card - Only for regular users */}
        {welcomeCard && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-r from-amber-50 to-white rounded-xl shadow-md border border-amber-100 p-6 mb-6 overflow-hidden relative"
          >
            <div className="absolute right-0 top-0 w-96 h-96 bg-amber-100 rounded-bl-full opacity-30 -mr-20 -mt-20"></div>
            <div className="absolute -left-12 -bottom-12 w-48 h-48 bg-amber-200 rounded-full opacity-20"></div>
            
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-8 relative z-10">
              <div className="bg-gradient-to-br from-amber-400 to-amber-600 h-16 w-16 md:h-20 md:w-20 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-white text-xl md:text-2xl font-bold">
                  {welcomeCard.value.charAt(0).toUpperCase()}
                </span>
              </div>
              
              <div className="flex-1">
                <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-1">{welcomeCard.metric}</h2>
                <p className="text-base md:text-lg font-semibold text-amber-700">{welcomeCard.value}</p>
                <p className="text-sm text-gray-600">{welcomeCard.subValue}</p>
                
                <div className="flex flex-wrap gap-2 mt-3">
                  <Badge variant="outline" className="bg-amber-50 border-amber-200 text-amber-700">
                    {welcomeCard.role}
                  </Badge>
                  {welcomeCard.verificationStatus && (
                    <Badge variant="outline" className="bg-green-50 border-green-200 text-green-700 flex items-center">
                      <Shield className="w-3 h-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                  <Badge variant="outline" className="bg-blue-50 border-blue-200 text-blue-700">
                    Joined: {formatDate(welcomeCard.joinDate)}
                  </Badge>
                </div>
              </div>
              
              <Button 
                variant="outline" 
                className="hidden md:flex bg-white hover:bg-amber-50 border-amber-200 text-amber-700"
                onClick={() => navigate('/settings')}
              >
                View Profile
              </Button>
            </div>
          </motion.div>
        )}

        {/* Stats Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-8">
          {statCards.map((card, index) => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + (index * 0.1) }}
              whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
              className={`bg-gradient-to-br ${
                card.color === 'green' ? 'from-white to-green-50 hover:from-green-50 hover:to-green-100' :
                card.color === 'blue' ? 'from-white to-blue-50 hover:from-blue-50 hover:to-blue-100' :
                'from-white to-amber-50 hover:from-amber-50 hover:to-amber-100'
              } p-6 rounded-xl shadow-sm border border-gray-100 cursor-pointer overflow-hidden relative`}
              onClick={() => card.navigateTo && navigate(card.navigateTo)}
            >
              <div className={`absolute -right-8 -top-8 w-24 h-24 rounded-full opacity-20 ${
                card.color === 'green' ? 'bg-green-200' :
                card.color === 'blue' ? 'bg-blue-200' :
                'bg-amber-200'
              }`}></div>
              
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">{card.metric}</p>
                  <h3 className="text-3xl font-bold text-gray-900">{card.value}</h3>
                </div>
                <div className={`${
                  card.color === 'green' ? 'bg-green-100 text-green-600' :
                  card.color === 'blue' ? 'bg-blue-100 text-blue-600' :
                  'bg-amber-100 text-amber-600'
                } p-3 rounded-lg shadow-sm z-10`}>
                  {card.icon}
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-100 flex items-center text-sm">
                <BookOpen className={`w-4 h-4 mr-1 ${
                  card.color === 'green' ? 'text-green-500' :
                  card.color === 'blue' ? 'text-blue-500' :
                  'text-amber-500'
                }`} />
                <span className="text-gray-600">
                  {card.color === 'green' ? 'Finished books' :
                   card.color === 'blue' ? 'Work in progress' :
                   'Your collection'}
                </span>
              </div>
            </motion.div>
          ))}
        </section>

        {/* Chart Section with Professional Design */}
        {userData?.role === 'admin' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-md border border-gray-100 p-6 mb-8 overflow-hidden"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                  <BarChart3 className="w-5 h-5 text-amber-500 mr-2" />
                  Books Created Over Time
                </h2>
                <p className="text-sm text-gray-500 mt-1">Your book creation activity over the past month</p>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className="flex items-center px-3 py-1.5 bg-amber-50 rounded-full">
                  <div className="w-3 h-3 bg-gradient-to-r from-amber-400 to-amber-600 rounded-full mr-2"></div>
                  <span className="text-xs font-medium text-amber-700">Books Created</span>
                </div>
              </div>
            </div>
            
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={chartData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
                >
                  {/* Background Grid */}
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                  
                  {/* X Axis with improved styling */}
                  <XAxis 
                    dataKey="name" 
                    tick={{ fill: '#6b7280', fontSize: 12 }}
                    tickLine={{ stroke: '#e5e7eb' }}
                    axisLine={{ stroke: '#e5e7eb' }}
                    padding={{ left: 10, right: 10 }}
                    angle={-45}
                    textAnchor="end"
                    height={70}
                  />
                  
                  {/* Y Axis with improved styling */}
                  <YAxis 
                    allowDecimals={false}
                    tick={{ fill: '#6b7280', fontSize: 12 }}
                    tickLine={{ stroke: '#e5e7eb' }}
                    axisLine={{ stroke: '#e5e7eb' }}
                    tickFormatter={(value) => value === 0 ? '0' : value}
                  />
                  
                  {/* Enhanced Tooltip */}
                  <Tooltip 
                    cursor={{ fill: 'rgba(245, 158, 11, 0.1)' }}
                    formatter={(value) => [`${value} books`, 'Created']}
                    labelFormatter={(date) => `Date: ${date}`}
                    contentStyle={{
                      backgroundColor: 'white',
                      borderRadius: '8px',
                      padding: '10px 14px',
                      border: '1px solid #fde68a',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                      fontFamily: 'system-ui'
                    }}
                    itemStyle={{ color: '#92400e' }}
                    labelStyle={{ color: '#1f2937', fontWeight: 'bold', marginBottom: '5px' }}
                  />
                  
                  {/* Bar with gradient and animation */}
                  <defs>
                    <linearGradient id="bookColorGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f59e0b" stopOpacity={1} />
                      <stop offset="100%" stopColor="#d97706" stopOpacity={0.8} />
                    </linearGradient>
                  </defs>
                  
                  <Bar 
                    dataKey="books" 
                    fill="url(#bookColorGradient)" 
                    radius={[6, 6, 0, 0]} 
                    barSize={30}
                    animationDuration={1500}
                    animationEasing="ease-in-out"
                  >
                    {/* Add a label on top of bars for better visibility */}
                    <LabelList 
                      dataKey="books" 
                      position="top" 
                      fill="#92400e" 
                      fontSize={11} 
                      formatter={(value: number) => (value > 0 ? value : '')}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            <div className="mt-4 text-center text-xs text-gray-500">
              <p>Hover over bars to see detailed information</p>
            </div>
          </motion.div>
        )}

      

        {/* Recent Activity with Enhanced Responsive Design */}
        {userData?.role === 'admin' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-md border border-gray-100 p-6"
          >
            <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
            {renderRecentActivity()}
          </motion.div>
        )}
      </div>
    </Layout>
  );
};

export default HomePage;