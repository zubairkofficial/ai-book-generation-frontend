import Layout from '@/components/layout/Layout';

const AIAssistantPage = () => {
  const aiAssistantData = [
    {
      id: 1,
      title: 'Generate Book Ideas',
      description: 'Use AI to generate unique book ideas based on your preferences.',
    },
    {
      id: 2,
      title: 'Character Development',
      description: 'Get suggestions for character names, traits, and backstories.',
    },
    {
      id: 3,
      title: 'World Building',
      description: 'Create immersive settings with AI-generated world-building tips.',
    },
  ];

  return (
    <Layout>
      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">AI Assistant</h1>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {aiAssistantData.map((item) => (
            <div
              key={item.id}
              className="p-4 bg-white rounded-md shadow hover:shadow-lg transition-shadow"
            >
              <h2 className="text-xl font-semibold mb-2">{item.title}</h2>
              <p className="text-gray-600">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default AIAssistantPage;
