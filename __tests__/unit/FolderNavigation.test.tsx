import React from 'react';
import { render, screen, fireEvent, waitFor } from '../mocks/testUtils';
import { FolderNavigation } from '../../client/src/components/FolderNavigation';
import { mockNestedFolders } from '../mocks/mockData';
import fetchMock from 'jest-fetch-mock';

// Mock the useToast hook
jest.mock('../../client/src/hooks/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}));

describe('FolderNavigation Component', () => {
  const mockNavigate = jest.fn();
  
  beforeEach(() => {
    fetchMock.resetMocks();
    mockNavigate.mockClear();
  });

  test('renders My Drive button when no folder is selected', () => {
    render(<FolderNavigation onNavigate={mockNavigate} />);
    
    // Check if My Drive button is displayed
    const myDriveButton = screen.getByText('My Drive');
    expect(myDriveButton).toBeInTheDocument();
    
    // No breadcrumbs should be displayed
    expect(screen.queryByText('Parent Folder')).not.toBeInTheDocument();
  });

  test('clicking My Drive button calls onNavigate with undefined', () => {
    render(<FolderNavigation onNavigate={mockNavigate} />);
    
    // Click the My Drive button
    const myDriveButton = screen.getByText('My Drive');
    fireEvent.click(myDriveButton);
    
    // Check if onNavigate was called correctly
    expect(mockNavigate).toHaveBeenCalledWith(undefined);
  });

  test('displays breadcrumbs for current folder', async () => {
    // Mock API responses for folder details
    fetchMock.mockResponseOnce(JSON.stringify(mockNestedFolders[2])); // Grandchild folder
    fetchMock.mockResponseOnce(JSON.stringify(mockNestedFolders[1])); // Child folder
    fetchMock.mockResponseOnce(JSON.stringify(mockNestedFolders[0])); // Parent folder
    
    render(<FolderNavigation currentFolderId="folder-grandchild" onNavigate={mockNavigate} />);
    
    // Wait for breadcrumbs to be loaded
    await waitFor(() => {
      expect(screen.getByText('Grandchild Folder')).toBeInTheDocument();
    });
    
    // Check if all breadcrumbs are displayed in correct order
    await waitFor(() => {
      expect(screen.getByText('My Drive')).toBeInTheDocument();
      expect(screen.getByText('Parent Folder')).toBeInTheDocument();
      expect(screen.getByText('Child Folder')).toBeInTheDocument();
      expect(screen.getByText('Grandchild Folder')).toBeInTheDocument();
    });
  });

  test('clicking on a breadcrumb folder navigates to that folder', async () => {
    // Mock API responses for folder details
    fetchMock.mockResponseOnce(JSON.stringify(mockNestedFolders[2])); // Grandchild folder
    fetchMock.mockResponseOnce(JSON.stringify(mockNestedFolders[1])); // Child folder
    fetchMock.mockResponseOnce(JSON.stringify(mockNestedFolders[0])); // Parent folder
    
    render(<FolderNavigation currentFolderId="folder-grandchild" onNavigate={mockNavigate} />);
    
    // Wait for breadcrumbs to be loaded
    await waitFor(() => {
      expect(screen.getByText('Child Folder')).toBeInTheDocument();
    });
    
    // Click on the Child Folder breadcrumb
    const childFolderBreadcrumb = screen.getByText('Child Folder');
    fireEvent.click(childFolderBreadcrumb);
    
    // Check if onNavigate was called with the correct folder ID
    expect(mockNavigate).toHaveBeenCalledWith('folder-child');
  });

  test('displays loading state while fetching folder details', async () => {
    // Delay the API response to show loading state
    fetchMock.mockResponseOnce(() => 
      new Promise(resolve => 
        setTimeout(() => resolve(JSON.stringify(mockNestedFolders[0])), 100)
      )
    );
    
    render(<FolderNavigation currentFolderId="folder-parent" onNavigate={mockNavigate} />);
    
    // Check if loading indicator is displayed
    expect(screen.getByText('Loading path...')).toBeInTheDocument();
    
    // Wait for breadcrumbs to be loaded
    await waitFor(() => {
      expect(screen.getByText('Parent Folder')).toBeInTheDocument();
    });
    
    // Loading indicator should disappear
    expect(screen.queryByText('Loading path...')).not.toBeInTheDocument();
  });

  test('handles error when folder details cannot be fetched', async () => {
    // Mock API error response
    fetchMock.mockRejectOnce(new Error('Network error'));
    
    render(<FolderNavigation currentFolderId="invalid-folder-id" onNavigate={mockNavigate} />);
    
    // Wait for API request to complete
    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });
    
    // No breadcrumbs should be displayed
    expect(screen.queryByText(/Folder/)).not.toBeInTheDocument();
  });
});