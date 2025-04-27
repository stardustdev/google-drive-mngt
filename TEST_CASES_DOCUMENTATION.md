# Google Drive Integration - Test Cases Documentation

This document details the test cases implemented for the Google Drive Integration application. It serves as a reference for understanding what aspects of the application are covered by the test suite and how to extend it for future features.

## Table of Contents

1. [Testing Framework](#testing-framework)
2. [Unit Tests](#unit-tests)
   - [Components](#component-tests)
   - [Hooks](#hook-tests)
   - [Services](#service-tests)
3. [Integration Tests](#integration-tests)
4. [Test Data and Mocks](#test-data-and-mocks)
5. [Running Tests](#running-tests)
6. [Adding New Tests](#adding-new-tests)
7. [Coverage Reports](#coverage-reports)

## Testing Framework

The application uses the following testing tools:

- **Jest**: Main test runner
- **Testing Library**: For rendering and testing React components
- **Mock Service Worker (MSW)**: For mocking API requests
- **jest-fetch-mock**: For mocking fetch requests
- **ts-jest**: For TypeScript support

## Unit Tests

### Component Tests

#### `FileCard.test.tsx`

Tests the file card component used in grid view.

| Test Case | Description |
|-----------|-------------|
| Renders file card with correct information | Verifies that the file name, modified date, and size are displayed correctly |
| Renders folder correctly | Checks that folders are displayed with the correct icon and without file size |
| Double-click on file triggers preview action | Verifies preview action is called when double-clicking a file |
| Double-click on folder triggers open-folder action | Verifies open-folder action is called when double-clicking a folder |
| Clicking context menu opens the file actions menu | Tests that the actions menu can be opened |

#### `FileTable.test.tsx`

Tests the file table component used in list view.

| Test Case | Description |
|-----------|-------------|
| Renders table with correct column headers | Checks that all column headers are displayed |
| Renders all files in the table | Verifies all files are displayed in the table |
| Displays folders at the top of the list | Checks that folders are sorted to appear first |
| Double-clicking on a file row triggers preview action | Tests preview action on double-click |
| Double-clicking on a folder row triggers open-folder action | Tests folder opening on double-click |
| Displays correct file sizes | Verifies file sizes are formatted correctly |

#### `FolderNavigation.test.tsx`

Tests the breadcrumb navigation component.

| Test Case | Description |
|-----------|-------------|
| Renders My Drive button when no folder is selected | Checks root navigation button is shown |
| Clicking My Drive button calls onNavigate with undefined | Verifies root navigation works |
| Displays breadcrumbs for current folder | Tests that the full path is shown |
| Clicking on a breadcrumb folder navigates to that folder | Verifies navigation through breadcrumbs |
| Displays loading state while fetching folder details | Checks loading indicator works |
| Handles error when folder details cannot be fetched | Tests error handling |

#### `FilePreviewModal.test.tsx`

Tests the file preview modal.

| Test Case | Description |
|-----------|-------------|
| Renders null when isOpen is false | Verifies modal doesn't render when closed |
| Renders modal with correct title when isOpen is true | Checks modal title includes file name |
| Renders loading state while fetching file content | Tests loading indicator during content fetch |
| Renders appropriate preview for image files | Verifies image preview works |
| Renders appropriate preview for PDF files | Verifies PDF preview works |
| Displays error message when preview fails to load | Tests error handling |
| Calls onClose when close button is clicked | Verifies modal can be closed |

#### `ShareFileModal.test.tsx`

Tests the file sharing modal.

| Test Case | Description |
|-----------|-------------|
| Renders null when isOpen is false | Verifies modal doesn't render when closed |
| Renders modal with correct title when isOpen is true | Checks modal title is correct |
| Displays existing permissions | Verifies current sharing settings are shown |
| Submits new permission when form is submitted | Tests sharing with a new user |
| Calls onClose when close button is clicked | Verifies modal can be closed |
| Displays validation error for invalid email | Tests form validation |
| Shows loading state while submitting | Checks loading indicator during submission |

#### `UploadModal.test.tsx`

Tests the file upload modal.

| Test Case | Description |
|-----------|-------------|
| Renders null when isOpen is false | Verifies modal doesn't render when closed |
| Renders modal with correct title and content when isOpen is true | Checks modal content |
| Allows files to be selected via file input | Tests file selection functionality |
| Uploads files when upload button is clicked | Tests file upload process |
| Shows loading state while uploading | Verifies loading state during upload |
| Handles errors when upload fails | Tests error handling |
| Calls onClose when cancel button is clicked | Verifies modal can be closed |

#### `DeleteModal.test.tsx`

Tests the file deletion confirmation modal.

| Test Case | Description |
|-----------|-------------|
| Renders null when isOpen is false | Verifies modal doesn't render when closed |
| Renders modal with correct title and content when isOpen is true | Checks confirmation text |
| Calls onClose when cancel button is clicked | Tests cancellation |
| Deletes file when delete button is clicked | Verifies file deletion works |
| Shows loading state while deleting | Checks loading indicator during deletion |
| Handles errors when deletion fails | Tests error handling |
| Handles null file prop gracefully | Verifies robustness with missing data |

#### `MoveFileModal.test.tsx`

Tests the file move modal.

| Test Case | Description |
|-----------|-------------|
| Renders null when isOpen is false | Verifies modal doesn't render when closed |
| Renders modal with correct title and content when isOpen is true | Checks modal content |
| Moves file when a folder is selected and move button is clicked | Tests move functionality |
| Shows loading state while moving file | Verifies loading indicator |
| Handles errors when move fails | Tests error handling |
| Calls onClose when cancel button is clicked | Verifies modal can be closed |
| Shows loading state while fetching folders | Tests loading state for folder list |
| Handles case when no folders are available | Tests empty state handling |

#### `CreateFolderModal.test.tsx`

Tests the folder creation modal.

| Test Case | Description |
|-----------|-------------|
| Renders null when isOpen is false | Verifies modal doesn't render when closed |
| Renders modal with correct title and content when isOpen is true | Checks modal content |
| Submits form with folder name when create button is clicked | Tests folder creation |
| Uses parentFolderId when provided | Verifies proper parent folder usage |
| Shows loading state while creating folder | Checks loading indicator |
| Validates that folder name is required | Tests form validation |
| Handles errors when folder creation fails | Tests error handling |
| Calls onClose when cancel button is clicked | Verifies modal can be closed |

#### `StorageUsage.test.tsx`

Tests the storage usage component.

| Test Case | Description |
|-----------|-------------|
| Renders storage usage information correctly | Checks storage text and progress bar |
| Renders compact version when compact prop is true | Tests compact display mode |
| Shows loading state while fetching storage info | Verifies loading indicator |
| Shows error state when there is an error fetching storage info | Tests error handling |
| Shows zero usage when storageInfo.usage is zero | Verifies zero state handling |

### Hook Tests

#### `useFiles.test.tsx`

Tests the hook for file operations.

| Test Case | Description |
|-----------|-------------|
| Fetches files from root when no folderId is provided | Tests root folder file fetching |
| Fetches files from a specific folder when folderId is provided | Tests subfolder file fetching |
| Handles API error correctly | Verifies error handling |
| Create folder mutation works correctly | Tests folder creation |
| Delete file mutation works correctly | Tests file deletion |
| Move file mutation works correctly | Tests file moving |

#### `useFileSharing.test.tsx`

Tests the hook for file sharing.

| Test Case | Description |
|-----------|-------------|
| Fetches file permissions when fileId is provided | Tests permission fetching |
| Does not fetch permissions when fileId is not provided | Verifies conditional fetching |
| Handles API error correctly | Tests error handling |
| Share with user mutation works correctly | Verifies sharing functionality |
| Remove permission mutation works correctly | Tests permission removal |
| RefetchPermissions function refreshes permissions data | Tests data refresh |

### Service Tests

#### `googleAuthService.test.ts`

Tests the Google authentication service.

| Test Case | Description |
|-----------|-------------|
| Processes OAuth callback data correctly | Verifies OAuth response handling |
| Handles missing profile data gracefully | Tests robustness with incomplete data |
| Returns user unchanged if token is not expired | Verifies token freshness check |
| Refreshes token if it is expired | Tests token refresh functionality |
| Handles refresh token error gracefully | Verifies error handling |

#### `apiRoutes.test.ts`

Tests the API routes.

| Test Case | Description |
|-----------|-------------|
| GET /api/drive/files returns all files when no folderId is provided | Tests file listing |
| GET /api/drive/files returns files from a specific folder when folderId is provided | Tests folder contents |
| GET /api/drive/files handles errors correctly | Verifies error handling |
| GET /api/drive/files/:fileId returns file details for a valid file ID | Tests file details endpoint |
| GET /api/drive/files/:fileId returns 404 for non-existent file ID | Tests not found handling |
| POST /api/drive/folders creates a new folder | Tests folder creation endpoint |
| POST /api/drive/folders creates a folder in a parent folder when parentId is provided | Tests nested folder creation |
| GET /api/drive/search searches for files matching the query | Tests search functionality |
| GET /api/drive/search returns 400 if no query is provided | Tests parameter validation |
| GET /api/drive/storage returns storage usage information | Tests storage info endpoint |
| PATCH /api/drive/files/:fileId/move moves a file to a new folder | Tests move file endpoint |
| POST /api/drive/permissions/:fileId shares a file with a user | Tests sharing endpoint |
| POST /api/drive/permissions/:fileId returns 400 if required fields are missing | Tests parameter validation |

## Integration Tests

### `FileManager.test.tsx`

Tests the FileManager component which integrates many subcomponents.

| Test Case | Description |
|-----------|-------------|
| Renders FileManager with file list in table view by default | Verifies initial render state |
| Switches between table and grid views | Tests view mode toggle |
| Handles folder navigation | Verifies folder navigation works |
| Renders upload modal when upload button is clicked | Tests upload modal trigger |
| Renders create folder modal when new folder button is clicked | Tests folder creation modal trigger |
| Renders file preview modal when preview action is triggered | Tests preview modal trigger |
| Shows empty state when no files are available | Verifies empty state handling |
| Shows loading state while fetching files | Tests loading state |
| Shows error state when there is an error fetching files | Tests error state handling |

### `MainWorkflow.test.tsx`

Tests the main user workflows in the application.

| Test Case | Description |
|-----------|-------------|
| User can navigate between folders | Tests folder navigation flow |
| User can switch between list and grid views | Tests view mode switching |
| User can create a new folder | Tests folder creation workflow |
| User can preview a file | Tests file preview workflow |
| User can delete a file | Tests file deletion workflow |
| User can see storage usage information | Verifies storage information display |

## Test Data and Mocks

The test suite uses the following mock data and utilities:

### Mock Data (`mockData.ts`)

- `mockUser`: Sample Google user for authentication tests
- `mockFiles`: Sample drive files with various types (folders, documents, images, PDFs)
- `mockNestedFolders`: Sample folder hierarchy for testing navigation
- `mockStorageInfo`: Sample storage usage information
- `mockFilePermissions`: Sample file sharing permissions

### API Mocks (`handlers.ts` and `server.ts`)

Mock Service Worker (MSW) is used to intercept and mock API requests, simulating the backend without making actual network requests.

### Test Utilities (`testUtils.tsx`)

- Custom render function that wraps components with necessary providers
- Mock implementations of context providers
- Helper functions for testing

## Running Tests

### Running All Tests

```bash
bash run-tests.sh
```

### Running Specific Tests

```bash
# Run a specific test file
NODE_OPTIONS=--experimental-vm-modules npx jest __tests__/unit/FileCard.test.tsx

# Run tests matching a pattern
NODE_OPTIONS=--experimental-vm-modules npx jest -t "renders file card"

# Run all unit tests
NODE_OPTIONS=--experimental-vm-modules npx jest __tests__/unit

# Run all integration tests
NODE_OPTIONS=--experimental-vm-modules npx jest __tests__/integration
```

## Adding New Tests

When adding new tests:

1. Create a test file in the appropriate directory (`__tests__/unit/` or `__tests__/integration/`)
2. Import the component or hook to be tested
3. Import necessary mocks and utilities
4. Write test cases covering:
   - Normal functionality
   - Edge cases
   - Error handling
   - User interactions

Example template for a component test:

```tsx
import React from 'react';
import { render, screen, fireEvent } from '../mocks/testUtils';
import YourComponent from '../../client/src/components/YourComponent';

describe('YourComponent', () => {
  test('renders correctly', () => {
    render(<YourComponent />);
    
    // Check if important elements are rendered
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });
  
  test('handles user interaction', () => {
    const mockHandler = jest.fn();
    render(<YourComponent onAction={mockHandler} />);
    
    // Simulate user interaction
    fireEvent.click(screen.getByRole('button'));
    
    // Check if handler was called
    expect(mockHandler).toHaveBeenCalled();
  });
  
  test('shows error state', () => {
    render(<YourComponent isError={true} errorMessage="Test Error" />);
    
    // Check if error message is displayed
    expect(screen.getByText('Test Error')).toBeInTheDocument();
  });
});
```

## Coverage Reports

To generate a test coverage report:

```bash
NODE_OPTIONS=--experimental-vm-modules npx jest --coverage
```

This will create a coverage report in the `coverage/` directory. Open `coverage/lcov-report/index.html` in a browser to view the detailed report.

The coverage report shows:
- Statement coverage: percentage of statements executed
- Branch coverage: percentage of code branches executed
- Function coverage: percentage of functions called
- Line coverage: percentage of lines executed

Aim for at least 80% coverage across all metrics.

---

*This test cases documentation was last updated on April 27, 2025.*