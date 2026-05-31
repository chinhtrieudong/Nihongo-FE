import React, { useState } from 'react';
import { Button, Card, List, Spin, Alert } from 'antd';
import { API_ENDPOINTS } from '../services/api';

const ApiTest: React.FC = () => {
  const [results, setResults] = useState<{ endpoint: string; status: string; data?: any }[]>([]);
  const [loading, setLoading] = useState(false);

  const testEndpoint = async (name: string, url: string) => {
    try {
      const response = await fetch(url);
      const data = await response.json();
      setResults(prev => [...prev, { endpoint: name, status: `${response.status} ${response.statusText}`, data }]);
    } catch (error: any) {
      setResults(prev => [...prev, { endpoint: name, status: 'Error', data: error.message }]);
    }
  };

  const runTests = async () => {
    setLoading(true);
    setResults([]);

    const tests = [
      { name: 'Health', url: '/health' },
      { name: 'Grammar List', url: API_ENDPOINTS.GRAMMAR.LIST },
      { name: 'Grammar Search', url: `${API_ENDPOINTS.GRAMMAR.SEARCH}?q=desu` },
      { name: 'Pronunciation Categories', url: API_ENDPOINTS.PRONUNCIATION.CATEGORIES },
      { name: 'Lessons', url: API_ENDPOINTS.LESSONS.LIST },
      { name: 'Kanji List', url: API_ENDPOINTS.KANJI.LIST },
    ];

    for (const test of tests) {
      await testEndpoint(test.name, test.url);
    }

    setLoading(false);
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">API Endpoint Test</h1>
      <Button onClick={runTests} loading={loading} type="primary">
        Run All Tests
      </Button>
      
      <div className="mt-6">
        <List
          dataSource={results}
          renderItem={(item) => (
            <Card className="mb-2">
              <div className="font-semibold">{item.endpoint}</div>
              <div className={item.status.startsWith('2') ? 'text-green-600' : 'text-red-600'}>
                Status: {item.status}
              </div>
              <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto max-h-40">
                {JSON.stringify(item.data, null, 2)}
              </pre>
            </Card>
          )}
        />
      </div>
    </div>
  );
};

export default ApiTest;
