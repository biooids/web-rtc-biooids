// src/features/admin/admin.routes.ts

import { Router } from "express";
import { adminController } from "./admin.controller.js";
import { requireRole } from "@/middleware/admin.middleware.js";
import { authenticate } from "@/middleware/authenticate.js";
import { SystemRole } from "@/prisma-client";

const router: Router = Router();

// Apply authentication and role protection to ALL routes in this file.
router.use(
  authenticate({ required: true }),
  requireRole([SystemRole.SUPER_ADMIN, SystemRole.DEVELOPER])
);

// Dashboard
router.get("/stats", adminController.getDashboardStats);

// User Management
router.get("/users", adminController.getAllUsers);
router.patch("/users/:id/role", adminController.updateUserRole);
router.delete("/users/:id", adminController.deleteUser);

export default router;
