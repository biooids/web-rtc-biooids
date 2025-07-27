//src/app/(app)/layout.tsx

import MobileBottomBar from "@/components/layouts/sidebar/MobileBottomBar";

export default function AppLayout({
  children,
  header,
  sidebar,
  footer,
}: {
  children: React.ReactNode;
  header: React.ReactNode;
  sidebar: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {sidebar} {/* Renders the @sidebar slot */}
      <div className="flex flex-1 flex-col">
        {header} {/* Renders the @header slot */}
        <main className="flex-1 p-4 md:p-6 lg:p-8">{children}</main>
        {footer} {/* Renders the @footer slot */}
      </div>
      <MobileBottomBar />
    </div>
  );
}
