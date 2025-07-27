// FILE: src/components/layouts/sidebar/MobileSidebar.tsx

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Settings } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { navLinks, settingsLink } from "@/components/shared/nav-links";
import { cn } from "@/lib/utils";

export default function MobileSidebar() {
  const pathname = usePathname();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="shrink-0 md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle navigation menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="flex flex-col p-4">
        {/* Accessibility: Title and Description for screen readers */}
        <SheetHeader className="text-left border-b pb-4">
          <SheetTitle>
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <span className="">Your App Name</span>
            </Link>
          </SheetTitle>
          <SheetDescription>Select a page to navigate to.</SheetDescription>
        </SheetHeader>

        {/* Main navigation links */}
        <div className="flex-1 mt-4">
          <nav className="grid gap-2 text-base font-medium">
            {navLinks.map((link) => {
              const isActive = pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                    isActive && "bg-muted text-primary"
                  )}
                >
                  <link.icon className="h-5 w-5" />
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Settings link at the bottom */}
        <div className="mt-auto">
          <Link
            href={settingsLink.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
              pathname.startsWith(settingsLink.href) && "bg-muted text-primary"
            )}
          >
            <Settings className="h-5 w-5" />
            {settingsLink.label}
          </Link>
        </div>
      </SheetContent>
    </Sheet>
  );
}
