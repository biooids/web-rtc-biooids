//src/components/pages/profile/ProfileHeader.tsx
"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import {
  Twitter,
  Github,
  Link as LinkIcon,
  MapPin,
  Calendar,
  Edit,
  ImageIcon,
} from "lucide-react";
import { SanitizedUserDto } from "@/lib/features/user/userTypes";

// Helper function to get user initials
const getInitials = (name: string | null | undefined): string => {
  if (!name) return "?";
  const words = name.split(" ").filter(Boolean);
  return (
    (words[0]?.charAt(0) ?? "") +
    (words.length > 1 ? words[words.length - 1]?.charAt(0) ?? "" : "")
  ).toUpperCase();
};

// --- THIS IS THE FIX ---
// A small, safe component to handle date formatting.
const FormattedJoinDate = ({ dateString }: { dateString: string }) => {
  try {
    // 1. Check if the date string exists.
    if (!dateString) {
      return null;
    }
    // 2. Format the date. The try/catch will handle any unexpected errors.
    return <>{format(new Date(dateString), "MMMM d, yyyy")}</>;
  } catch (error) {
    console.error("Failed to format date:", error);
    return <>Invalid date</>; // Show a fallback on error
  }
};

interface ProfileHeaderProps {
  user: SanitizedUserDto;
  onEdit: () => void;
}

export default function ProfileHeader({ user, onEdit }: ProfileHeaderProps) {
  return (
    <Card className="overflow-hidden">
      <div className="relative aspect-video w-full bg-muted">
        {user.bannerImage ? (
          <Image
            src={user.bannerImage}
            alt={`${user.name}'s banner`}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <ImageIcon className="w-16 h-16 text-muted-foreground/30" />
          </div>
        )}
      </div>
      <CardContent className="p-6 pt-0">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row">
          <Avatar className="-mt-16 h-32 w-32 shrink-0 border-4 border-background ring-2 ring-primary">
            {user.profileImage && (
              <AvatarImage src={user.profileImage} alt={user.name ?? "User"} />
            )}
            <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
          </Avatar>
          <div className="flex w-full items-center justify-end gap-2 sm:w-auto mt-4">
            <Button onClick={onEdit}>
              <Edit className="mr-2 h-4 w-4" /> Edit Profile
            </Button>
          </div>
        </div>
        <div className="mt-4">
          <h1 className="text-3xl font-bold tracking-tighter">{user.name}</h1>
          <p className="text-muted-foreground">@{user.username}</p>
          {user.title && (
            <p className="mt-2 text-foreground/80">{user.title}</p>
          )}
          {user.bio && <p className="mt-4 max-w-2xl">{user.bio}</p>}
          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
            {user.location && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" /> {user.location}
              </div>
            )}
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" /> Joined{" "}
              {/* 3. Use the new safe component */}
              <FormattedJoinDate dateString={user.joinedAt} />
            </div>
          </div>
        </div>
        <div className="mt-6 flex items-center gap-2">
          {user.githubUrl && (
            <Button variant="outline" size="icon" asChild>
              <Link
                href={user.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Github className="h-4 w-4" />
              </Link>
            </Button>
          )}
          {user.twitterUrl && (
            <Button variant="outline" size="icon" asChild>
              <Link
                href={user.twitterUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Twitter className="h-4 w-4" />
              </Link>
            </Button>
          )}
          {user.websiteUrl && (
            <Button variant="outline" size="icon" asChild>
              <Link
                href={user.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <LinkIcon className="h-4 w-4" />
              </Link>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
