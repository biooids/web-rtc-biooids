// src/features/auth/auth.service.test.ts

import { describe, it, expect, vi } from "vitest";
import bcrypt from "bcryptjs";
import { authService } from "./auth.service";
import { prismaMock } from "../../../vitest.setup";
import { HttpError } from "../../utils/HttpError";

describe("AuthService - loginUser", () => {
  it("should throw a 404 HttpError if the user is not found", async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);

    await expect(
      authService.loginUser({
        email: "notfound@test.com",
        password: "password",
      })
    ).rejects.toThrow(
      new HttpError(404, "No account found with this email address.")
    );

    expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
      where: { email: "notfound@test.com" },
    });
  });

  it("should throw a 401 HttpError for an incorrect password", async () => {
    const mockUser = {
      id: "1",
      email: "test@test.com",
      hashedPassword: "hashed_password",
    } as any;
    prismaMock.user.findUnique.mockResolvedValue(mockUser);

    vi.spyOn(bcrypt, "compare").mockImplementation(() =>
      Promise.resolve(false)
    );

    await expect(
      authService.loginUser({
        email: "test@test.com",
        password: "wrong_password",
      })
    ).rejects.toThrow(
      new HttpError(401, "The password you entered is incorrect.")
    );
  });
});
