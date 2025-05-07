
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { setupStorageBuckets } from './utils/supabase-storage-setup'

// Configuration initiale des buckets de stockage
setupStorageBuckets()
  .catch(console.error)
  .finally(() => {
    console.log('Application démarrée');
  });

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
