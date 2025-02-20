import Layout from '@/components/layout/Layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpenCheck,  Edit, Activity, User } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useGetAllStatsQuery } from '@/api/statsApi';
import { useUserMeQuery } from '@/api/userApi';
import { format, parseISO } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { useEffect } from 'react';

const HomePage = () => {
  const {data:statsData,refetch:refetchStats}:any = useGetAllStatsQuery();
  const { data:userData,refetch:refetchUser } = useUserMeQuery();

  // Format date safely
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'N/A';
    try {
      return format(parseISO(dateString), 'MMM dd, yyyy');
    } catch (error) {
      return 'Invalid Date';
    }
  };

  // Analytics data with conditional rendering based on user role
  const analyticsData = [
    userData?.role === 'admin' ? {
      id: 2,
      metric: 'Total Users',
      value: statsData?.users ?? 0,
      icon: <User className="h-6 w-6 text-amber-500" />,
      isAdmin: true
    } : {
      id: 2,
      metric: 'Welcome to AI Book Legacy',
      value: userData?.name ?? 'Guest User',
      subValue: userData?.email ?? 'No email provided',
      role: userData?.role ?? 'user',
      joinDate: userData?.createdAt,
      verificationStatus: userData?.isEmailVerified ?? false,
      icon: <User className="h-6 w-6 text-amber-500" />,
      isAdmin: false
    },
    {
      id: 1,
      metric: 'Total Books',
      value: statsData?.books ?? 0,
      icon: <BookOpenCheck className="h-6 w-6 text-amber-500" />,
    },
    // Conditional second card based on user role
   
  ];

  console.log('analyticsData', analyticsData);

 ;

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

useEffect(()=>{
  refetchStats();
  refetchUser();
},[])
  return (
    <Layout>
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          
        </div>

        {/* Analytics Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2 mb-8">
          {analyticsData.map((item) => (
            <Card
              key={item.id}
              className="p-6 bg-white rounded-lg shadow hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-semibold mb-2">{item.metric}</h2>
                  {item.id === 1 || (item.id === 2 && 'isAdmin' in item && item.isAdmin) ? (
                    // Total Books or Total Users display (for admin)
                    <p className="text-2xl font-bold text-amber-500">{item.value}</p>
                  ) : (
                    // User information display (for non-admin)
                    <div className="space-y-2">
                     
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span>Joined: {formatDate(item.joinDate)}</span>
                        <span>•</span>
                        <Badge variant={item.verificationStatus ? 'success' : 'warning'}>
                          {item.verificationStatus ? 'Verified' : 'Unverified'}
                        </Badge>
                      </div>
                    </div>
                  )}
                </div>
                <div className="p-3 bg-gray-100 rounded-full">{item.icon}</div>
              </div>
            </Card>
          ))}
        </div>

        {/* Chart Section */}
        <Card className="p-6 bg-white rounded-lg shadow mb-8">
          <h2 className="text-xl font-semibold mb-4">Books Created Over Time</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="books" fill="#F59E0B" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Recent Activity Section */}
        <Card className="p-6 bg-white rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-4">
                <BookOpenCheck className="h-6 w-6 text-amber-500" />
                <div>
                  <p className="font-medium">Created "The Lost City of Atlantis"</p>
                  <p className="text-sm text-gray-500">2 hours ago</p>
                </div>
              </div>
              <Button variant="outline" className="text-sm">
                View
              </Button>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-4">
                <Edit className="h-6 w-6 text-green-500" />
                <div>
                  <p className="font-medium">Edited "The Future of AI"</p>
                  <p className="text-sm text-gray-500">5 hours ago</p>
                </div>
              </div>
              <Button variant="outline" className="text-sm">
                View
              </Button>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-4">
                <Activity className="h-6 w-6 text-blue-500" />
                <div>
                  <p className="font-medium">Started "The Mystery of the Deep"</p>
                  <p className="text-sm text-gray-500">1 day ago</p>
                </div>
              </div>
              <Button variant="outline" className="text-sm">
                View
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </Layout>
  );
};

export default HomePage;