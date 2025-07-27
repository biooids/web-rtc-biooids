// FILE: src/lib/nav-links.ts

import {
  Home,
  Settings,
  User,
  LayoutGrid,
  Bookmark,
  Compass,
  PhoneCall,
} from "lucide-react";

export const navLinks = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: Home,
  },
  {
    href: "/explore",
    label: "Explore",
    icon: Compass,
  },
  {
    href: "/saved",
    label: "Saved Items",
    icon: Bookmark,
  },
  {
    href: "/posts",
    label: "My Posts",
    icon: LayoutGrid,
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
