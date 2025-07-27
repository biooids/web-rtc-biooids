//src/components/pages/profile/ChangePasswordForm.tsx

"use client";

import React, { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useChangePasswordMutation } from "@/lib/features/auth/authApiSlice";
import {
  changePasswordSchema,
  ChangePasswordFormValues,
} from "@/lib/schemas/auth.schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff, Loader2, Save, CheckCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut } from "next-auth/react";

export default function ChangePasswordForm() {
  const [changePassword, { isLoading }] = useChangePasswordMutation();
  const [uiMessage, setUiMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
  });

  const onSubmit: SubmitHandler<ChangePasswordFormValues> = async (data) => {
    setUiMessage(null);
    try {
      await changePassword(data).unwrap();
      setUiMessage({
        type: "success",
        text: "Password updated successfully. You will be logged out for security.",
      });
      reset();
      setTimeout(() => {
        signOut({ callbackUrl: "/auth/login" });
      }, 2000);
    } catch (err: any) {
      setUiMessage({
        type: "error",
        text: err?.data?.message || "Failed to update password.",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Change Password</CardTitle>
        <CardDescription>
          Update your password here. For security, you will be logged out after
          a successful change.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {uiMessage && (
          <Alert
            variant={uiMessage.type === "error" ? "destructive" : "default"}
            className={cn(
              "mb-6",
              uiMessage.type === "success" &&
                "border-green-500/50 text-green-700"
            )}
          >
            {uiMessage.type === "success" ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <Info className="h-4 w-4" />
            )}
            <AlertDescription>{uiMessage.text}</AlertDescription>
          </Alert>
        )}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-1.5">
            <Label htmlFor="currentPassword">Current Password</Label>
            <div className="relative">
              <Input
                id="currentPassword"
                type={showCurrent ? "text" : "password"}
                {...register("currentPassword")}
                disabled={isLoading}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute inset-y-0 right-0 h-full px-3 text-muted-foreground"
              >
                <Eye size={18} />
              </Button>
            </div>
            {errors.currentPassword && (
              <p className="text-destructive text-xs mt-1">
                {errors.currentPassword.message}
              </p>
            )}
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="newPassword">New Password</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNew ? "text" : "password"}
                  {...register("newPassword")}
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute inset-y-0 right-0 h-full px-3 text-muted-foreground"
                >
                  <Eye size={18} />
                </Button>
              </div>
              {errors.newPassword && (
                <p className="text-destructive text-xs mt-1">
                  {errors.newPassword.message}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="confirmNewPassword">Confirm New Password</Label>
              <Input
                id="confirmNewPassword"
                type="password"
                {...register("confirmNewPassword")}
                disabled={isLoading}
              />
              {errors.confirmNewPassword && (
                <p className="text-destructive text-xs mt-1">
                  {errors.confirmNewPassword.message}
                </p>
              )}
            </div>
          </div>
          <div>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Update Password
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
