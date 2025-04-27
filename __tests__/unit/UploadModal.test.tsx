import React from 'react';
import { render, screen, fireEvent, waitFor } from '../mocks/testUtils';
import UploadModal from '../../client/src/components/UploadModal';
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

describe('UploadModal Component', () => {
  const mockUploadFile = jest.fn().mockResolvedValue({
    id: 'new-file-id',
    name: 'test-file.txt',
    mimeType: 'text/plain',
  });
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default mocks
    (useFiles as jest.Mock).mockReturnValue({
      uploadFile: {
        mutate: mockUploadFile,
        isPending: false,
        isError: false,
        error: null,
      },
    });
  });

  test('renders null when isOpen is false', () => {
    const { container } = render(
      <UploadModal 
        isOpen={false} 
        onClose={jest.fn()} 
        onUploadComplete={jest.fn()} 
      />
    );
    
    // Modal should not be in the document
    expect(container.firstChild).toBeNull();
  });

  test('renders modal with correct title and content when isOpen is true', () => {
    render(
      <UploadModal 
        isOpen={true} 
        onClose={jest.fn()} 
        onUploadComplete={jest.fn()} 
      />
    );
    
    // Check if modal title is displayed
    expect(screen.getByText('Upload Files')).toBeInTheDocument();
    
    // Check if file input area is displayed
    expect(screen.getByText(/Drag and drop files here/i)).toBeInTheDocument();
    expect(screen.getByText(/Browse/i)).toBeInTheDocument();
  });

  test('allows files to be selected via file input', async () => {
    render(
      <UploadModal 
        isOpen={true} 
        onClose={jest.fn()} 
        onUploadComplete={jest.fn()} 
      />
    );
    
    // Create a file
    const file = new File(['test content'], 'test-file.txt', { type: 'text/plain' });
    
    // Get the file input
    const fileInput = screen.getByLabelText(/Browse/i);
    
    // Simulate file selection
    fireEvent.change(fileInput, {
      target: { files: [file] },
    });
    
    // Check if the file appears in the list
    await waitFor(() => {
      expect(screen.getByText('test-file.txt')).toBeInTheDocument();
    });
  });

  test('uploads files when upload button is clicked', async () => {
    const mockOnUploadComplete = jest.fn();
    
    render(
      <UploadModal 
        isOpen={true} 
        onClose={jest.fn()} 
        onUploadComplete={mockOnUploadComplete} 
      />
    );
    
    // Create a file
    const file = new File(['test content'], 'test-file.txt', { type: 'text/plain' });
    
    // Get the file input
    const fileInput = screen.getByLabelText(/Browse/i);
    
    // Simulate file selection
    fireEvent.change(fileInput, {
      target: { files: [file] },
    });
    
    // Wait for file to appear in the list
    await waitFor(() => {
      expect(screen.getByText('test-file.txt')).toBeInTheDocument();
    });
    
    // Click the upload button
    const uploadButton = screen.getByRole('button', { name: /Upload/i });
    fireEvent.click(uploadButton);
    
    // Wait for upload to complete
    await waitFor(() => {
      expect(mockUploadFile).toHaveBeenCalled();
      expect(mockOnUploadComplete).toHaveBeenCalled();
    });
  });

  test('shows loading state while uploading', async () => {
    // Mock the upload function to delay its resolution
    let resolveUpload: (value: any) => void;
    const pendingPromise = new Promise(resolve => {
      resolveUpload = resolve;
    });
    
    const mockUploadFileWithDelay = jest.fn().mockImplementation(() => pendingPromise);
    
    // Setup the mock to indicate that an upload is in progress
    (useFiles as jest.Mock).mockReturnValue({
      uploadFile: {
        mutate: mockUploadFileWithDelay,
        isPending: true,
        isError: false,
        error: null,
      },
    });
    
    render(
      <UploadModal 
        isOpen={true} 
        onClose={jest.fn()} 
        onUploadComplete={jest.fn()} 
      />
    );
    
    // Create a file
    const file = new File(['test content'], 'test-file.txt', { type: 'text/plain' });
    
    // Get the file input
    const fileInput = screen.getByLabelText(/Browse/i);
    
    // Simulate file selection
    fireEvent.change(fileInput, {
      target: { files: [file] },
    });
    
    // Check if the upload button is disabled
    const uploadButton = screen.getByRole('button', { name: /Upload/i });
    expect(uploadButton).toBeDisabled();
    
    // Complete the upload
    resolveUpload!({
      id: 'new-file-id',
      name: 'test-file.txt',
      mimeType: 'text/plain',
    });
  });

  test('handles errors when upload fails', async () => {
    // Mock the upload function to reject with an error
    const mockUploadFileWithError = jest.fn().mockRejectedValue(new Error('Upload failed'));
    
    // Setup the mock to indicate an error state
    (useFiles as jest.Mock).mockReturnValue({
      uploadFile: {
        mutate: mockUploadFileWithError,
        isPending: false,
        isError: true,
        error: new Error('Upload failed'),
      },
    });
    
    render(
      <UploadModal 
        isOpen={true} 
        onClose={jest.fn()} 
        onUploadComplete={jest.fn()} 
      />
    );
    
    // Create a file
    const file = new File(['test content'], 'test-file.txt', { type: 'text/plain' });
    
    // Get the file input
    const fileInput = screen.getByLabelText(/Browse/i);
    
    // Simulate file selection
    fireEvent.change(fileInput, {
      target: { files: [file] },
    });
    
    // Click the upload button
    const uploadButton = screen.getByRole('button', { name: /Upload/i });
    fireEvent.click(uploadButton);
    
    // Wait for error state
    await waitFor(() => {
      expect(screen.getByText(/failed/i)).toBeInTheDocument();
    });
  });

  test('calls onClose when cancel button is clicked', () => {
    const mockCloseHandler = jest.fn();
    
    render(
      <UploadModal 
        isOpen={true} 
        onClose={mockCloseHandler} 
        onUploadComplete={jest.fn()} 
      />
    );
    
    // Find and click the cancel button
    const cancelButton = screen.getByRole('button', { name: /Cancel/i });
    fireEvent.click(cancelButton);
    
    // Check if onClose was called
    expect(mockCloseHandler).toHaveBeenCalled();
  });
});