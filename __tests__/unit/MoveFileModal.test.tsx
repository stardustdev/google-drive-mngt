import React from 'react';
import { render, screen, fireEvent, waitFor } from '../mocks/testUtils';
import { MoveFileModal } from '../../client/src/components/MoveFileModal';
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

describe('MoveFileModal Component', () => {
  const mockMoveFile = jest.fn().mockResolvedValue({ success: true });
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup default mocks
    (useFiles as jest.Mock).mockReturnValue({
      files: [
        {
          id: 'folder-1',
          name: 'Target Folder 1',
          mimeType: 'application/vnd.google-apps.folder',
          modifiedTime: '2023-01-01T12:00:00Z',
        },
        {
          id: 'folder-2',
          name: 'Target Folder 2',
          mimeType: 'application/vnd.google-apps.folder',
          modifiedTime: '2023-01-02T12:00:00Z',
        },
      ],
      isLoading: false,
      isError: false,
      error: null,
      moveFile: {
        mutate: mockMoveFile,
        isPending: false,
        isError: false,
        error: null,
      },
    });
  });

  test('renders null when isOpen is false', () => {
    const { container } = render(
      <MoveFileModal 
        isOpen={false} 
        onClose={jest.fn()} 
        file={mockFiles[2]} 
        onMoveComplete={jest.fn()} 
      />
    );
    
    // Modal should not be in the document
    expect(container.firstChild).toBeNull();
  });

  test('renders modal with correct title and content when isOpen is true', () => {
    render(
      <MoveFileModal 
        isOpen={true} 
        onClose={jest.fn()} 
        file={mockFiles[2]} 
        onMoveComplete={jest.fn()} 
      />
    );
    
    // Check if modal title is displayed
    expect(screen.getByText(/Move/i)).toBeInTheDocument();
    expect(screen.getByText(/Test Document.docx/i)).toBeInTheDocument();
    
    // Check if folder list is displayed
    expect(screen.getByText('Target Folder 1')).toBeInTheDocument();
    expect(screen.getByText('Target Folder 2')).toBeInTheDocument();
  });

  test('moves file when a folder is selected and move button is clicked', async () => {
    const mockOnMoveComplete = jest.fn();
    
    render(
      <MoveFileModal 
        isOpen={true} 
        onClose={jest.fn()} 
        file={mockFiles[2]} 
        onMoveComplete={mockOnMoveComplete} 
      />
    );
    
    // Find and click a folder
    const targetFolder = screen.getByText('Target Folder 1');
    fireEvent.click(targetFolder);
    
    // Find and click the move button
    const moveButton = screen.getByRole('button', { name: /Move/i });
    fireEvent.click(moveButton);
    
    // Wait for move to complete
    await waitFor(() => {
      expect(mockMoveFile).toHaveBeenCalledWith({
        fileId: mockFiles[2].id,
        targetFolderId: 'folder-1',
        removeFromParents: true,
      });
      expect(mockOnMoveComplete).toHaveBeenCalled();
    });
  });

  test('shows loading state while moving file', async () => {
    // Mock the move function to delay its resolution
    let resolveMove: (value: any) => void;
    const pendingPromise = new Promise(resolve => {
      resolveMove = resolve;
    });
    
    const mockMoveFileWithDelay = jest.fn().mockImplementation(() => pendingPromise);
    
    // Setup the mock to indicate that a move is in progress
    (useFiles as jest.Mock).mockReturnValue({
      files: [
        {
          id: 'folder-1',
          name: 'Target Folder 1',
          mimeType: 'application/vnd.google-apps.folder',
          modifiedTime: '2023-01-01T12:00:00Z',
        },
      ],
      isLoading: false,
      isError: false,
      error: null,
      moveFile: {
        mutate: mockMoveFileWithDelay,
        isPending: true,
        isError: false,
        error: null,
      },
    });
    
    render(
      <MoveFileModal 
        isOpen={true} 
        onClose={jest.fn()} 
        file={mockFiles[2]} 
        onMoveComplete={jest.fn()} 
      />
    );
    
    // Find and click a folder
    const targetFolder = screen.getByText('Target Folder 1');
    fireEvent.click(targetFolder);
    
    // Find the move button
    const moveButton = screen.getByRole('button', { name: /Move/i });
    fireEvent.click(moveButton);
    
    // Check if the button shows loading state
    expect(moveButton).toBeDisabled();
    
    // Complete the move
    resolveMove!({ success: true });
  });

  test('handles errors when move fails', async () => {
    // Mock the move function to reject with an error
    const mockMoveFileWithError = jest.fn().mockRejectedValue(new Error('Move failed'));
    
    // Setup the mock to indicate an error state
    (useFiles as jest.Mock).mockReturnValue({
      files: [
        {
          id: 'folder-1',
          name: 'Target Folder 1',
          mimeType: 'application/vnd.google-apps.folder',
          modifiedTime: '2023-01-01T12:00:00Z',
        },
      ],
      isLoading: false,
      isError: false,
      error: null,
      moveFile: {
        mutate: mockMoveFileWithError,
        isPending: false,
        isError: true,
        error: new Error('Move failed'),
      },
    });
    
    render(
      <MoveFileModal 
        isOpen={true} 
        onClose={jest.fn()} 
        file={mockFiles[2]} 
        onMoveComplete={jest.fn()} 
      />
    );
    
    // Find and click a folder
    const targetFolder = screen.getByText('Target Folder 1');
    fireEvent.click(targetFolder);
    
    // Find and click the move button
    const moveButton = screen.getByRole('button', { name: /Move/i });
    fireEvent.click(moveButton);
    
    // Wait for error state
    await waitFor(() => {
      expect(screen.getByText(/failed/i)).toBeInTheDocument();
    });
  });

  test('calls onClose when cancel button is clicked', () => {
    const mockCloseHandler = jest.fn();
    
    render(
      <MoveFileModal 
        isOpen={true} 
        onClose={mockCloseHandler} 
        file={mockFiles[2]} 
        onMoveComplete={jest.fn()} 
      />
    );
    
    // Find and click the cancel button
    const cancelButton = screen.getByRole('button', { name: /Cancel/i });
    fireEvent.click(cancelButton);
    
    // Check if onClose was called
    expect(mockCloseHandler).toHaveBeenCalled();
  });

  test('shows loading state while fetching folders', async () => {
    // Setup the mock to indicate loading state for folders
    (useFiles as jest.Mock).mockReturnValue({
      files: null,
      isLoading: true,
      isError: false,
      error: null,
      moveFile: {
        mutate: mockMoveFile,
        isPending: false,
        isError: false,
        error: null,
      },
    });
    
    render(
      <MoveFileModal 
        isOpen={true} 
        onClose={jest.fn()} 
        file={mockFiles[2]} 
        onMoveComplete={jest.fn()} 
      />
    );
    
    // Check if loading indicator is displayed
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  test('handles case when no folders are available', async () => {
    // Setup the mock to return empty folder list
    (useFiles as jest.Mock).mockReturnValue({
      files: [],
      isLoading: false,
      isError: false,
      error: null,
      moveFile: {
        mutate: mockMoveFile,
        isPending: false,
        isError: false,
        error: null,
      },
    });
    
    render(
      <MoveFileModal 
        isOpen={true} 
        onClose={jest.fn()} 
        file={mockFiles[2]} 
        onMoveComplete={jest.fn()} 
      />
    );
    
    // Check if "No folders available" message is displayed
    expect(screen.getByText(/No folders available/i)).toBeInTheDocument();
  });
});