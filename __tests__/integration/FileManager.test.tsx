import React from 'react';
import { render, screen, fireEvent, waitFor } from '../mocks/testUtils';
import FileManager from '../../client/src/components/FileManager';
import { mockFiles } from '../mocks/mockData';
import { server } from '../mocks/server';
import { http, HttpResponse } from 'msw';

// Mock the required hooks
jest.mock('../../client/src/hooks/useFiles', () => ({
  useFiles: (folderId?: string) => ({
    files: mockFiles,
    isLoading: false,
    isError: false,
    error: null,
    refetch: jest.fn(),
  }),
}));

jest.mock('../../client/src/hooks/useStorageInfo', () => ({
  useStorageInfo: () => ({
    storageInfo: {
      usage: 1073741824,
      limit: 15 * 1073741824,
      usagePercentage: 6.67,
      formattedUsage: '1.0 GB',
      formattedLimit: '15.0 GB',
    },
    isLoading: false,
    isError: false,
  }),
}));

describe('FileManager Component Integration', () => {
  test('renders FileManager with file list in table view by default', async () => {
    render(<FileManager />);
    
    // Check if "My Files" title is displayed
    expect(screen.getByText('My Files')).toBeInTheDocument();
    
    // Check if the file table is displayed
    expect(screen.getByRole('table')).toBeInTheDocument();
    
    // Check if files are displayed
    mockFiles.forEach(file => {
      expect(screen.getByText(file.name)).toBeInTheDocument();
    });
  });

  test('switches between table and grid views', async () => {
    render(<FileManager />);
    
    // Initially in table view
    expect(screen.getByRole('table')).toBeInTheDocument();
    
    // Find and click the grid view button
    const gridButton = screen.getByRole('tab', { name: /grid/i });
    fireEvent.click(gridButton);
    
    // Table should be replaced with grid
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(screen.getByRole('tab', { selected: true, name: /grid/i })).toBeInTheDocument();
    
    // Switch back to table view
    const listButton = screen.getByRole('tab', { name: /list/i });
    fireEvent.click(listButton);
    
    // Should be back to table view
    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByRole('tab', { selected: true, name: /list/i })).toBeInTheDocument();
  });

  test('handles folder navigation', async () => {
    // Override MSW handler for folder contents specifically for this test
    server.use(
      http.get('/api/drive/folders/:folderId/files', () => {
        return HttpResponse.json([
          {
            id: 'subfolder-1',
            name: 'Subfolder',
            mimeType: 'application/vnd.google-apps.folder',
            modifiedTime: '2023-01-03T12:00:00Z',
            parents: ['folder-1'],
          },
          {
            id: 'subfile-1',
            name: 'File in folder.txt',
            mimeType: 'text/plain',
            modifiedTime: '2023-01-04T12:00:00Z',
            size: '1024',
            parents: ['folder-1'],
          },
        ]);
      })
    );
    
    render(<FileManager />);
    
    // Find and double-click a folder
    const folderRow = screen.getByText('Test Folder 1').closest('tr');
    if (folderRow) {
      fireEvent.doubleClick(folderRow);
      
      // Wait for folder contents to load
      await waitFor(() => {
        expect(screen.getByText('Folder Contents')).toBeInTheDocument();
      });
    }
  });

  test('renders upload modal when upload button is clicked', () => {
    render(<FileManager />);
    
    // Find and click the upload button
    const uploadButton = screen.getByRole('button', { name: /upload/i });
    fireEvent.click(uploadButton);
    
    // Check if upload modal is displayed
    expect(screen.getByText('Upload Files')).toBeInTheDocument();
  });

  test('renders create folder modal when new folder button is clicked', () => {
    render(<FileManager />);
    
    // Find and click the new folder button
    const newFolderButton = screen.getByRole('button', { name: /new folder/i });
    fireEvent.click(newFolderButton);
    
    // Check if create folder modal is displayed
    expect(screen.getByText('Create New Folder')).toBeInTheDocument();
  });

  test('renders file preview modal when preview action is triggered', async () => {
    render(<FileManager />);
    
    // Find and double-click a file (not a folder)
    const fileRow = screen.getByText('Test Document.docx').closest('tr');
    if (fileRow) {
      fireEvent.doubleClick(fileRow);
      
      // Check if preview modal is displayed
      await waitFor(() => {
        expect(screen.getByText(/preview/i)).toBeInTheDocument();
      });
    }
  });

  test('shows empty state when no files are available', async () => {
    // Override useFiles mock for this specific test
    jest.spyOn(require('../../client/src/hooks/useFiles'), 'useFiles').mockImplementation(() => ({
      files: [],
      isLoading: false,
      isError: false,
      error: null,
      refetch: jest.fn(),
    }));
    
    render(<FileManager />);
    
    // Check if empty state message is displayed
    expect(screen.getByText(/Upload files to your Google Drive/)).toBeInTheDocument();
    
    // Restore original mock
    jest.restoreAllMocks();
  });

  test('shows loading state while fetching files', async () => {
    // Override useFiles mock for this specific test
    jest.spyOn(require('../../client/src/hooks/useFiles'), 'useFiles').mockImplementation(() => ({
      files: null,
      isLoading: true,
      isError: false,
      error: null,
      refetch: jest.fn(),
    }));
    
    render(<FileManager />);
    
    // Check if loading state is displayed
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
    
    // Restore original mock
    jest.restoreAllMocks();
  });

  test('shows error state when there is an error fetching files', async () => {
    // Override useFiles mock for this specific test
    jest.spyOn(require('../../client/src/hooks/useFiles'), 'useFiles').mockImplementation(() => ({
      files: null,
      isLoading: false,
      isError: true,
      error: new Error('Failed to load files'),
      refetch: jest.fn(),
    }));
    
    render(<FileManager />);
    
    // Check if error state is displayed
    expect(screen.getByText(/failed to load files/i)).toBeInTheDocument();
    
    // Restore original mock
    jest.restoreAllMocks();
  });
});