// FILE: src/app/privacy-policy/page.tsx

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
};

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

export default function PrivacyPolicyPage() {
  return (
    <PageLayout title="Privacy Policy">
      <p>
        Welcome to Wanderguilds ("we," "us," or "our"). We are committed to
        protecting your personal information and your right to privacy. If you
        have any questions or concerns about this privacy policy, or our
        practices with regards to your personal information, please contact us
        at [Your Contact Email].
      </p>

      <h2>1. What Information Do We Collect?</h2>
      <p>
        We collect personal information that you voluntarily provide to us when
        you register on the Website, express an interest in obtaining
        information about us or our products and Services, or when you
        participate in activities on the Website. The personal information we
        collect may include names, email addresses, usernames, and passwords. We
        also collect data from social media logins if you choose to use them.
      </p>

      <h2>2. How Do We Use Your Information?</h2>
      <p>
        We use your information to facilitate account creation, manage user
        accounts, send administrative information, protect our Services, and
        enforce our terms and policies. We may also use your information to
        request feedback or post testimonials with your consent.
      </p>

      <h2>3. Will Your Information Be Shared?</h2>
      <p>
        We only share information with your consent, to comply with laws, to
        provide you with services, to protect your rights, or to fulfill
        business obligations. We do not sell your personal information.
      </p>

      <h2>4. How Do We Handle Social Logins?</h2>
      <p>
        If you register using a social media account, we may access certain
        profile information stored there, such as your name, email address, and
        profile picture. We will use this information only for the purposes
        described in this policy.
      </p>

      <h2>5. How Long Do We Keep Your Information?</h2>
      <p>
        We keep your personal information for as long as it is necessary for the
        purposes set out in this privacy policy, unless a longer retention
        period is required or permitted by law.
      </p>

      <h2>6. How Do We Keep Your Information Safe?</h2>
      <p>
        We have implemented appropriate technical and organizational security
        measures designed to protect the security of any personal information we
        process. However, no electronic transmission over the Internet can be
        guaranteed to be 100% secure.
      </p>

      <h2>7. What Are Your Privacy Rights?</h2>
      <p>
        Depending on your region, you may have rights to access, rectify, erase,
        or restrict the processing of your personal information. You can review
        and change the information in your account settings at any time.
      </p>

      <h2>8. Policy Updates</h2>
      <p>
        We may update this privacy policy from time to time. The updated version
        will be indicated by a "Last Updated" date.
      </p>
    </PageLayout>
  );
}
