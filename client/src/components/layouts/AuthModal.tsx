// src/components/auth/AuthModal.tsx
"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation"; // FIX: Import the useRouter hook
import { useAppDispatch, useAppSelector } from "@/lib/hooks/hooks";
import {
  closeAuthModal,
  selectAuthModalState,
} from "@/lib/features/ui/uiSlice";
import { Lock } from "lucide-react";

export function AuthModal() {
  const router = useRouter(); // FIX: Initialize the router
  const dispatch = useAppDispatch();
  const { isAuthModalOpen, interactionType } =
    useAppSelector(selectAuthModalState);

  const handleClose = () => dispatch(closeAuthModal());

  const handleNavigate = (path: string) => {
    handleClose();
    router.push(path);
  };

  return (
    <Dialog open={isAuthModalOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-xs">
        <DialogHeader className="text-center items-center pt-2">
          <Lock className="h-8 w-8 mb-3 text-primary" />
          <DialogTitle className="text-lg">Authentication Required</DialogTitle>
          <DialogDescription className="text-xs px-2 leading-relaxed">
            Please log in or create an account to {interactionType}.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-2.5 mt-3">
          {/* FIX: Use a handler to close the modal before navigating */}
          <Button size="sm" onClick={() => handleNavigate("/auth/login")}>
            Log In
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => handleNavigate("/auth/signup")}
          >
            Sign Up
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
