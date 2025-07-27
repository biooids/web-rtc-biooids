// FILE: src/components/pages/home/HeroSection.tsx

"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Github } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="bg-background">
      <div className="container mx-auto px-4 md:px-6 py-20 md:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Side: Text Content */}
          <div className="text-center lg:text-left">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tighter text-foreground">
              Launch Your Next Project in{" "}
              <span className="text-primary">Minutes</span>
            </h1>
            <p className="mt-6 max-w-xl mx-auto lg:mx-0 text-lg text-muted-foreground">
              A production-ready, full-stack starter kit featuring everything
              you need to build a modern web application. Includes Next.js,
              Express, Prisma, NextAuth, and a complete authentication system
              out of the box.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button asChild size="lg">
                <Link href="/dashboard">
                  Get Started <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <a
                  href="https://github.com/your-username/your-repo-name" // <-- IMPORTANT: Change this link
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Github className="mr-2 h-5 w-5" />
                  View on GitHub
                </a>
              </Button>
            </div>
          </div>

          {/* Right Side: Visual Element (Code Block) */}
          <div className="hidden lg:block bg-muted/50 border rounded-lg p-6 shadow-sm overflow-hidden">
            <pre className="text-sm text-muted-foreground">
              <code>
                <span className="text-purple-400">import</span> {"{"}{" "}
                <span className="text-yellow-400">authOptions</span> {"}"}{" "}
                <span className="text-purple-400">from</span>{" "}
                <span className="text-green-400">"@/lib/authOptions"</span>;
                {"\n"}
                <span className="text-purple-400">import</span> {"{"}{" "}
                <span className="text-yellow-400">apiLimiter</span> {"}"}{" "}
                <span className="text-purple-400">from</span>{" "}
                <span className="text-green-400">
                  "@/middleware/rateLimiter"
                </span>
                ;{"\n"}
                <span className="text-purple-400">import</span> {"{"}{" "}
                <span className="text-yellow-400">prisma</span> {"}"}{" "}
                <span className="text-purple-400">from</span>{" "}
                <span className="text-green-400">"@/db/prisma"</span>;{"\n\n"}
                <span className="text-blue-400">const</span>{" "}
                <span className="text-yellow-400">handler</span>{" "}
                <span className="text-gray-400">=</span>{" "}
                <span className="text-red-400">NextAuth</span>(
                <span className="text-yellow-400">authOptions</span>);{"\n\n"}
                <span className="text-gray-500">
                  // Secure, scalable, and ready to deploy.
                </span>
                {"\n"}
                <span className="text-gray-500">
                  // All the boilerplate, done for you.
                </span>
              </code>
            </pre>
          </div>
        </div>
      </div>
    </section>
  );
}
