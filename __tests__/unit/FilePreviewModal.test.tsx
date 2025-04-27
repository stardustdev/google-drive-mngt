import React from 'react';
import { render, screen, waitFor } from '../mocks/testUtils';
import { FilePreviewModal } from '../../client/src/components/FilePreviewModal';
import { mockFiles } from '../mocks/mockData';
import fetchMock from 'jest-fetch-mock';

describe('FilePreviewModal Component', () => {
  beforeEach(() => {
    fetchMock.resetMocks();
    
    // Mock global functions used in the component
    global.URL.createObjectURL = jest.fn(() => 'blob:mock-url');
    global.URL.revokeObjectURL = jest.fn();
  });

  test('renders null when isOpen is false', () => {
    const { container } = render(
      <FilePreviewModal isOpen={false} onClose={jest.fn()} file={mockFiles[2]} />
    );
    
    // Modal should not be in the document
    expect(container.firstChild).toBeNull();
  });

  test('renders modal with correct title when isOpen is true', () => {
    render(
      <FilePreviewModal isOpen={true} onClose={jest.fn()} file={mockFiles[2]} />
    );
    
    // Check if modal title includes the file name
    expect(screen.getByText(/Test Document.docx/)).toBeInTheDocument();
  });

  test('renders loading state while fetching file content', async () => {
    // Delay the API response
    fetchMock.mockResponseOnce(() => 
      new Promise(resolve => 
        setTimeout(() => resolve({ body: new Blob(['file content']) }), 100)
      )
    );
    
    render(
      <FilePreviewModal isOpen={true} onClose={jest.fn()} file={mockFiles[2]} />
    );
    
    // Check if loading indicator is displayed
    expect(screen.getByText('Loading preview...')).toBeInTheDocument();
  });

  test('renders appropriate preview for image files', async () => {
    const imageFile = mockFiles[3]; // Image file
    
    // Mock the fetch response with a blob
    fetchMock.mockResponseOnce(() => 
      Promise.resolve({ body: new Blob(['image data'], { type: 'image/jpeg' }) })
    );
    
    render(
      <FilePreviewModal isOpen={true} onClose={jest.fn()} file={imageFile} />
    );
    
    // Wait for preview to load
    await waitFor(() => {
      const image = screen.getByRole('img');
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute('src', 'blob:mock-url');
    });
  });

  test('renders appropriate preview for PDF files', async () => {
    const pdfFile = mockFiles[4]; // PDF file
    
    // Mock the fetch response with a blob
    fetchMock.mockResponseOnce(() => 
      Promise.resolve({ body: new Blob(['pdf data'], { type: 'application/pdf' }) })
    );
    
    render(
      <FilePreviewModal isOpen={true} onClose={jest.fn()} file={pdfFile} />
    );
    
    // Wait for preview to load
    await waitFor(() => {
      const iframe = screen.getByTitle('PDF Viewer');
      expect(iframe).toBeInTheDocument();
      expect(iframe).toHaveAttribute('src', 'blob:mock-url');
    });
  });

  test('displays error message when preview fails to load', async () => {
    // Mock API error response
    fetchMock.mockRejectOnce(new Error('Network error'));
    
    render(
      <FilePreviewModal isOpen={true} onClose={jest.fn()} file={mockFiles[2]} />
    );
    
    // Wait for error message to appear
    await waitFor(() => {
      expect(screen.getByText(/Failed to load preview/)).toBeInTheDocument();
    });
  });

  test('calls onClose when close button is clicked', () => {
    const mockCloseHandler = jest.fn();
    
    render(
      <FilePreviewModal isOpen={true} onClose={mockCloseHandler} file={mockFiles[2]} />
    );
    
    // Find and click the close button
    const closeButton = screen.getByRole('button', { name: /close/i });
    closeButton.click();
    
    // Check if onClose was called
    expect(mockCloseHandler).toHaveBeenCalled();
  });
});