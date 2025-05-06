
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { CRMProvider } from './contexts/CRMContext'
import { StatisticsProvider } from './contexts/StatisticsContext'
import { AppSettingsProvider } from './contexts/AppSettingsContext'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppSettingsProvider>
      <CRMProvider>
        <StatisticsProvider>
          <App />
        </StatisticsProvider>
      </CRMProvider>
    </AppSettingsProvider>
  </React.StrictMode>,
)
