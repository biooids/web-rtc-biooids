//src/components/pages/auth/SignUp.tsx

"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { signUpSchema, SignUpFormValues } from "@/lib/schemas/auth.schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
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

const PasswordStrengthIndicator = ({ score }: { score: number }) => {
  const levels = [
    { color: "bg-muted", width: "w-1/4" },
    { color: "bg-muted", width: "w-1/4" },
    { color: "bg-muted", width: "w-1/4" },
    { color: "bg-muted", width: "w-1/4" },
  ];

  if (score >= 1) levels[0].color = "bg-red-500";
  if (score >= 2) levels[1].color = "bg-orange-500";
  if (score >= 3) levels[2].color = "bg-yellow-500";
  if (score >= 4) levels[3].color = "bg-green-500";

  return (
    <div className="flex h-1.5 w-full rounded-full overflow-hidden mt-1">
      {levels.map((level, index) => (
        <div
          key={index}
          className={cn("h-full transition-colors", level.width, level.color)}
        />
      ))}
    </div>
  );
};

const SignUpForm = () => {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors, isSubmitting },
    setFocus,
  } = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      acceptTerms: false,
    },
  });

  const currentPassword = watch("password", "");

  const passwordStrength = useMemo(() => {
    if (!currentPassword) {
      return { label: "Too Short", color: "text-muted-foreground", score: 0 };
    }
    let score = 0;
    if (currentPassword.length >= 8) score++;
    if (/\d/.test(currentPassword)) score++;
    if (/[a-z]/.test(currentPassword) && /[A-Z]/.test(currentPassword)) score++;
    if (/[^A-Za-z0-9]/.test(currentPassword)) score++;

    if (score >= 4)
      return { label: "Very Strong", color: "text-green-500", score: 4 };
    if (score === 3)
      return { label: "Strong", color: "text-yellow-500", score: 3 };
    if (score === 2)
      return { label: "Medium", color: "text-orange-500", score: 2 };
    if (score === 1) return { label: "Weak", color: "text-red-500", score: 1 };

    return { label: "Too Short", color: "text-red-500", score: 0 };
  }, [currentPassword]);

  useFocusOnError(errors, setFocus);

  const onSubmit: SubmitHandler<SignUpFormValues> = async (data) => {
    setFormError(null);
    try {
      const result = await signIn("credentials", {
        redirect: false,
        email: data.email,
        password: data.password,
        username: data.username,
        name: data.name,
        action: "signup",
      });

      if (result?.error) {
        setFormError(result.error);
      } else if (result?.ok) {
        // On successful signup, redirect to login so they can sign in with their new credentials
        router.push("/");
      } else {
        setFormError("An unexpected error occurred. Please try again.");
      }
    } catch (error) {
      console.error("Sign up submission error:", error);
      setFormError("An unexpected server error occurred.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-md bg-card border-border shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl sm:text-3xl font-bold">
            Create Your Account
          </CardTitle>
          <CardDescription>
            Join our community! Already have an account?{" "}
            <Link
              href="/auth/login"
              className="text-primary hover:underline focus:outline-none focus:ring-1 focus:ring-ring rounded-sm"
            >
              Log In
            </Link>
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <CardContent className="space-y-4">
            {formError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{formError}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="e.g., Ada Lovelace"
                autoComplete="name"
                {...register("name")}
                className={cn(errors.name && "border-destructive")}
                aria-invalid={!!errors.name}
                aria-describedby="name-error"
              />
              {errors.name && (
                <p id="name-error" className="text-destructive text-xs">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="e.g., ada_lovelace99"
                autoComplete="username"
                {...register("username")}
                className={cn(errors.username && "border-destructive")}
                aria-invalid={!!errors.username}
                aria-describedby="username-error"
              />
              {errors.username && (
                <p id="username-error" className="text-destructive text-xs">
                  {errors.username.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                {...register("email")}
                className={cn(errors.email && "border-destructive")}
                aria-invalid={!!errors.email}
                aria-describedby="email-error"
              />
              {errors.email && (
                <p id="email-error" className="text-destructive text-xs">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a strong password"
                  autoComplete="new-password"
                  {...register("password")}
                  className={cn(
                    "pr-10",
                    errors.password && "border-destructive"
                  )}
                  aria-invalid={!!errors.password}
                  aria-describedby="password-error password-strength-label"
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
              {currentPassword && (
                <>
                  <PasswordStrengthIndicator score={passwordStrength.score} />
                  <p
                    id="password-strength-label"
                    className={cn("text-xs", passwordStrength.color)}
                  >
                    Strength: {passwordStrength.label}
                  </p>
                </>
              )}
              {errors.password && (
                <p id="password-error" className="text-destructive text-xs">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Repeat your password"
                  autoComplete="new-password"
                  {...register("confirmPassword")}
                  className={cn(
                    "pr-10",
                    errors.confirmPassword && "border-destructive"
                  )}
                  aria-invalid={!!errors.confirmPassword}
                  aria-describedby="confirmPassword-error"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 h-full px-3 text-muted-foreground hover:text-foreground"
                  aria-label={
                    showConfirmPassword
                      ? "Hide confirm password"
                      : "Show confirm password"
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </Button>
              </div>
              {errors.confirmPassword && (
                <p
                  id="confirmPassword-error"
                  className="text-destructive text-xs"
                >
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            <Controller
              name="acceptTerms"
              control={control}
              render={({ field, fieldState: { error } }) => (
                <div className="pt-2">
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="acceptTerms"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      onBlur={field.onBlur}
                      ref={field.ref}
                      aria-invalid={!!error}
                      aria-describedby="acceptTerms-error"
                      className={cn(error && "border-destructive")}
                    />
                    <div className="grid gap-1.5 leading-none">
                      <Label
                        htmlFor="acceptTerms"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        I accept the{" "}
                        <Link
                          href="/terms"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-primary hover:underline"
                        >
                          Terms of Service
                        </Link>
                      </Label>
                      {error && (
                        <p
                          id="acceptTerms-error"
                          className="text-destructive text-xs"
                        >
                          {error.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            />
            <SocialLogin />
          </CardContent>

          <CardFooter>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-4"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin mr-2 h-4 w-4" />
                  Creating Account...
                </>
              ) : (
                "Create Account"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default SignUpForm;
