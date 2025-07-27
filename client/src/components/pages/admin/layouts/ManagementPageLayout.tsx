// src/components/pages/admin/layouts/ManagementPageLayout.tsx

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ManagementPageLayoutProps {
  title: string;
  description: string;
  itemCount: number;
  children: React.ReactNode;
  controls?: React.ReactNode; // For search bars, filters etc.
}

export default function ManagementPageLayout({
  title,
  description,
  itemCount,
  children,
  controls,
}: ManagementPageLayoutProps) {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        <p className="text-muted-foreground">{description}</p>
      </div>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>
            {title} ({itemCount.toLocaleString()})
          </CardTitle>
          <div className="flex items-center gap-2">{controls}</div>
        </CardHeader>
        <CardContent>{children}</CardContent>
      </Card>
    </div>
  );
}
