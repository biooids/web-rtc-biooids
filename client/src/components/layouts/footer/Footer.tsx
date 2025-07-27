// FILE: src/components/layouts/Footer.tsx

"use client";

import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 md:px-6 py-6 flex flex-col sm:flex-row items-center justify-between">
        <p className="text-sm text-muted-foreground">
          © {currentYear} Your App Name. All Rights Reserved.
        </p>
        <nav className="flex items-center gap-4 sm:gap-6 mt-4 sm:mt-0">
          <Link
            href="/terms"
            className="text-sm hover:underline underline-offset-4 text-muted-foreground"
          >
            Terms of Service
          </Link>
          <Link
            href="/privacy"
            className="text-sm hover:underline underline-offset-4 text-muted-foreground"
          >
            Privacy Policy
          </Link>
        </nav>
      </div>
    </footer>
  );
}
