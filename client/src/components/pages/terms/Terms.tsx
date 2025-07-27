// FILE: src/components/pages/legal/Terms.tsx

"use client";

export default function Terms() {
  return (
    <div className="container mx-auto max-w-3xl py-12 px-4">
      <article className="prose dark:prose-invert">
        <h1>Terms of Service</h1>
        <p className="text-muted-foreground">Last Updated: July 26, 2025</p>

        {/* IMPORTANT: This is placeholder text. Replace with your actual Terms of Service. */}

        <h2>1. Introduction</h2>
        <p>
          Welcome to Your App Name ("we," "our," or "us"). These Terms of
          Service govern your use of our website and services. By accessing or
          using our service, you agree to be bound by these terms.
        </p>

        <h2>2. User Accounts</h2>
        <p>
          When you create an account with us, you must provide information that
          is accurate, complete, and current at all times. Failure to do so
          constitutes a breach of the Terms, which may result in immediate
          termination of your account on our service.
        </p>

        <h2>3. Content</h2>
        <p>
          Our service allows you to post, link, store, share and otherwise make
          available certain information, text, graphics, videos, or other
          material ("Content"). You are responsible for the Content that you
          post on or through the service, including its legality, reliability,
          and appropriateness.
        </p>

        <h2>4. Limitation Of Liability</h2>
        <p>
          In no event shall Your App Name, nor its directors, employees,
          partners, agents, suppliers, or affiliates, be liable for any
          indirect, incidental, special, consequential or punitive damages,
          including without limitation, loss of profits, data, use, goodwill, or
          other intangible losses.
        </p>
      </article>
    </div>
  );
}
