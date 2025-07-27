//src/components/pages/profile/DangerZone.tsx

"use client";

import React from "react";
import { useDeleteMyAccountMutation } from "@/lib/features/user/userApiSlice";
import { useLogoutMutation } from "@/lib/features/auth/authApiSlice";
import { signOut } from "next-auth/react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { LogOut, Trash2, Loader2 } from "lucide-react";

export default function DangerZone() {
  const [deleteMyAccount, { isLoading: isDeletingAccount }] =
    useDeleteMyAccountMutation();
  const [logout, { isLoading: isLoggingOut }] = useLogoutMutation();

  const handleDelete = async () => {
    try {
      await deleteMyAccount().unwrap();
      toast.success("Account deleted successfully.");
      // On successful deletion from the backend, sign out on the client
      await signOut({ callbackUrl: "/auth/login" });
    } catch (err) {
      toast.error("Failed to delete account. Please try again.");
      console.error("Failed to delete account:", err);
    }
  };

  const handleLogout = async () => {
    try {
      await logout().unwrap();
      // On successful backend logout, sign out on the client
      await signOut({ callbackUrl: "/auth/login" });
    } catch (err) {
      toast.error("Failed to log out. Please try again.");
      console.error("Failed to log out:", err);
      // As a fallback, still attempt to sign out on the client
      await signOut({ callbackUrl: "/auth/login" });
    }
  };

  return (
    <Card className="bg-card shadow-lg border-border">
      <CardHeader>
        <CardTitle className="text-destructive">Danger Zone</CardTitle>
        <CardDescription>
          Proceed with caution. These actions are irreversible.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-center p-4 border border-dashed rounded-lg">
          <div>
            <h4 className="font-medium">Log Out</h4>
            <p className="text-sm text-muted-foreground">
              End your current session on this device.
            </p>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            disabled={isLoggingOut}
            className="w-full mt-2 sm:mt-0 sm:w-auto"
          >
            {isLoggingOut ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <LogOut className="mr-2 h-4 w-4" />
            )}
            Logout
          </Button>
        </div>
        <div className="flex flex-col sm:flex-row justify-between items-center p-4 border border-dashed rounded-lg border-destructive bg-destructive/5">
          <div>
            <h4 className="font-medium text-destructive">Delete Account</h4>
            <p className="text-sm text-muted-foreground">
              Permanently delete your account and all associated data.
            </p>
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                disabled={isDeletingAccount}
                className="w-full mt-2 sm:mt-0 sm:w-auto"
              >
                <Trash2 className="mr-2 h-4 w-4" /> Delete My Account
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete
                  your account and remove all your data from our servers.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  disabled={isDeletingAccount}
                  className="bg-destructive hover:bg-destructive/90"
                >
                  {isDeletingAccount && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Yes, Delete My Account
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );
}
