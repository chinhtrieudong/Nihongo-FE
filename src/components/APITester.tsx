import React, { useState } from 'react';
import { Button, Card, Typography, Space, message } from 'antd';
import axios from 'axios';

const { Title, Text } = Typography;

// Test component for API endpoints
const APITester: React.FC = () => {
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [results, setResults] = useState<Record<string, any>>({});

  const testEndpoint = async (endpointName: string, url: string) => {
    setLoading(prev => ({ ...prev, [endpointName]: true }));
    try {
      console.log(`🔍 Testing ${endpointName}...`);
      console.log(`📡 URL: ${url}`);

      const response = await axios.get(url);
      console.log(`✅ ${endpointName} Response:`, response.data);
      setResults(prev => ({ ...prev, [endpointName]: response.data }));
      message.success(`${endpointName} - Success!`);
    } catch (error: any) {
      console.error(`❌ ${endpointName} Error:`, error.response?.data || error.message);
      setResults(prev => ({
        ...prev,
        [endpointName]: {
          error: error.response?.data || error.message,
          status: error.response?.status
        }
      }));
      message.error(`${endpointName} - Failed!`);
    } finally {
      setLoading(prev => ({ ...prev, [endpointName]: false }));
    }
  };

  const endpoints = [
    {
      name: 'Lesson Detail Routing Test (URL: /lessons/1)',
      key: 'lesson_detail_routing',
      url: 'http://localhost:3000/lessons/1',
      description: 'Test that lesson detail pages work with lessonNumber URLs'
    },
    {
      name: 'Lesson Detail Routing Test (URL: /lessons/2)',
      key: 'lesson_detail_routing_2',
      url: 'http://localhost:3000/lessons/2',
      description: 'Test that lesson detail pages work with lessonNumber URLs'
    },
    {
      name: 'Grammar (/api/minna-json/lesson/1/grammar)',
      key: 'grammar',
      url: 'http://localhost:5000/api/minna-json/lesson/1/grammar'
    },
    {
      name: 'Kaiwa (/api/minna-json/lesson/1/kaiwa)',
      key: 'kaiwa',
      url: 'http://localhost:5000/api/minna-json/lesson/1/kaiwa'
    },
    {
      name: 'Mondai (/api/minna-json/lesson/1/mondai)',
      key: 'mondai',
      url: 'http://localhost:5000/api/minna-json/lesson/1/mondai'
    },
    {
      name: 'All Combined (/api/minna-json/lesson/1/all)',
      key: 'all',
      url: 'http://localhost:5000/api/minna-json/lesson/1/all'
    },
    {
      name: 'Invalid Lesson 400 (/api/minna-json/lesson/999/vocabulary)',
      key: 'invalid_lesson',
      url: 'http://localhost:5000/api/minna-json/lesson/999/vocabulary'
    },
    {
      name: 'Invalid Component 404 (/api/minna-json/lesson/1/invalid)',
      key: 'invalid_component',
      url: 'http://localhost:5000/api/minna-json/lesson/1/invalid'
    }
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <Title level={2}>🔍 API Endpoints Tester</Title>
      <Text className="text-secondary-600 dark:text-secondary-400 mb-6 block">
        Test các endpoint mới trong API_ENDPOINTS.md với base URL: /api/minna-json
      </Text>

      <Space orientation="vertical" size="large" className="w-full">
        {endpoints.map(endpoint => (
          <Card key={endpoint.key} className="w-full">
            <div className="flex items-center justify-between mb-4">
              <div>
                <Title level={4} className="!mb-1">
                  {endpoint.name}
                </Title>
                <Text className="text-xs text-secondary-500">{endpoint.url}</Text>
              </div>
              <Button
                type="primary"
                loading={loading[endpoint.key]}
                onClick={() => testEndpoint(endpoint.key, endpoint.url)}
              >
                Test
              </Button>
            </div>

            {results[endpoint.key] && (
              <div className="mt-4">
                <Text strong>Response:</Text>
                <pre className="mt-2 p-4 bg-secondary-50 dark:bg-secondary-900 rounded-lg overflow-auto text-xs max-h-96">
                  {JSON.stringify(results[endpoint.key], null, 2)}
                </pre>
              </div>
            )}
          </Card>
        ))}
      </Space>

      <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <Title level={4}>📋 Test Results</Title>
        <Text>Check browser console (F12) để xem detailed logs và network requests</Text>
        <br />
        <Text className="text-xs mt-2 block">
          Expected responses match format trong API_ENDPOINTS.md
        </Text>
      </div>
    </div>
  );
};

export default APITester;
