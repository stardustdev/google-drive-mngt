import React from 'react';
import { render, screen, fireEvent, within } from '../mocks/testUtils';
import FileTable from '../../client/src/components/FileTable';
import { mockFiles } from '../mocks/mockData';

// Mock the onAction function
const mockOnAction = jest.fn();

describe('FileTable Component', () => {
  beforeEach(() => {
    // Clear mock function calls before each test
    mockOnAction.mockClear();
  });

  test('renders table with correct column headers', () => {
    render(<FileTable files={mockFiles} onAction={mockOnAction} />);
    
    // Check if all column headers are present
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Modified')).toBeInTheDocument();
    expect(screen.getByText('Size')).toBeInTheDocument();
  });

  test('renders all files in the table', () => {
    render(<FileTable files={mockFiles} onAction={mockOnAction} />);
    
    // Check if all file names are displayed
    mockFiles.forEach(file => {
      expect(screen.getByText(file.name)).toBeInTheDocument();
    });
  });

  test('displays folders at the top of the list', () => {
    render(<FileTable files={mockFiles} onAction={mockOnAction} />);
    
    // Get all rows (excluding header row)
    const rows = screen.getAllByRole('row').slice(1);
    
    // First two items should be folders
    expect(within(rows[0]).getByText('Test Folder 1')).toBeInTheDocument();
    expect(within(rows[1]).getByText('Test Folder 2')).toBeInTheDocument();
  });

  test('double-clicking on a file row triggers preview action', () => {
    render(<FileTable files={mockFiles} onAction={mockOnAction} />);
    
    // Find the row containing the document file
    const documentRow = screen.getByText('Test Document.docx').closest('tr');
    
    // Double click on the row
    if (documentRow) {
      fireEvent.doubleClick(documentRow);
      
      // Check if onAction was called with the correct action and file
      expect(mockOnAction).toHaveBeenCalledWith('preview', mockFiles[2]);
    }
  });

  test('double-clicking on a folder row triggers open-folder action', () => {
    render(<FileTable files={mockFiles} onAction={mockOnAction} />);
    
    // Find the row containing the folder
    const folderRow = screen.getByText('Test Folder 1').closest('tr');
    
    // Double click on the row
    if (folderRow) {
      fireEvent.doubleClick(folderRow);
      
      // Check if onAction was called with the correct action and file
      expect(mockOnAction).toHaveBeenCalledWith('open-folder', mockFiles[0]);
    }
  });

  test('displays correct file sizes', () => {
    render(<FileTable files={mockFiles} onAction={mockOnAction} />);
    
    // Check if file sizes are displayed correctly
    expect(screen.getByText(/12345/)).toBeInTheDocument(); // Document file
    expect(screen.getByText(/54321/)).toBeInTheDocument(); // Image file
    
    // Folders should show empty or -- for size
    const folderRows = [
      screen.getByText('Test Folder 1').closest('tr'),
      screen.getByText('Test Folder 2').closest('tr')
    ];
    
    folderRows.forEach(row => {
      if (row) {
        const sizeCell = within(row).getByRole('cell', { name: /--/ });
        expect(sizeCell).toBeInTheDocument();
      }
    });
  });
});