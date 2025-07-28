// FILE: src/lib/nav-links.ts

import { Settings, User, PhoneCall, House } from "lucide-react";

export const navLinks = [
  {
    href: "/",
    label: "Home",
    icon: House, // Placeholder for a home icon
  },
  {
    href: "/profile",
    label: "My Profile",
    icon: User,
  },
  {
    href: "/call",
    label: "Join Call",
    icon: PhoneCall, // Placeholder for a message icon
  },
];

export const settingsLink = {
  href: "/settings",
  label: "Settings",
  icon: Settings,
};
