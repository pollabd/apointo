import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppContextProvider } from '../context/AppContext';
import { ToastContainer } from 'react-toastify';

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

export function renderWithProviders(ui) {
  const testQueryClient = createTestQueryClient();
  return {
    ...render(
      <QueryClientProvider client={testQueryClient}>
        <BrowserRouter>
          <AppContextProvider>
            <ToastContainer />
            {ui}
          </AppContextProvider>
        </BrowserRouter>
      </QueryClientProvider>
    ),
  };
}
