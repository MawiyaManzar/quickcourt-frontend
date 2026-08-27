import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { queryClient } from './lib/queryClient';
import { AppRouter } from './router';
import './styles/design-system.css';

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppRouter />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            fontFamily: 'Inter, system-ui, sans-serif',
            fontSize: '14px',
            fontWeight: 500,
            borderRadius: '10px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
          },
          success: {
            iconTheme: { primary: '#16a34a', secondary: '#fff' },
            style: { borderLeft: '4px solid #16a34a' },
          },
          error: {
            iconTheme: { primary: '#dc2626', secondary: '#fff' },
            style: { borderLeft: '4px solid #dc2626' },
          },
        }}
      />
    </QueryClientProvider>
  );
}
