// src/types/express.d.ts

import { SystemRole } from "@/prisma-client";

// This line is important for declaration merging to work correctly.
export {};

// Define the shape of the user object that your deserializeUser middleware creates
interface SanitizedUser {
  id: string;
  name: string;
  username: string;
  email: string;
  profileImage: string | null;
  bannerImage: string | null;
  systemRole: SystemRole;
}

declare global {
  namespace Express {
    // Here, we are "merging" our custom user property into the global Express Request type
    interface Request {
      user?: SanitizedUser | null;
    }
  }
}
