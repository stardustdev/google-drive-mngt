import React from 'react';
import { render, screen, fireEvent, waitFor } from '../mocks/testUtils';
import DeleteModal from '../../client/src/components/DeleteModal';
import { mockFiles } from '../mocks/mockData';
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

describe('DeleteModal Component', () => {
  const mockDeleteFile = jest.fn().mockResolvedValue({ success: true });
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default mocks
    (useFiles as jest.Mock).mockReturnValue({
      deleteFile: {
        mutate: mockDeleteFile,
        isPending: false,
        isError: false,
        error: null,
      },
    });
  });

  test('renders null when isOpen is false', () => {
    const { container } = render(
      <DeleteModal 
        isOpen={false} 
        onClose={jest.fn()} 
        file={mockFiles[2]} 
        onDeleteComplete={jest.fn()} 
      />
    );
    
    // Modal should not be in the document
    expect(container.firstChild).toBeNull();
  });

  test('renders modal with correct title and content when isOpen is true', () => {
    render(
      <DeleteModal 
        isOpen={true} 
        onClose={jest.fn()} 
        file={mockFiles[2]} 
        onDeleteComplete={jest.fn()} 
      />
    );
    
    // Check if confirmation text is displayed
    expect(screen.getByText(/Are you sure/i)).toBeInTheDocument();
    expect(screen.getByText(/Test Document.docx/i)).toBeInTheDocument();
    
    // Check if buttons are present
    expect(screen.getByRole('button', { name: /Cancel/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Delete/i })).toBeInTheDocument();
  });

  test('calls onClose when cancel button is clicked', () => {
    const mockCloseHandler = jest.fn();
    
    render(
      <DeleteModal 
        isOpen={true} 
        onClose={mockCloseHandler} 
        file={mockFiles[2]} 
        onDeleteComplete={jest.fn()} 
      />
    );
    
    // Find and click the cancel button
    const cancelButton = screen.getByRole('button', { name: /Cancel/i });
    fireEvent.click(cancelButton);
    
    // Check if onClose was called
    expect(mockCloseHandler).toHaveBeenCalled();
  });

  test('deletes file when delete button is clicked', async () => {
    const mockOnDeleteComplete = jest.fn();
    
    render(
      <DeleteModal 
        isOpen={true} 
        onClose={jest.fn()} 
        file={mockFiles[2]} 
        onDeleteComplete={mockOnDeleteComplete} 
      />
    );
    
    // Find and click the delete button
    const deleteButton = screen.getByRole('button', { name: /Delete/i });
    fireEvent.click(deleteButton);
    
    // Wait for deletion to complete
    await waitFor(() => {
      expect(mockDeleteFile).toHaveBeenCalledWith(mockFiles[2].id);
      expect(mockOnDeleteComplete).toHaveBeenCalled();
    });
  });

  test('shows loading state while deleting', async () => {
    // Mock the delete function to delay its resolution
    let resolveDelete: (value: any) => void;
    const pendingPromise = new Promise(resolve => {
      resolveDelete = resolve;
    });
    
    const mockDeleteFileWithDelay = jest.fn().mockImplementation(() => pendingPromise);
    
    // Setup the mock to indicate that a deletion is in progress
    (useFiles as jest.Mock).mockReturnValue({
      deleteFile: {
        mutate: mockDeleteFileWithDelay,
        isPending: true,
        isError: false,
        error: null,
      },
    });
    
    render(
      <DeleteModal 
        isOpen={true} 
        onClose={jest.fn()} 
        file={mockFiles[2]} 
        onDeleteComplete={jest.fn()} 
      />
    );
    
    // Find the delete button
    const deleteButton = screen.getByRole('button', { name: /Delete/i });
    fireEvent.click(deleteButton);
    
    // Check if the button shows loading state
    expect(deleteButton).toBeDisabled();
    
    // Complete the deletion
    resolveDelete!({ success: true });
  });

  test('handles errors when deletion fails', async () => {
    // Mock the delete function to reject with an error
    const mockDeleteFileWithError = jest.fn().mockRejectedValue(new Error('Deletion failed'));
    
    // Setup the mock to indicate an error state
    (useFiles as jest.Mock).mockReturnValue({
      deleteFile: {
        mutate: mockDeleteFileWithError,
        isPending: false,
        isError: true,
        error: new Error('Deletion failed'),
      },
    });
    
    render(
      <DeleteModal 
        isOpen={true} 
        onClose={jest.fn()} 
        file={mockFiles[2]} 
        onDeleteComplete={jest.fn()} 
      />
    );
    
    // Find and click the delete button
    const deleteButton = screen.getByRole('button', { name: /Delete/i });
    fireEvent.click(deleteButton);
    
    // Wait for error state
    await waitFor(() => {
      expect(screen.getByText(/failed/i)).toBeInTheDocument();
    });
  });

  test('handles null file prop gracefully', () => {
    render(
      <DeleteModal 
        isOpen={true} 
        onClose={jest.fn()} 
        file={null} 
        onDeleteComplete={jest.fn()} 
      />
    );
    
    // Should still render but without the file name
    expect(screen.getByText(/Are you sure/i)).toBeInTheDocument();
    expect(screen.queryByText(/Test Document.docx/i)).not.toBeInTheDocument();
  });
});