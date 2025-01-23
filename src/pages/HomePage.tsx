import React from 'react';
import Layout from '@/components/layout/Layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpenCheck, Plus, Edit, Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { NavLink } from 'react-router-dom';

const HomePage = () => {
  // Sample analytics data
  const analyticsData = [
    {
      id: 1,
      metric: 'Books Created',
      value: 23,
      icon: <BookOpenCheck className="h-6 w-6 text-amber-500" />,
    },
    {
      id: 2,
      metric: 'Active Projects',
      value: 5,
      icon: <Activity className="h-6 w-6 text-blue-500" />,
    },
    {
      id: 3,
      metric: 'Total Edits',
      value: 128,
      icon: <Edit className="h-6 w-6 text-green-500" />,
    },
  ];

  // Sample chart data
  const chartData = [
    { name: 'Jan', books: 4 },
    { name: 'Feb', books: 6 },
    { name: 'Mar', books: 8 },
    { name: 'Apr', books: 5 },
    { name: 'May', books: 9 },
    { name: 'Jun', books: 7 },
  ];

  return (
    <Layout>
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          
        </div>

        {/* Analytics Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
          {analyticsData.map((item) => (
            <Card
              key={item.id}
              className="p-6 bg-white rounded-lg shadow hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold mb-2">{item.metric}</h2>
                  <p className="text-2xl font-bold text-amber-500">{item.value}</p>
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