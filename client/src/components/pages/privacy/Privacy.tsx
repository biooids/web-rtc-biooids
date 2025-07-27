// FILE: src/components/pages/legal/Privacy.tsx

"use client";

export default function Privacy() {
  return (
    <div className="container mx-auto max-w-3xl py-12 px-4">
      <article className="prose dark:prose-invert">
        <h1>Privacy Policy</h1>
        <p className="text-muted-foreground">Last Updated: July 26, 2025</p>

        {/* IMPORTANT: This is placeholder text. Replace with your actual Privacy Policy. */}

        <h2>1. Information We Collect</h2>
        <p>
          We collect information that you provide directly to us, such as when
          you create an account, update your profile, or communicate with us.
          This may include your name, email address, and other personal details.
        </p>

        <h2>2. How We Use Your Information</h2>
        <p>We use the information we collect to:</p>
        <ul>
          <li>Provide, maintain, and improve our services;</li>
          <li>Process transactions and send you related information;</li>
          <li>
            Communicate with you about products, services, offers, and events;
          </li>
          <li>
            Monitor and analyze trends, usage, and activities in connection with
            our services.
          </li>
        </ul>

        <h2>3. Sharing of Information</h2>
        <p>
          We may share information about you as follows or as otherwise
          described in this Privacy Policy:
        </p>
        <ul>
          <li>
            With vendors, consultants, and other service providers who need
            access to such information to carry out work on our behalf;
          </li>
          <li>
            In response to a request for information if we believe disclosure is
            in accordance with, or required by, any applicable law or legal
            process.
          </li>
        </ul>
      </article>
    </div>
  );
}
