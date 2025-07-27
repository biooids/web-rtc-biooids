// FILE: src/components/layouts/sidebar/MobileBottomBar.tsx

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navLinks } from "@/components/shared/nav-links";
import { cn } from "@/lib/utils";

export default function MobileBottomBar() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-0 w-full border-t bg-background/95 backdrop-blur-sm md:hidden">
      <nav className="grid h-14 grid-cols-5 items-center justify-center text-xs">
        {navLinks.map((link) => {
          const isActive = pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex flex-col items-center gap-1 pt-2 pb-1 text-muted-foreground transition-colors hover:text-primary",
                isActive && "text-primary"
              )}
            >
              <link.icon className="h-5 w-5" />
              <span className="text-[10px]">{link.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
