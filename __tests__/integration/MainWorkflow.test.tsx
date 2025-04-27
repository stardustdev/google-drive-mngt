import React from 'react';
import { render, screen, fireEvent, waitFor } from '../mocks/testUtils';
import App from '../../client/src/App';
import { server } from '../mocks/server';
import { http, HttpResponse } from 'msw';
import { mockFiles, mockUser } from '../mocks/mockData';

// Mock all necessary hooks at once for the entire app integration test
jest.mock('../../client/src/hooks/useGoogleAuth', () => ({
  useGoogleAuth: () => ({
    user: mockUser,
    isLoading: false,
    isAuthenticated: true,
    login: jest.fn(),
    logout: jest.fn(),
  }),
}));

jest.mock('../../client/src/hooks/useFiles', () => ({
  useFiles: (folderId?: string) => {
    // Return different files based on the folder ID
    let filesToReturn = mockFiles;
    if (folderId) {
      filesToReturn = mockFiles.filter(file => file.parents?.includes(folderId));
    } else {
      filesToReturn = mockFiles.filter(file => file.parents?.includes('root'));
    }
    
    return {
      files: filesToReturn,
      isLoading: false,
      isError: false,
      error: null,
      refetch: jest.fn(),
      createFolder: {
        mutate: jest.fn().mockResolvedValue({
          id: 'new-folder-id',
          name: 'New Folder',
          mimeType: 'application/vnd.google-apps.folder',
        }),
        isPending: false,
      },
      deleteFile: {
        mutate: jest.fn().mockResolvedValue({ success: true }),
        isPending: false,
      },
      moveFile: {
        mutate: jest.fn().mockResolvedValue({ success: true }),
        isPending: false,
      },
      uploadFile: {
        mutate: jest.fn().mockResolvedValue({
          id: 'new-file-id',
          name: 'Uploaded File',
          mimeType: 'text/plain',
        }),
        isPending: false,
      },
    };
  },
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

jest.mock('../../client/src/hooks/useFileSharing', () => ({
  useFileSharing: () => ({
    permissions: [
      {
        id: 'permission-1',
        type: 'user',
        emailAddress: 'collaborator@example.com',
        role: 'reader',
      },
    ],
    isLoading: false,
    isError: false,
    shareWithUser: {
      mutate: jest.fn().mockResolvedValue({ success: true }),
      isPending: false,
    },
    removePermission: {
      mutate: jest.fn().mockResolvedValue({ success: true }),
      isPending: false,
    },
    refetchPermissions: jest.fn(),
  }),
}));

// Mock necessary browser APIs
window.URL.createObjectURL = jest.fn(() => 'blob:mock-url');
window.URL.revokeObjectURL = jest.fn();

describe('Main Application Workflow Integration', () => {
  beforeEach(() => {
    // Override any server handlers specifically for these integration tests
    server.use(
      http.get('/api/auth/user', () => {
        return HttpResponse.json(mockUser);
      })
    );
  });

  test('user can navigate between folders', async () => {
    render(<App />);
    
    // Wait for the file list to load
    await waitFor(() => {
      expect(screen.getByText('My Files')).toBeInTheDocument();
      expect(screen.getByText('Test Folder 1')).toBeInTheDocument();
    });
    
    // Open a folder by double-clicking
    const folderRow = screen.getByText('Test Folder 1').closest('tr');
    if (folderRow) {
      fireEvent.doubleClick(folderRow);
      
      // Wait for folder contents to be displayed
      await waitFor(() => {
        expect(screen.getByText('Folder Contents')).toBeInTheDocument();
      });
    }
    
    // Navigate back to root using breadcrumb
    const myDriveButton = screen.getByText('My Drive');
    fireEvent.click(myDriveButton);
    
    // Verify we're back at root
    await waitFor(() => {
      expect(screen.getByText('My Files')).toBeInTheDocument();
    });
  });

  test('user can switch between list and grid views', async () => {
    render(<App />);
    
    // Wait for the file list to load
    await waitFor(() => {
      expect(screen.getByText('Test Folder 1')).toBeInTheDocument();
    });
    
    // Verify we start in list view (table present)
    expect(screen.getByRole('table')).toBeInTheDocument();
    
    // Switch to grid view
    const gridViewButton = screen.getByRole('tab', { name: /grid/i });
    fireEvent.click(gridViewButton);
    
    // Verify grid view is active (table is gone, grid container present)
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    
    // Switch back to list view
    const listViewButton = screen.getByRole('tab', { name: /list/i });
    fireEvent.click(listViewButton);
    
    // Verify list view is active again
    expect(screen.getByRole('table')).toBeInTheDocument();
  });

  test('user can create a new folder', async () => {
    render(<App />);
    
    // Wait for the file list to load
    await waitFor(() => {
      expect(screen.getByText('My Files')).toBeInTheDocument();
    });
    
    // Click the new folder button
    const newFolderButton = screen.getByRole('button', { name: /new folder/i });
    fireEvent.click(newFolderButton);
    
    // Wait for the create folder modal to appear
    await waitFor(() => {
      expect(screen.getByText('Create New Folder')).toBeInTheDocument();
    });
    
    // Fill in the folder name
    const folderNameInput = screen.getByLabelText(/folder name/i);
    fireEvent.change(folderNameInput, { target: { value: 'Test New Folder' } });
    
    // Click the create button
    const createButton = screen.getByRole('button', { name: /^create$/i });
    fireEvent.click(createButton);
    
    // Modal should close after creation
    await waitFor(() => {
      expect(screen.queryByText('Create New Folder')).not.toBeInTheDocument();
    });
  });

  test('user can preview a file', async () => {
    render(<App />);
    
    // Wait for the file list to load
    await waitFor(() => {
      expect(screen.getByText('Test Document.docx')).toBeInTheDocument();
    });
    
    // Double click on a file row to preview
    const fileRow = screen.getByText('Test Document.docx').closest('tr');
    if (fileRow) {
      fireEvent.doubleClick(fileRow);
      
      // Wait for the preview modal to appear
      await waitFor(() => {
        expect(screen.getByText(/preview/i)).toBeInTheDocument();
      });
      
      // Close the preview modal
      const closeButton = screen.getByRole('button', { name: /close/i });
      fireEvent.click(closeButton);
      
      // Modal should close
      await waitFor(() => {
        expect(screen.queryByText(/preview/i)).not.toBeInTheDocument();
      });
    }
  });

  test('user can delete a file', async () => {
    render(<App />);
    
    // Wait for the file list to load
    await waitFor(() => {
      expect(screen.getByText('Test Document.docx')).toBeInTheDocument();
    });
    
    // Find a file row and open its context menu
    const fileRow = screen.getByText('Test Document.docx').closest('tr');
    if (fileRow) {
      // Find and click the more actions button
      const actionsButton = within(fileRow).getByRole('button', { name: /actions/i });
      fireEvent.click(actionsButton);
      
      // Wait for menu to appear and click delete option
      await waitFor(() => {
        const deleteOption = screen.getByText(/delete/i);
        fireEvent.click(deleteOption);
      });
      
      // Wait for delete confirmation modal
      await waitFor(() => {
        expect(screen.getByText(/Are you sure/i)).toBeInTheDocument();
      });
      
      // Click the delete button to confirm
      const deleteButton = screen.getByRole('button', { name: /^delete$/i });
      fireEvent.click(deleteButton);
      
      // Modal should close after deletion
      await waitFor(() => {
        expect(screen.queryByText(/Are you sure/i)).not.toBeInTheDocument();
      });
    }
  });

  test('user can see storage usage information', async () => {
    render(<App />);
    
    // Wait for the storage usage component to load
    await waitFor(() => {
      expect(screen.getByText(/1.0 GB of 15.0 GB used/i)).toBeInTheDocument();
    });
    
    // Check that the progress bar is visible
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });
});