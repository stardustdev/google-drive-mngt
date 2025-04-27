# Contributing to Google Drive Integration App

Thank you for your interest in contributing to the Google Drive Integration App! This document provides guidelines and instructions for contributing to this project.

## Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [Getting Started](#getting-started)
3. [Development Workflow](#development-workflow)
4. [Coding Standards](#coding-standards)
5. [Commit Guidelines](#commit-guidelines)
6. [Pull Request Process](#pull-request-process)
7. [Testing Guidelines](#testing-guidelines)
8. [Documentation](#documentation)
9. [Issue Reporting](#issue-reporting)

## Code of Conduct

Please read and adhere to our [Code of Conduct](./CODE_OF_CONDUCT.md) to foster an inclusive and respectful community.

## Getting Started

1. **Fork the repository**

2. **Clone your fork locally**
   ```bash
   git clone https://github.com/your-username/google-drive-integration.git
   cd google-drive-integration
   ```

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Set up environment variables**
   - Copy `.env.example` to `.env`
   - Configure with your Google OAuth credentials for development

5. **Start the development server**
   ```bash
   npm run dev
   ```

## Development Workflow

1. **Create a new branch from main**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes following our [Coding Standards](#coding-standards)**

3. **Run tests and ensure they pass**
   ```bash
   npm test
   ```

4. **Commit your changes following our [Commit Guidelines](#commit-guidelines)**

5. **Push your branch to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Open a pull request**

## Coding Standards

### General Guidelines

- Use TypeScript for type safety
- Follow the existing project structure
- Keep components small and focused
- Write self-documenting code with clear variable and function names

### TypeScript

- Always define types for props, state, and function parameters/returns
- Use interfaces for public APIs and types for internal structures
- Avoid using `any` type unless absolutely necessary

### React

- Use functional components with hooks
- Extract complex logic into custom hooks
- Keep components small and focused on a single responsibility
- Use the shadcn/ui component library for UI elements

### CSS/Styling

- Use TailwindCSS for styling
- Follow the existing design system
- Use the utility-first approach

## Commit Guidelines

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification for commit messages:

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

Types include:
- **feat**: A new feature
- **fix**: A bug fix
- **docs**: Documentation only changes
- **style**: Changes that do not affect the meaning of the code
- **refactor**: A code change that neither fixes a bug nor adds a feature
- **perf**: A code change that improves performance
- **test**: Adding missing tests or correcting existing tests
- **chore**: Changes to the build process or auxiliary tools

Example:
```
feat(file-preview): add support for markdown preview

Implements a preview component for markdown files using the marked library.
```

## Pull Request Process

1. **Create a descriptive pull request title and description**
   - Explain what changes you've made and why
   - Reference any related issues using the GitHub issue linking syntax

2. **Ensure your code passes all tests**
   - Include new tests if you've added features

3. **Update documentation**
   - Update the README.md or other documentation if necessary

4. **Request a review from at least one maintainer**

5. **Address any feedback from reviewers**

6. **Once approved, your PR will be merged**

## Testing Guidelines

- Write tests for all new features and bug fixes
- Maintain or improve test coverage
- Structure tests in a clear, readable manner

### Types of Tests

1. **Unit Tests**:
   - Test individual components, hooks, and utilities
   - Use React Testing Library for component tests
   - Mock external dependencies

2. **Integration Tests**:
   - Test multiple components working together
   - Test API interactions with mock responses

3. **End-to-End Tests**:
   - Test complete user workflows

### Test Organization

- Place test files in the `__tests__` directory
- Follow the same structure as the source code
- Name test files with `.test.tsx` or `.test.ts` extensions

## Documentation

- Update documentation when adding or changing features
- Document public APIs with JSDoc comments
- Keep the README.md current and useful

## Issue Reporting

When reporting issues, please use the provided issue templates and include:

1. **Issue description**: Clear, concise description of the problem
2. **Reproduction steps**: Detailed steps to reproduce the issue
3. **Expected behavior**: What you expected to happen
4. **Actual behavior**: What actually happened
5. **Environment information**: Browser, OS, and app version
6. **Screenshots**: If applicable
7. **Additional context**: Any other relevant information

---

Thank you for contributing to the Google Drive Integration App! Your efforts help make this project better for everyone.

*Last updated: April 27, 2025*