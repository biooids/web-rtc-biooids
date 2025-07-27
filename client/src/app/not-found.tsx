// src/app/not-found.tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center bg-background px-4 text-center">
      <div className="max-w-md">
        {/* Creative SVG or Icon */}
        <div className="mb-6 text-primary">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="mx-auto h-24 w-24"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.5,15.5 L19,19"
              strokeDasharray="2 2"
              className="opacity-50"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5,19 L8.5,15.5"
              strokeDasharray="2 2"
              className="opacity-50"
            />
          </svg>
        </div>

        {/* Status Code */}
        <p className="text-6xl font-bold tracking-tighter text-primary sm:text-8xl">
          404
        </p>

        {/* Main Message */}
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Digital Dead End
        </h1>

        {/* Helper Text */}
        <p className="mt-4 text-base text-muted-foreground">
          Oops! It seems you've followed a broken link or the page you're
          looking for has been moved.
        </p>

        {/* Call to Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button asChild size="lg">
            <Link href="/">
              <Home className="mr-2 h-5 w-5" />
              Go back to Homepage
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/posts">
              <Search className="mr-2 h-5 w-5" />
              Explore Posts
            </Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
