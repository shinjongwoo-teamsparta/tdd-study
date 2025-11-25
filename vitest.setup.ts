import '@testing-library/jest-dom';
import { vi, beforeEach } from 'vitest';

// Mock next/navigation globally
const mockRouterPush = vi.fn();

// Make mockPush available globally for tests
(global as any).mockPush = mockRouterPush;

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: (global as any).mockPush,
  }),
}));

// Clear mock before each test
beforeEach(() => {
  (global as any).mockPush.mockClear();
});

