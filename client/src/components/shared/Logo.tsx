// FILE: src/components/shared/Logo.tsx

import Image from "next/image"; // Keep this import
import { cn } from "@/lib/utils";
// REMOVE THIS LINE: import logo from "@/public/logo.png";

export default function Logo({ isCollapsed }: { isCollapsed?: boolean }) {
  return (
    <div className="inline-flex items-center gap-2 text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm">
      {/* Change the 'src' prop to a string path */}
      <Image
        src="/logo.png" // This path points to public/logo.png
        alt="Do It Your Self Logo"
        width={24}
        height={24}
      />

      <span
        className={cn(
          "text-lg font-bold tracking-tighter",
          isCollapsed && "hidden"
        )}
      >
        Do_It_Your_Self
      </span>
    </div>
  );
}
