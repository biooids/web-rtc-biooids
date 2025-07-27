// src/routes/apiRoutes.ts

import { Router } from "express";
import authRoutes from "../features/auth/auth.routes.js";
import userRoutes from "../features/user/user.routes.js";
import adminRoutes from "../features/admin/admin.routes.js";
import { authenticate } from "../middleware/authenticate.js";

const router: Router = Router();

// **IMPROVED**: Run the flexible authenticate middleware on all routes.
// It will attach `req.user` if a valid token is present, or `null` otherwise.
router.use(authenticate());

router.get("/health", (_req, res) => {
  res
    .status(200)
    .json({ status: "success", message: "API router is healthy." });
});

router.use("/auth", authRoutes);
router.use("/users", userRoutes); // Note: Renamed to /users for RESTful convention
router.use("/admin", adminRoutes);

export default router;
