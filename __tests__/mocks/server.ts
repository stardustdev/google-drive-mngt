import { setupServer } from 'msw/node';
import { handlers } from './handlers';

// Setup MSW server with handlers
export const server = setupServer(...handlers);

// Establish API mocking before all tests
beforeAll(() => server.listen());

// Reset any request handlers that were added during the tests
afterEach(() => server.resetHandlers());

// Clean up after the tests
afterAll(() => server.close());