# Google Drive Integration Application

## Project Overview

This project is a web application that integrates with Google Drive API to provide a streamlined file management solution. It offers a familiar interface for users to manage their Google Drive files with features like browsing, uploading, downloading, sharing, and organizing files.

![Google Drive Integration](https://via.placeholder.com/600x400?text=Google+Drive+Integration)

## Table of Contents

1. [Features](#features)
2. [Technology Stack](#technology-stack)
3. [Project Structure](#project-structure)
4. [Setup and Installation](#setup-and-installation)
5. [Environment Variables](#environment-variables)
6. [Architecture](#architecture)
7. [Components](#components)
8. [API Routes](#api-routes)
9. [Authentication](#authentication)
10. [Hooks](#hooks)
11. [Testing](#testing)
12. [Best Practices](#best-practices)
13. [Troubleshooting](#troubleshooting)

## Features

- **Authentication**: Secure Google OAuth 2.0 authentication
- **File Browser**: Browse files and folders with list and grid views
- **Upload**: Upload files to Google Drive with drag-and-drop support
- **Download**: Download files directly from the application
- **File Preview**: Preview various file types (images, PDFs, text, etc.)
- **Folder Management**: Create, navigate, and organize folders
- **File Actions**: Move, delete, and share files with others
- **Search**: Search files and folders across Google Drive
- **Storage Usage**: View and monitor Google Drive storage usage
- **Responsive Design**: Works on desktop and mobile devices
- **Theme Support**: Light and dark mode themes

## Technology Stack

- **Frontend**:
  - React.js
  - TypeScript
  - Tailwind CSS
  - shadcn/ui components
  - TanStack Query (React Query)
  - Wouter (routing)
  - Zod (validation)

- **Backend**:
  - Express.js
  - Node.js
  - Passport.js (OAuth)
  - REST API

- **External APIs**:
  - Google Drive API
  - Google OAuth 2.0

- **Testing**:
  - Jest
  - Testing Library
  - Mock Service Worker (MSW)

- **Tools**:
  - Vite (build tool)
  - ESBuild (bundler)
  - TypeScript

## Project Structure

```
/
├── client/                 # Frontend code
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utilities and helpers
│   │   ├── pages/          # Page components
│   │   ├── App.tsx         # Main App component
│   │   ├── index.css       # Global styles
│   │   └── main.tsx        # Entry point
│   └── index.html          # HTML template
│
├── server/                 # Backend code
│   ├── services/           # Service classes
│   ├── types/              # TypeScript type definitions
│   ├── index.ts            # Server entry point
│   ├── routes.ts           # API routes
│   ├── storage.ts          # Storage interface
│   └── vite.ts             # Vite server configuration
│
├── shared/                 # Shared code between frontend and backend
│   └── schema.ts           # Shared type definitions
│
├── __tests__/              # Test files
│   ├── unit/               # Unit tests
│   ├── integration/        # Integration tests
│   ├── mocks/              # Test mocks and fixtures
│   └── README.md           # Testing documentation
│
├── components.json         # shadcn/ui configuration
├── drizzle.config.ts       # Drizzle ORM configuration
├── package.json            # Project dependencies
├── tsconfig.json           # TypeScript configuration
└── vite.config.ts          # Vite configuration
```

## Setup and Installation

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn
- Google Cloud Platform account with Drive API enabled

### Installation Steps

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd google-drive-integration
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Copy `.env.example` to `.env`
   - Fill in the required environment variables (see [Environment Variables](#environment-variables))

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:5000`

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

# Session
SESSION_SECRET=your-session-secret

# Server
PORT=5000
NODE_ENV=development
```

## Architecture

The application follows a modern architecture with clear separation of concerns:

### Frontend Architecture

- **Component-Based Structure**: Reusable UI components using React
- **Custom Hooks**: Encapsulate API calls and business logic
- **Context API**: Global state management for authentication and themes
- **React Query**: Data fetching, caching, and state management
- **Type Safety**: TypeScript for robust development

### Backend Architecture

- **RESTful API**: Clear endpoints for various operations
- **Service Layer**: Encapsulates Google Drive API interactions
- **Middleware**: Authentication, error handling, and request processing
- **Session Management**: OAuth token storage and refresh

### Data Flow

1. **UI Events**: User interactions trigger component state changes
2. **React Query**: Manages API requests and caching
3. **Express Backend**: Processes requests and interacts with Google Drive API
4. **Google Drive API**: Performs the actual file operations
5. **Response Handling**: Data is returned to the frontend and rendered

## Components

### Core Components

#### FileManager
The main component that orchestrates the file management interface. It handles file listing, navigation, and coordinating other components.

#### FileTable / FileCard
Two visualization components for displaying files in either a table (list) or card (grid) view.

#### FolderNavigation
Displays the current path hierarchy and enables navigation between folders.

#### StorageUsage
Shows the current storage usage with a progress bar and percentage.

### Modal Components

#### UploadModal
Handles file uploads with drag-and-drop support and progress tracking.

#### FilePreviewModal
Provides previews for various file types (images, PDFs, text files, etc.).

#### ShareFileModal
Manages sharing files with other users, including permission settings.

#### DeleteModal
Confirmation dialog for file deletion.

#### MoveFileModal
Interface for moving files between folders.

#### CreateFolderModal
Form for creating new folders.

### UI Components

The application uses shadcn/ui components, which are built on top of Radix UI primitives and styled with Tailwind CSS. These include:

- Buttons
- Dialogs
- Tabs
- Forms
- Tooltips
- Progress indicators
- Dropdown menus

## API Routes

The application exposes the following API endpoints:

### Authentication

- `GET /api/auth/google`: Initiates Google OAuth flow
- `GET /api/auth/google/callback`: OAuth callback handler
- `GET /api/auth/user`: Gets current authenticated user
- `POST /api/auth/logout`: Logs out the current user

### Files and Folders

- `GET /api/drive/files`: Lists files (optionally from a specific folder)
- `GET /api/drive/files/:fileId`: Gets details for a specific file
- `GET /api/drive/folders/:folderId/files`: Lists files within a specific folder
- `POST /api/drive/files/upload`: Uploads a file
- `GET /api/drive/files/:fileId/download`: Downloads a file
- `DELETE /api/drive/files/:fileId`: Deletes a file
- `POST /api/drive/folders`: Creates a new folder
- `PATCH /api/drive/files/:fileId/move`: Moves a file to a different folder

### Sharing and Permissions

- `GET /api/drive/permissions/:fileId`: Gets sharing permissions for a file
- `POST /api/drive/permissions/:fileId`: Shares a file with another user
- `DELETE /api/drive/permissions/:fileId/:permissionId`: Removes sharing permission

### Search and Storage

- `GET /api/drive/search`: Searches for files
- `GET /api/drive/storage`: Gets storage usage information

## Authentication

The application uses Google OAuth 2.0 for authentication:

1. User initiates login by clicking the "Sign in with Google" button
2. They are redirected to the Google consent screen
3. After granting permission, they are redirected back with an access token
4. The server stores this token in the user's session
5. Subsequent API requests include this token for authentication
6. Tokens are automatically refreshed when they expire

### Token Management

- Access tokens are stored in the user's session
- Refresh tokens are used to get new access tokens when needed
- The server handles token refresh transparently

## Hooks

The application uses several custom React hooks to encapsulate data fetching and business logic:

### useFiles

Manages file operations, including:
- Fetching file lists
- Creating folders
- Uploading files
- Deleting files
- Moving files

### useFileSharing

Handles file sharing operations:
- Getting file permissions
- Adding new permissions (sharing)
- Removing permissions

### useStorageInfo

Retrieves and formats storage usage information.

### useGoogleAuth

Manages authentication state and operations:
- Login
- Logout
- Checking authentication status

## Testing

The application includes a comprehensive test suite covering both unit and integration tests.

### Test Structure

- `__tests__/unit/`: Unit tests for individual components and services
- `__tests__/integration/`: Integration tests for multiple components working together
- `__tests__/mocks/`: Mock data and utilities for testing

### Running Tests

Execute tests using the following commands:

```bash
# Run all tests
bash run-tests.sh

# Run specific test file
NODE_OPTIONS=--experimental-vm-modules npx jest path/to/test/file.test.tsx

# Run all unit tests
NODE_OPTIONS=--experimental-vm-modules npx jest __tests__/unit

# Run all integration tests
NODE_OPTIONS=--experimental-vm-modules npx jest __tests__/integration

# Generate coverage report
NODE_OPTIONS=--experimental-vm-modules npx jest --coverage
```

### Test Coverage

The test suite covers:
- Component rendering
- User interactions
- API calls
- Error handling
- Edge cases

For detailed testing documentation, see [__tests__/README.md](./__tests__/README.md).

## Best Practices

The project follows several best practices:

### Code Organization

- **Component Structure**: Each component is in its own file
- **Shared Logic**: Common functionality is extracted into hooks and utilities
- **Type Definitions**: TypeScript interfaces for props and state

### Performance Optimization

- **React Query**: Efficient data fetching and caching
- **Lazy Loading**: Components are loaded only when needed
- **Memoization**: Prevents unnecessary re-renders
- **Error Boundaries**: Prevents application crashes

### User Experience

- **Loading States**: Feedback for asynchronous operations
- **Error Handling**: User-friendly error messages
- **Responsive Design**: Works on various screen sizes
- **Accessibility**: ARIA attributes and keyboard navigation

### Security

- **OAuth 2.0**: Secure authentication flow
- **Input Validation**: Form data is validated using Zod
- **CSRF Protection**: Cross-site request forgery protection
- **Session Management**: Secure cookie-based sessions

## Troubleshooting

### Common Issues

#### Authentication Failures

- Verify Google Cloud credentials are correct
- Check callback URL matches your Google Cloud settings
- Ensure session storage is working correctly

#### File Upload Issues

- Check file size limits
- Verify correct MIME types
- Inspect network requests for errors

#### API Errors

- Check browser console for error details
- Verify user has appropriate permissions
- Ensure valid Google Drive API credentials

### Debug Logging

The application includes comprehensive logging:
- Frontend: console logs and React Query devtools
- Backend: Express request logging
- Tests: Detailed error output

For more detailed information, refer to the individual component and service documentation.

---

## License

This project is licensed under the MIT License - see the LICENSE file for details.

---

*This documentation was last updated on April 27, 2025.*