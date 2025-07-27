// src/features/health.test.ts

import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../app"; // Import your main Express app

describe("GET /api/v1/health", () => {
  it("should return a 200 status and a success message", async () => {
    // Act: Make a request to the endpoint
    const response = await request(app).get("/api/v1/health");

    // Assert: Check the response
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      status: "success",
      message: "API router is healthy.",
    });
  });
});
