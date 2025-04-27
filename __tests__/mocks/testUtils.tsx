import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { mockUser } from './mockData';

// Create a custom render function that wraps components with necessary providers
interface CustomRenderOptions extends Omit<RenderOptions, 'queries'> {
  withAuth?: boolean;
}

// Create wrapper with providers
export function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}

// Mock the AppContext
jest.mock('../../client/src/lib/AppContext', () => ({
  useAppContext: () => ({
    user: mockUser,
    isLoading: false,
    isAuthenticated: true,
    login: jest.fn(),
    logout: jest.fn(),
  }),
  AppContextProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Custom render function
const customRender = (
  ui: ReactElement,
  options?: CustomRenderOptions
) => {
  const wrapper = createWrapper();
  return render(ui, { wrapper, ...options });
};

// Re-export everything from testing-library
export * from '@testing-library/react';

// Override render method
export { customRender as render };