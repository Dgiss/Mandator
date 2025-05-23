
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { initializeStorageBuckets } from './utils/supabase-storage-setup';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Initialize storage buckets with improved error handling
initializeStorageBuckets().catch((error) => {
  console.error("Failed to initialize storage buckets:", error);
  // Continue loading the app even if bucket initialization fails
  // The app can attempt to create buckets on-demand when needed
});

// Create a client
const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);
