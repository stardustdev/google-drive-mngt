import React from 'react';
import { render, screen, fireEvent, waitFor } from '../mocks/testUtils';
import { CreateFolderModal } from '../../client/src/components/CreateFolderModal';
import { useFiles } from '../../client/src/hooks/useFiles';

// Mock the useFiles hook
jest.mock('../../client/src/hooks/useFiles', () => ({
  useFiles: jest.fn(),
}));

// Mock the useToast hook
jest.mock('../../client/src/hooks/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}));

describe('CreateFolderModal Component', () => {
  const mockCreateFolder = jest.fn().mockResolvedValue({
    id: 'new-folder-id',
    name: 'New Folder',
    mimeType: 'application/vnd.google-apps.folder',
  });
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default mocks
    (useFiles as jest.Mock).mockReturnValue({
      createFolder: {
        mutate: mockCreateFolder,
        isPending: false,
        isError: false,
        error: null,
      },
    });
  });

  test('renders null when isOpen is false', () => {
    const { container } = render(
      <CreateFolderModal 
        isOpen={false} 
        onClose={jest.fn()} 
        onCreateComplete={jest.fn()} 
      />
    );
    
    // Modal should not be in the document
    expect(container.firstChild).toBeNull();
  });

  test('renders modal with correct title and content when isOpen is true', () => {
    render(
      <CreateFolderModal 
        isOpen={true} 
        onClose={jest.fn()} 
        onCreateComplete={jest.fn()} 
      />
    );
    
    // Check if modal title is displayed
    expect(screen.getByText('Create New Folder')).toBeInTheDocument();
    
    // Check if form elements are displayed
    expect(screen.getByLabelText(/Folder Name/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Create/i })).toBeInTheDocument();
  });

  test('submits form with folder name when create button is clicked', async () => {
    const mockOnCreateComplete = jest.fn();
    
    render(
      <CreateFolderModal 
        isOpen={true} 
        onClose={jest.fn()} 
        onCreateComplete={mockOnCreateComplete} 
      />
    );
    
    // Fill in the folder name input
    const folderNameInput = screen.getByLabelText(/Folder Name/i);
    fireEvent.change(folderNameInput, { target: { value: 'Test Folder' } });
    
    // Click the create button
    const createButton = screen.getByRole('button', { name: /Create/i });
    fireEvent.click(createButton);
    
    // Wait for folder creation to complete
    await waitFor(() => {
      expect(mockCreateFolder).toHaveBeenCalledWith({
        name: 'Test Folder',
        parentId: undefined,
      });
      expect(mockOnCreateComplete).toHaveBeenCalled();
    });
  });

  test('uses parentFolderId when provided', async () => {
    const mockOnCreateComplete = jest.fn();
    const parentFolderId = 'parent-folder-id';
    
    render(
      <CreateFolderModal 
        isOpen={true} 
        onClose={jest.fn()} 
        onCreateComplete={mockOnCreateComplete}
        parentFolderId={parentFolderId}
      />
    );
    
    // Fill in the folder name input
    const folderNameInput = screen.getByLabelText(/Folder Name/i);
    fireEvent.change(folderNameInput, { target: { value: 'Test Folder' } });
    
    // Click the create button
    const createButton = screen.getByRole('button', { name: /Create/i });
    fireEvent.click(createButton);
    
    // Wait for folder creation to complete
    await waitFor(() => {
      expect(mockCreateFolder).toHaveBeenCalledWith({
        name: 'Test Folder',
        parentId: parentFolderId,
      });
    });
  });

  test('shows loading state while creating folder', async () => {
    // Mock the create folder function to delay its resolution
    let resolveCreate: (value: any) => void;
    const pendingPromise = new Promise(resolve => {
      resolveCreate = resolve;
    });
    
    const mockCreateFolderWithDelay = jest.fn().mockImplementation(() => pendingPromise);
    
    // Setup the mock to indicate that folder creation is in progress
    (useFiles as jest.Mock).mockReturnValue({
      createFolder: {
        mutate: mockCreateFolderWithDelay,
        isPending: true,
        isError: false,
        error: null,
      },
    });
    
    render(
      <CreateFolderModal 
        isOpen={true} 
        onClose={jest.fn()} 
        onCreateComplete={jest.fn()} 
      />
    );
    
    // Fill in the folder name input
    const folderNameInput = screen.getByLabelText(/Folder Name/i);
    fireEvent.change(folderNameInput, { target: { value: 'Test Folder' } });
    
    // Click the create button
    const createButton = screen.getByRole('button', { name: /Create/i });
    fireEvent.click(createButton);
    
    // Check if the button shows loading state
    expect(createButton).toBeDisabled();
    
    // Complete the folder creation
    resolveCreate!({
      id: 'new-folder-id',
      name: 'Test Folder',
      mimeType: 'application/vnd.google-apps.folder',
    });
  });

  test('validates that folder name is required', async () => {
    render(
      <CreateFolderModal 
        isOpen={true} 
        onClose={jest.fn()} 
        onCreateComplete={jest.fn()} 
      />
    );
    
    // Click the create button without entering a name
    const createButton = screen.getByRole('button', { name: /Create/i });
    fireEvent.click(createButton);
    
    // Check if validation error is displayed
    await waitFor(() => {
      expect(screen.getByText(/required/i)).toBeInTheDocument();
    });
    
    // CreateFolder function should not be called
    expect(mockCreateFolder).not.toHaveBeenCalled();
  });

  test('handles errors when folder creation fails', async () => {
    // Mock the create folder function to reject with an error
    const mockCreateFolderWithError = jest.fn().mockRejectedValue(new Error('Creation failed'));
    
    // Setup the mock to indicate an error state
    (useFiles as jest.Mock).mockReturnValue({
      createFolder: {
        mutate: mockCreateFolderWithError,
        isPending: false,
        isError: true,
        error: new Error('Creation failed'),
      },
    });
    
    render(
      <CreateFolderModal 
        isOpen={true} 
        onClose={jest.fn()} 
        onCreateComplete={jest.fn()} 
      />
    );
    
    // Fill in the folder name input
    const folderNameInput = screen.getByLabelText(/Folder Name/i);
    fireEvent.change(folderNameInput, { target: { value: 'Test Folder' } });
    
    // Click the create button
    const createButton = screen.getByRole('button', { name: /Create/i });
    fireEvent.click(createButton);
    
    // Wait for error state
    await waitFor(() => {
      expect(screen.getByText(/failed/i)).toBeInTheDocument();
    });
  });

  test('calls onClose when cancel button is clicked', () => {
    const mockCloseHandler = jest.fn();
    
    render(
      <CreateFolderModal 
        isOpen={true} 
        onClose={mockCloseHandler} 
        onCreateComplete={jest.fn()} 
      />
    );
    
    // Find and click the cancel button
    const cancelButton = screen.getByRole('button', { name: /Cancel/i });
    fireEvent.click(cancelButton);
    
    // Check if onClose was called
    expect(mockCloseHandler).toHaveBeenCalled();
  });
});