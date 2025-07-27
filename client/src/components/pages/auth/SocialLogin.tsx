//src/components/pages/auth/SocialLogin.tsx

"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { GitBranchPlus } from "lucide-react";

// A simple Google SVG icon component
const GoogleIcon = () => (
  <svg role="img" viewBox="0 0 24 24" className="h-4 w-4 mr-2">
    <path
      fill="currentColor"
      d="M12.48 10.92v3.28h7.84c-.24 1.84-.85 3.18-1.73 4.1-1.02 1.02-2.3 1.62-3.85 1.62-4.64 0-8.54-3.82-8.54-8.42s3.9-8.42 8.54-8.42c2.48 0 4.38.92 5.98 2.42l2.26-2.26C18.83 2.15 16.05 1 12.48 1 5.88 1 1 6.64 1 12.55s4.88 11.55 11.48 11.55c3.45 0 6.04-1.18 7.96-3.1 2.1-2.1 2.56-5.2 2.56-7.84 0-.5-.04-.9-.12-1.32H12.48z"
    ></path>
  </svg>
);

export default function SocialLogin() {
  // We define a default callbackUrl in case the user lands here directly
  const handleSignIn = (provider: "google" | "github") => {
    signIn(provider, { callbackUrl: "/" });
  };

  return (
    <div className="space-y-4 ">
      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>
      {/* OAuth Buttons */}
      <div className="grid grid-cols-2 gap-4 ">
        <Button
          variant="outline"
          onClick={() => handleSignIn("github")}
          type="button" // <-- The crucial fix
        >
          <GitBranchPlus className="mr-2 h-4 w-4" />
          GitHub
        </Button>
        <Button
          variant="outline"
          onClick={() => handleSignIn("google")}
          type="button" // <-- The crucial fix
        >
          <GoogleIcon />
          Google
        </Button>
      </div>
    </div>
  );
}
