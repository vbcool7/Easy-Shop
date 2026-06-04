
import './i18n/config.js';
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
const queryClient = new QueryClient();

const isProduction = import.meta.env.PROD;

createRoot(document.getElementById('root')).render(
  <QueryClientProvider client={queryClient}>
    <BrowserRouter basename={isProduction ? "/EasyShopAdmin" : "/"}>
      <App />
    </BrowserRouter>
  </QueryClientProvider>
)