import React from 'react';
import Layout from '@/components/layout/Layout';

const AnalyticsPage = () => {
  const analyticsData = [
    {
      id: 1,
      metric: 'Books Created',
      value: 23,
    },
    {
      id: 2,
      metric: 'Active Projects',
      value: 5,
    },
    {
      id: 3,
      metric: 'Total Edits',
      value: 128,
    },
  ];

  return (
    <Layout>
      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Analytics</h1>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {analyticsData.map((item) => (
            <div
              key={item.id}
              className="p-4 bg-white rounded-md shadow hover:shadow-lg transition-shadow"
            >
              <h2 className="text-xl font-semibold mb-2">{item.metric}</h2>
              <p className="text-2xl font-bold text-amber-500">{item.value}</p>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default AnalyticsPage;
