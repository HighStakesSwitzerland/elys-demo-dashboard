// src/App.tsx
import React, { useEffect, useState } from 'react';
import './App.css';
import axios from 'axios';

interface Transaction {
  id: string;
  message_types: string;
  success: boolean;
  chain_name: string;
  hash: string;
  height: number;
  memo: string;
  addresses: string[];
}

interface CategorizedTransactions {
  [key: string]: Transaction[];
}

const App: React.FC = () => {
  const [categorizedTransactions, setCategorizedTransactions] = useState<CategorizedTransactions>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await axios.get(`https://indexer.highstakes.ch/demo/api/transactions/bymessagetype`);

        const categorized: CategorizedTransactions = {};
        result.data.aggregations.message_types.buckets.forEach((bucket: any) => {
          categorized[bucket.key] = bucket.docs.hits.hits.reduce((acc: Transaction[], transaction: any) => {
            if (!Array.isArray(acc)) {
              acc = [];
            }
            acc.push(transaction._source);
            return acc;
          }, {});
        });


        setCategorizedTransactions(categorized);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to fetch data from Elasticsearch');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap' }}>
      {Object.keys(categorizedTransactions).map((messageType) => (
        <div key={messageType} style={{ margin: '10px', padding: '10px', width: '45%', border: '1px solid rgb(130 19 19)' }}>
          <h3 style={{color: 'red'}}>{messageType}</h3>
          {categorizedTransactions[messageType].map((transaction) => (
            <div key={transaction.id} style={{ border: '1px solid #ddd', margin: '5px', padding: '10px', borderRadius: '5px' }}>
              <p><strong>message_type:</strong> {transaction.message_types}</p>
              <p><strong>Success:</strong> {transaction.success ? 'Yes' : 'No'}</p>
              <p><strong>Chain Name:</strong> {transaction.chain_name}</p>
              <p><strong>Hash:</strong>
                <a href={`https://testnet.ping.pub/elys/tx/${transaction.hash}`} target="_blank" rel="noopener noreferrer">
                  {transaction.hash}
                </a></p>
              <p><strong>Height:</strong> {transaction.height}</p>
              <p><strong>Memo:</strong> {transaction.memo}</p>
              <p><strong>Addresses:</strong> {transaction.addresses.join(', ')}</p>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default App;