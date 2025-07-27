// FILE: src/app/terms-of-service/page.tsx

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
};

// This layout is now only defined once in this file
const PageLayout = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <div className="container mx-auto max-w-4xl py-12 px-4">
    <h1 className="text-4xl font-bold tracking-tighter mb-2">{title}</h1>
    <p className="text-muted-foreground mb-8">Last Updated: July 5, 2025</p>
    <div className="prose prose-lg dark:prose-invert max-w-none">
      {children}
    </div>
  </div>
);

export default function TermsOfServicePage() {
  return (
    <PageLayout title="Terms of Service">
      <p>
        Welcome to Wanderguilds. These Terms of Service ("Terms") govern your
        access to and use of the Wanderguilds website, products, and services
        ("Services"). By accessing or using our Services, you agree to be bound
        by these Terms and our Privacy Policy.
      </p>

      <h2>1. Using Wanderguilds</h2>
      <p>
        You may use our Services only if you can form a binding contract with
        Wanderguilds and only in compliance with these Terms and all applicable
        laws. You must provide us with accurate and complete information upon
        registration. We grant you a limited, non-exclusive, non-transferable,
        and revocable license to use our Services.
      </p>

      <h2>2. Your Content</h2>
      <p>
        You retain all rights in, and are solely responsible for, the User
        Content you post to Wanderguilds. You grant Wanderguilds and our users a
        non-exclusive, royalty-free, worldwide license to use, store, display,
        and distribute your User Content on the platform for the purposes of
        operating and providing the Services.
      </p>

      <h2>3. Acceptable Use Policy</h2>
      <p>
        You agree not to misuse the Services. As part of these Terms, you agree
        to comply with our Acceptable Use Policy. You may not use the Services
        to engage in illegal activities, post harmful or abusive content, harass
        others, share misinformation, send spam, or infringe on intellectual
        property rights. We reserve the right to remove content and suspend or
        terminate accounts that violate our policies.
      </p>

      <h2>4. Security</h2>
      <p>
        We care about the security of our users. We implement measures like data
        encryption in transit (TLS) and at rest (hashed passwords). While we
        work to protect the security of your content and account, Wanderguilds
        cannot guarantee that unauthorized third parties will not be able to
        defeat our security measures. We ask that you keep your password secure
        and notify us immediately of any compromise or unauthorized use of your
        account.
      </p>

      <h2>5. Copyright</h2>
      <p>
        We respect the intellectual property rights of others and expect our
        users to do the same. We will respond to notices of alleged copyright
        infringement that comply with applicable law.
      </p>

      <h2>6. Termination</h2>
      <p>
        Wanderguilds may terminate or suspend your right to access or use our
        Services for any reason on appropriate notice, or immediately if you
        violate our policies.
      </p>

      <h2>7. Disclaimers and Limitation of Liability</h2>
      <p>
        The Services are provided "as is" without any warranties. To the maximum
        extent permitted by law, Wanderguilds shall not be liable for any
        indirect, incidental, special, consequential, or punitive damages, or
        any loss of profits or revenues.
      </p>

      <h2>8. Governing Law</h2>
      <p>
        These Terms shall be governed by the laws of [Your State/Country],
        without respect to its conflict of laws principles.
      </p>
    </PageLayout>
  );
}
