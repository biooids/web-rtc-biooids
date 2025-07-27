// vitest.setup.ts

import { vi, beforeEach } from "vitest";
import { mockDeep, mockReset } from "vitest-mock-extended";
import { PrismaClient } from "./prisma/generated/prisma";
import prisma from "./src/db/prisma";

// Mock the Prisma client module
vi.mock("./src/db/prisma", () => ({
  __esModule: true,
  default: mockDeep<PrismaClient>(),
}));

// Cast the mocked prisma to the type we need for easy use in tests
export const prismaMock = prisma as unknown as ReturnType<
  typeof mockDeep<PrismaClient>
>;

// Reset mocks before each test to ensure test isolation
beforeEach(() => {
  mockReset(prismaMock);
});
