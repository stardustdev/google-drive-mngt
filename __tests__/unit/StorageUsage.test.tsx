import React from 'react';
import { render, screen, waitFor } from '../mocks/testUtils';
import { StorageUsage } from '../../client/src/components/StorageUsage';
import { mockStorageInfo } from '../mocks/mockData';

// Mock the useStorageInfo hook
jest.mock('../../client/src/hooks/useStorageInfo', () => ({
  useStorageInfo: () => ({
    storageInfo: {
      usage: mockStorageInfo.usage,
      limit: mockStorageInfo.limit,
      usagePercentage: (mockStorageInfo.usage / mockStorageInfo.limit) * 100,
      formattedUsage: '1.0 GB',
      formattedLimit: '15.0 GB',
    },
    isLoading: false,
    isError: false,
  }),
}));

describe('StorageUsage Component', () => {
  test('renders storage usage information correctly', async () => {
    render(<StorageUsage />);
    
    // Check if storage usage text is displayed
    expect(screen.getByText(/1.0 GB of 15.0 GB used/)).toBeInTheDocument();
    
    // Check if progress bar is rendered
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toBeInTheDocument();
    
    // Progress value should reflect the percentage used
    expect(progressBar).toHaveAttribute('aria-valuenow', '6.67');
  });

  test('renders compact version when compact prop is true', async () => {
    render(<StorageUsage compact={true} />);
    
    // Compact version should just show the percentage or simplified text
    expect(screen.getByText(/1.0 GB/)).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  test('shows loading state while fetching storage info', async () => {
    // Override useStorageInfo mock for this test
    jest.spyOn(require('../../client/src/hooks/useStorageInfo'), 'useStorageInfo').mockImplementation(() => ({
      storageInfo: null,
      isLoading: true,
      isError: false,
    }));
    
    render(<StorageUsage />);
    
    // Check if loading text or spinner is displayed
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
    
    // Restore original mock
    jest.restoreAllMocks();
  });

  test('shows error state when there is an error fetching storage info', async () => {
    // Override useStorageInfo mock for this test
    jest.spyOn(require('../../client/src/hooks/useStorageInfo'), 'useStorageInfo').mockImplementation(() => ({
      storageInfo: null,
      isLoading: false,
      isError: true,
    }));
    
    render(<StorageUsage />);
    
    // Check if error text is displayed
    expect(screen.getByText(/error/i)).toBeInTheDocument();
    
    // Restore original mock
    jest.restoreAllMocks();
  });

  test('shows zero usage when storageInfo.usage is zero', async () => {
    // Override useStorageInfo mock for this test
    jest.spyOn(require('../../client/src/hooks/useStorageInfo'), 'useStorageInfo').mockImplementation(() => ({
      storageInfo: {
        usage: 0,
        limit: mockStorageInfo.limit,
        usagePercentage: 0,
        formattedUsage: '0 B',
        formattedLimit: '15.0 GB',
      },
      isLoading: false,
      isError: false,
    }));
    
    render(<StorageUsage />);
    
    // Check if zero usage text is displayed
    expect(screen.getByText(/0 B of 15.0 GB used/)).toBeInTheDocument();
    
    // Progress value should be 0
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0');
    
    // Restore original mock
    jest.restoreAllMocks();
  });
});