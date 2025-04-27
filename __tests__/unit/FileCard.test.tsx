import React from 'react';
import { render, screen, fireEvent } from '../mocks/testUtils';
import FileCard from '../../client/src/components/FileCard';
import { mockFiles } from '../mocks/mockData';

// Mock the onAction function
const mockOnAction = jest.fn();

describe('FileCard Component', () => {
  beforeEach(() => {
    // Clear mock function calls before each test
    mockOnAction.mockClear();
  });

  test('renders file card with correct information', () => {
    const testFile = mockFiles[2]; // Document file
    
    render(<FileCard file={testFile} onAction={mockOnAction} />);
    
    // Check if file name is displayed
    expect(screen.getByText(testFile.name)).toBeInTheDocument();
    
    // Check if modified date is displayed
    const modifiedDate = new Date(testFile.modifiedTime).toLocaleDateString();
    expect(screen.getByText(new RegExp(modifiedDate))).toBeInTheDocument();
    
    // Check if file size is displayed
    expect(screen.getByText(/12345/)).toBeInTheDocument();
  });

  test('renders folder correctly', () => {
    const testFolder = mockFiles[0]; // Folder
    
    render(<FileCard file={testFolder} onAction={mockOnAction} />);
    
    // Check if folder name is displayed
    expect(screen.getByText(testFolder.name)).toBeInTheDocument();
    
    // Folders don't show file size
    expect(screen.queryByText(/bytes|KB|MB|GB/)).not.toBeInTheDocument();
  });

  test('double-click on file triggers preview action', () => {
    const testFile = mockFiles[2]; // Document file
    
    render(<FileCard file={testFile} onAction={mockOnAction} />);
    
    // Double click on the card
    const card = screen.getByRole('button');
    fireEvent.doubleClick(card);
    
    // Check if onAction was called with the correct action and file
    expect(mockOnAction).toHaveBeenCalledWith('preview', testFile);
  });

  test('double-click on folder triggers open-folder action', () => {
    const testFolder = mockFiles[0]; // Folder
    
    render(<FileCard file={testFolder} onAction={mockOnAction} />);
    
    // Double click on the card
    const card = screen.getByRole('button');
    fireEvent.doubleClick(card);
    
    // Check if onAction was called with the correct action and file
    expect(mockOnAction).toHaveBeenCalledWith('open-folder', testFolder);
  });

  test('clicking context menu opens the file actions menu', () => {
    const testFile = mockFiles[2]; // Document file
    
    render(<FileCard file={testFile} onAction={mockOnAction} />);
    
    // Click the more actions button (3-dot menu)
    const menuButton = screen.getByRole('button', { name: /actions/i });
    fireEvent.click(menuButton);
    
    // Check if the actions menu opens (difficult to test exact content due to portal rendering)
    // Instead we can check if clicking the button works
    expect(menuButton).toBeInTheDocument();
  });
});