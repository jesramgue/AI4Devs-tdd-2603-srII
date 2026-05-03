import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended';
import type { PrismaClient as PrismaClientType } from '@prisma/client';

export type MockPrismaClient = DeepMockProxy<PrismaClientType>;

/**
 * Singleton mock instance.
 * Every `new PrismaClient()` call in production code returns this same object,
 * so tests can set up expectations and assert calls on a single reference.
 */
export const prismaMock = mockDeep<PrismaClientType>() as MockPrismaClient;

/**
 * Reset all mocks before each test to prevent state leaking between tests.
 */
beforeEach(() => {
  mockReset(prismaMock);
});

/**
 * Mock PrismaClient constructor — always returns the singleton above.
 * Satisfies `import { PrismaClient } from '@prisma/client'` in production models.
 */
export const PrismaClient = jest.fn().mockImplementation(() => prismaMock);

/**
 * Re-export the real Prisma namespace so that `instanceof` checks such as
 * `error instanceof Prisma.PrismaClientInitializationError` still work in tests.
 */
const prismaActual = jest.requireActual(
  require.resolve('@prisma/client', { paths: [process.cwd()] })
) as typeof import('@prisma/client');

export const Prisma = prismaActual.Prisma;
