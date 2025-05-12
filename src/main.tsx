
// We'll modify the main.tsx file to initialize our storage buckets
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { initializeStorageBuckets } from './utils/supabase-storage-setup';

// Initialize storage buckets
initializeStorageBuckets().catch(console.error);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
