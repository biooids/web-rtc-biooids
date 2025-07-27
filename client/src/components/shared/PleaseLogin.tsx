//src/components/shared/PleaseLogin.tsx
"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";

interface PleaseLoginProps {
  title?: string;
  message: string;
}

export default function PleaseLogin({
  title = "Authentication Required",
  message,
}: PleaseLoginProps) {
  const router = useRouter();

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="w-full max-w-md rounded-lg border-2 border-dashed border-muted-foreground/30 bg-card p-8 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <Lock className="h-8 w-8 text-primary" />
        </div>
        <h2 className="mt-6 text-2xl font-semibold tracking-tight">{title}</h2>
        <p className="mt-2 text-muted-foreground">{message}</p>
        <div className="mt-8 flex justify-center gap-4">
          <Button onClick={() => router.push("/auth/login")}>Log In</Button>
          <Button variant="outline" onClick={() => router.push("/auth/signup")}>
            Sign Up
          </Button>
        </div>
      </div>
    </div>
  );
}
