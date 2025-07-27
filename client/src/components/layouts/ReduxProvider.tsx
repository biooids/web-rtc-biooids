// src/components/ReduxProvider.tsx
"use client";

import { store } from "@/lib/store"; // Adjust path if needed
import { Provider } from "react-redux";

export default function ReduxProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Provider store={store}>{children}</Provider>;
}
