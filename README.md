# Google Drive Integration App

A comprehensive web application that seamlessly integrates with Google Drive, providing a familiar and enhanced interface for managing files and folders.

![Google Drive Integration App](https://via.placeholder.com/1200x600?text=Google+Drive+Integration)

## Features

- 🔐 **Secure Authentication**: Google OAuth 2.0 integration
- 📂 **File Management**: Browse, upload, download, and organize files
- 🔍 **File Preview**: View common file types directly in the application
- 🔄 **Folder Navigation**: Easy navigation with breadcrumb trails
- 👥 **File Sharing**: Share files with other users, manage permissions
- 🔎 **Search**: Find your files quickly with integrated search
- 📊 **Storage Monitoring**: Track your Google Drive storage usage
- 🌓 **Theme Support**: Choose between light and dark themes
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile devices

## Quick Start

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Google Cloud Platform account with Drive API enabled

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/google-drive-integration.git
   cd google-drive-integration
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Copy `.env.example` to `.env`
   - Fill in your Google OAuth credentials (see [Environment Setup](#environment-setup))

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:5000`

## Environment Setup

Create a `.env` file with the following variables:

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

You'll need to create a Google Cloud Platform project and enable the Drive API to get the client ID and secret. See the [detailed documentation](./PROJECT_DOCUMENTATION.md#environment-variables) for step-by-step instructions.

## Technology Stack

- **Frontend**: React, TypeScript, TailwindCSS, shadcn/ui
- **Backend**: Express.js, Node.js
- **API Integration**: Google Drive API, Google OAuth 2.0
- **State Management**: TanStack Query (React Query)
- **Testing**: Jest, Testing Library, MSW
- **Build Tools**: Vite, ESBuild

## Documentation

- [Project Documentation](./PROJECT_DOCUMENTATION.md) - Comprehensive project details
- [Test Cases Documentation](./TEST_CASES_DOCUMENTATION.md) - Detailed test coverage
- [API Documentation](./__tests__/README.md) - Testing setup and instructions

## Running Tests

```bash
# Run all tests
bash run-tests.sh

# Run specific test types
NODE_OPTIONS=--experimental-vm-modules npx jest __tests__/unit
NODE_OPTIONS=--experimental-vm-modules npx jest __tests__/integration

# Generate coverage report
NODE_OPTIONS=--experimental-vm-modules npx jest --coverage
```

## Folder Structure

```
/
├── client/                 # Frontend code
│   └── src/
│       ├── components/     # UI components
│       ├── hooks/          # Custom React hooks
│       ├── lib/            # Utilities and helpers
│       ├── pages/          # Page components
│       └── ...             # Configuration files
├── server/                 # Backend code
│   ├── services/           # Service classes
│   ├── types/              # TypeScript type definitions
│   └── ...                 # API routes and config
├── shared/                 # Shared code
├── __tests__/              # Test files
└── ...                     # Configuration files
```

## Key Features in Detail

### File Preview

The application supports previewing various file types directly in the browser:
- Images: View images in their original resolution
- PDFs: Read PDF documents with an embedded viewer
- Text files: View and copy text content
- Office documents: Preview through Google's viewer

### Folder Navigation

Navigate through your folder hierarchy with an intuitive breadcrumb trail showing the complete path from My Drive to your current location.

### File Sharing

Share files with other users by email address and set permission levels:
- Viewer: Can view but not edit
- Commenter: Can view and comment
- Editor: Can view, comment, and edit

### Storage Usage

Monitor your Google Drive storage usage with a visual progress indicator showing:
- Total storage used
- Storage breakdown by file type
- Percentage of total storage quota

## Contributing

Contributions are welcome! Please read our [Contributing Guidelines](./CONTRIBUTING.md) for details on how to submit pull requests, report issues, and suggest improvements.

## License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

---

*README last updated: April 27, 2025*