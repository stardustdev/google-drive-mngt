import React from 'react';
import { render, screen, fireEvent, waitFor } from '../mocks/testUtils';
import { ShareFileModal } from '../../client/src/components/ShareFileModal';
import { mockFiles, mockFilePermissions } from '../mocks/mockData';
import fetchMock from 'jest-fetch-mock';

// Mock the useFileSharing hook
jest.mock('../../client/src/hooks/useFileSharing', () => ({
  useFileSharing: () => ({
    permissions: mockFilePermissions,
    isLoading: false,
    isError: false,
    shareWithUser: jest.fn().mockResolvedValue({ success: true }),
    removePermission: jest.fn().mockResolvedValue({ success: true }),
    refetchPermissions: jest.fn(),
  }),
}));

// Mock the useToast hook
jest.mock('../../client/src/hooks/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}));

describe('ShareFileModal Component', () => {
  beforeEach(() => {
    fetchMock.resetMocks();
  });

  test('renders null when isOpen is false', () => {
    const { container } = render(
      <ShareFileModal isOpen={false} onClose={jest.fn()} file={mockFiles[2]} />
    );
    
    // Modal should not be in the document
    expect(container.firstChild).toBeNull();
  });

  test('renders modal with correct title when isOpen is true', () => {
    render(
      <ShareFileModal isOpen={true} onClose={jest.fn()} file={mockFiles[2]} />
    );
    
    // Check if modal title includes "Share"
    expect(screen.getByText(/Share/)).toBeInTheDocument();
    expect(screen.getByText(/Test Document.docx/)).toBeInTheDocument();
  });

  test('displays existing permissions', () => {
    render(
      <ShareFileModal isOpen={true} onClose={jest.fn()} file={mockFiles[2]} />
    );
    
    // Check if existing permissions are displayed
    expect(screen.getByText('collaborator@example.com')).toBeInTheDocument();
    expect(screen.getByText('editor@example.com')).toBeInTheDocument();
    
    // Check if roles are displayed
    expect(screen.getByText(/reader/i)).toBeInTheDocument();
    expect(screen.getByText(/writer/i)).toBeInTheDocument();
  });

  test('submits new permission when form is submitted', async () => {
    // Get the mocked function
    const shareWithUserMock = require('../../client/src/hooks/useFileSharing').useFileSharing().shareWithUser;
    
    render(
      <ShareFileModal isOpen={true} onClose={jest.fn()} file={mockFiles[2]} />
    );
    
    // Fill in the email input
    const emailInput = screen.getByPlaceholderText(/email address/i);
    fireEvent.change(emailInput, { target: { value: 'newuser@example.com' } });
    
    // Select a role
    const roleSelect = screen.getByRole('combobox');
    fireEvent.change(roleSelect, { target: { value: 'writer' } });
    
    // Submit the form
    const shareButton = screen.getByRole('button', { name: /share/i });
    fireEvent.click(shareButton);
    
    // Check if shareWithUser was called with the correct parameters
    await waitFor(() => {
      expect(shareWithUserMock).toHaveBeenCalledWith({
        fileId: mockFiles[2].id,
        emailAddress: 'newuser@example.com',
        role: 'writer',
        sendNotification: true,
      });
    });
  });

  test('calls onClose when close button is clicked', () => {
    const mockCloseHandler = jest.fn();
    
    render(
      <ShareFileModal isOpen={true} onClose={mockCloseHandler} file={mockFiles[2]} />
    );
    
    // Find and click the close button
    const closeButton = screen.getByRole('button', { name: /close/i });
    closeButton.click();
    
    // Check if onClose was called
    expect(mockCloseHandler).toHaveBeenCalled();
  });

  test('displays validation error for invalid email', async () => {
    render(
      <ShareFileModal isOpen={true} onClose={jest.fn()} file={mockFiles[2]} />
    );
    
    // Fill in an invalid email
    const emailInput = screen.getByPlaceholderText(/email address/i);
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    
    // Submit the form
    const shareButton = screen.getByRole('button', { name: /share/i });
    fireEvent.click(shareButton);
    
    // Check if validation error is displayed
    await waitFor(() => {
      expect(screen.getByText(/valid email/i)).toBeInTheDocument();
    });
  });

  test('shows loading state while submitting', async () => {
    // Override the shareWithUser mock to delay resolution
    const useFileSharingModule = require('../../client/src/hooks/useFileSharing');
    jest.spyOn(useFileSharingModule, 'useFileSharing').mockImplementation(() => ({
      permissions: mockFilePermissions,
      isLoading: false,
      isError: false,
      shareWithUser: jest.fn().mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({ success: true }), 100))
      ),
      removePermission: jest.fn().mockResolvedValue({ success: true }),
      refetchPermissions: jest.fn(),
    }));
    
    render(
      <ShareFileModal isOpen={true} onClose={jest.fn()} file={mockFiles[2]} />
    );
    
    // Fill in the email input
    const emailInput = screen.getByPlaceholderText(/email address/i);
    fireEvent.change(emailInput, { target: { value: 'newuser@example.com' } });
    
    // Submit the form
    const shareButton = screen.getByRole('button', { name: /share/i });
    fireEvent.click(shareButton);
    
    // Check if button shows loading state
    expect(shareButton).toBeDisabled();
    
    // Wait for form submission to complete
    await waitFor(() => {
      expect(shareButton).not.toBeDisabled();
    });
    
    // Restore mock
    jest.restoreAllMocks();
  });
});