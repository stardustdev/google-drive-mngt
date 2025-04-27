# Google Drive Integration Application - Test Suite

This directory contains the tests for the Google Drive Integration Application. The tests are organized into unit, integration, and end-to-end tests.

## Test Structure

- `__tests__/unit/`: Contains unit tests for individual components and services
- `__tests__/integration/`: Contains integration tests that test multiple components together
- `__tests__/mocks/`: Contains mock data and utilities used in tests

## Running Tests

### Running All Tests

To run all tests, use the following command:

```bash
bash run-tests.sh
```

This will run all tests and generate a coverage report if the tests pass.

### Running Specific Tests

To run a specific test file, use the following command:

```bash
NODE_OPTIONS=--experimental-vm-modules npx jest path/to/test/file.test.tsx
```

For example, to run the FileCard component tests:

```bash
NODE_OPTIONS=--experimental-vm-modules npx jest __tests__/unit/FileCard.test.tsx
```

### Running Tests by Type

To run all unit tests:

```bash
NODE_OPTIONS=--experimental-vm-modules npx jest __tests__/unit
```

To run all integration tests:

```bash
NODE_OPTIONS=--experimental-vm-modules npx jest __tests__/integration
```

## Test Coverage

To generate a test coverage report, run:

```bash
NODE_OPTIONS=--experimental-vm-modules npx jest --coverage
```

This will generate a coverage report in the `coverage/` directory. Open `coverage/lcov-report/index.html` in a browser to view the detailed report.

## Key Test Files

### Unit Tests

- `FileCard.test.tsx`: Tests for the file card component
- `FileTable.test.tsx`: Tests for the file table component
- `FolderNavigation.test.tsx`: Tests for the folder navigation component
- `FilePreviewModal.test.tsx`: Tests for the file preview modal
- `ShareFileModal.test.tsx`: Tests for the file sharing modal
- `UploadModal.test.tsx`: Tests for the file upload modal
- `DeleteModal.test.tsx`: Tests for the file deletion modal
- `MoveFileModal.test.tsx`: Tests for the file move modal
- `CreateFolderModal.test.tsx`: Tests for the folder creation modal
- `StorageUsage.test.tsx`: Tests for the storage usage component
- `useFiles.test.tsx`: Tests for the useFiles hook
- `useFileSharing.test.tsx`: Tests for the useFileSharing hook
- `apiRoutes.test.ts`: Tests for the API routes
- `googleAuthService.test.ts`: Tests for the Google auth service

### Integration Tests

- `FileManager.test.tsx`: Tests for the FileManager component which integrates many subcomponents
- `MainWorkflow.test.tsx`: Tests for the main user workflows in the application

### Mock Files

- `mockData.ts`: Mock data used in tests
- `handlers.ts`: MSW handlers for mocking API responses
- `server.ts`: MSW server setup
- `testUtils.tsx`: Utilities for testing components

## Adding New Tests

When adding new tests, follow these guidelines:

1. Create a new test file in the appropriate directory (`unit/` or `integration/`)
2. Import the necessary components and mocks
3. Use the provided test utilities for rendering components
4. Mock external dependencies and API calls
5. Write tests that cover various scenarios (happy path, error states, edge cases)
6. Keep tests focused on specific behaviors
7. Use descriptive test names that clearly indicate what's being tested

## Troubleshooting

If you encounter issues with the tests:

1. Make sure you have installed all the necessary dependencies
2. Check that the component paths in your imports are correct
3. Verify that the mock data and handlers match the expected API responses
4. Try running a single test file to isolate the issue
5. Check the console output for detailed error messages