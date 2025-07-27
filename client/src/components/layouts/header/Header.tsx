// FILE: src/components/layout/Header.tsx

"use client";
import MobileSidebar from "@/components/layouts/sidebar/MobileSidebar";
import ThemeToggler from "./ThemeToggler";
import { UserAccountNav } from "./UserAccountNav"; // Import the correct component
import { useAppSelector } from "@/lib/hooks/hooks";
import { selectCurrentUser } from "@/lib/features/user/userSlice";

export default function Header() {
  // Get the user data here, in the parent component.
  const currentUser = useAppSelector(selectCurrentUser);

  return (
    <header className="w-full  border bg-background/60 shadow-sm backdrop-blur-lg">
      <div className="flex h-16 items-center justify-between px-4">
        {/* === Left Side === */}
        <div className="flex items-center gap-4">
          <MobileSidebar />
          <div className="hidden sm:block">
            {currentUser ? (
              <h1 className="text-lg font-semibold text-foreground">
                Welcome back,{" "}
                <span className="text-primary">{currentUser.name}</span>
              </h1>
            ) : (
              <h1 className="text-lg font-semibold text-foreground">
                Welcome to <span className="text-primary">auth-starter</span>
              </h1>
            )}
          </div>
        </div>

        {/* === Right Side === */}
        <div className="flex items-center gap-2 md:gap-4">
          <ThemeToggler />
          {/* Pass the user down as a prop. */}
          <UserAccountNav user={currentUser} />
        </div>
      </div>
    </header>
  );
}
