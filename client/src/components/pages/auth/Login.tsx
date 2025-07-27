//src/components/pages/auth/Login.tsx
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Eye, EyeOff, Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { loginSchema, LoginFormValues } from "@/lib/schemas/auth.schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { useFocusOnError } from "@/lib/hooks/useFocusOnError";
import SocialLogin from "./SocialLogin";

const LoginForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  // --- FIX: Restored the missing useState declaration ---
  const [showPassword, setShowPassword] = useState(false);

  // This state now handles both errors and informational messages
  const [formMessage, setFormMessage] = useState<{
    type: "error" | "info" | "success";
    text: string;
  } | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setFocus,
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
  });

  // This useEffect now handles all messages and errors from the URL parameters
  useEffect(() => {
    const error = searchParams.get("error");
    const status = searchParams.get("status");

    if (status === "signup_success") {
      setFormMessage({
        type: "success",
        text: "Account created successfully! Please log in.",
      });
    }

    if (!error) return;

    switch (error) {
      case "CredentialsSignin":
        setFormMessage({
          type: "error",
          text: "Invalid email or password. Please try again.",
        });
        break;
      case "OAuthSignin":
      case "OAuthCallback":
      case "OAuthCreateAccount":
      case "EmailCreateAccount":
        setFormMessage({
          type: "error",
          text: "There was an issue with the social login provider. Please try again.",
        });
        break;
      case "SessionExpired":
        setFormMessage({
          type: "info",
          text: "Your session has expired. Please log in again.",
        });
        break;
      default:
        setFormMessage({
          type: "error",
          text: "An unknown authentication error occurred.",
        });
    }
  }, [searchParams]);

  const onSubmit: SubmitHandler<LoginFormValues> = async (data) => {
    setFormMessage(null); // Clear previous messages on new submission
    try {
      const result = await signIn("credentials", {
        redirect: false,
        email: data.email,
        password: data.password,
        action: "login",
      });

      if (result?.error) {
        // The error message from `authorize` in NextAuth will be shown here
        setFormMessage({ type: "error", text: result.error });
      } else if (result?.ok) {
        router.push(callbackUrl);
      }
    } catch (error) {
      setFormMessage({
        type: "error",
        text: "An unexpected server error occurred.",
      });
    }
  };

  useFocusOnError(errors, setFocus);

  // Get properties from register to wrap onChange
  const emailRegister = register("email");
  const passwordRegister = register("password");

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-md bg-card border-border shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl sm:text-3xl font-bold">
            Welcome Back!
          </CardTitle>
          <CardDescription>
            Don't have an account yet?{" "}
            <Link
              href="/auth/signup"
              className="text-primary hover:underline focus:outline-none focus:ring-1 focus:ring-ring rounded-sm"
            >
              Sign Up
            </Link>
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <CardContent className="space-y-4">
            {formMessage && (
              <Alert
                variant={
                  formMessage.type === "error" ? "destructive" : "default"
                }
                className={cn(
                  formMessage.type === "info" &&
                    "bg-blue-500/10 border-blue-500/30 text-blue-700 dark:text-blue-300",
                  formMessage.type === "success" &&
                    "bg-green-500/10 border-green-500/30 text-green-700 dark:text-green-300"
                )}
              >
                {formMessage.type === "error" ? (
                  <AlertCircle className="h-4 w-4" />
                ) : (
                  <CheckCircle className="h-4 w-4" />
                )}
                <AlertDescription>{formMessage.text}</AlertDescription>
              </Alert>
            )}

            <SocialLogin />

            <div className="space-y-1.5">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                {...emailRegister}
                onChange={(e) => {
                  emailRegister.onChange(e);
                  if (formMessage) setFormMessage(null);
                }}
                className={cn(errors.email && "border-destructive")}
                aria-invalid={!!errors.email}
              />
              {errors.email && (
                <p className="text-destructive text-xs">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <Label htmlFor="password">Password</Label>
                <Link
                  href="/auth/forgot-password"
                  className="text-xs text-primary hover:underline"
                  tabIndex={-1}
                >
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  {...passwordRegister}
                  onChange={(e) => {
                    passwordRegister.onChange(e);
                    if (formMessage) setFormMessage(null);
                  }}
                  className={cn(
                    "pr-10",
                    errors.password && "border-destructive"
                  )}
                  aria-invalid={!!errors.password}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 h-full px-3 text-muted-foreground hover:text-foreground"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </Button>
              </div>
              {errors.password && (
                <p className="text-destructive text-xs">
                  {errors.password.message}
                </p>
              )}
            </div>
          </CardContent>

          <CardFooter>
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin mr-2 h-4 w-4" />
                  Logging In...
                </>
              ) : (
                "Log In"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default LoginForm;
