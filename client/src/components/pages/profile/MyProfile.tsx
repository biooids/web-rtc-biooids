//src/components/pages/profile/MyProfile.tsx
"use client";

import React, { useState } from "react";
import { useAppSelector } from "@/lib/hooks/hooks";
import { selectCurrentUser } from "@/lib/features/user/userSlice";
import { Loader2 } from "lucide-react";
import ProfileHeader from "./ProfileHeader";
import ProfileForm from "./ProfileForm";
import ChangePasswordForm from "./ChangePasswordForm";
import DangerZone from "./DangerZone";

export default function MyProfilePage() {
  const currentUser = useAppSelector(selectCurrentUser);
  const [isEditing, setIsEditing] = useState(false);

  // Show a loading spinner while the initial user data is being fetched
  if (!currentUser) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl py-8 space-y-12">
      {isEditing ? (
        // If editing, render the form component and pass a function to cancel editing
        <ProfileForm
          user={currentUser}
          onFinishedEditing={() => setIsEditing(false)}
        />
      ) : (
        // Otherwise, render the display component and pass a function to start editing
        <ProfileHeader user={currentUser} onEdit={() => setIsEditing(true)} />
      )}

      {/* These components are part of the page regardless of edit state */}
      <ChangePasswordForm />
      <DangerZone />
    </div>
  );
}
