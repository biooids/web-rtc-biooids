//src/components/pages/profile/ProfileForm.tsx
"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "next-auth/react";

import { useAppSelector, useAppDispatch } from "@/lib/hooks/hooks";
import { useUpdateMyProfileMutation } from "@/lib/features/user/userApiSlice";
import { resetUploadState } from "@/lib/features/upload/uploadProgressSlice";
import {
  updateProfileSchema,
  UpdateProfileFormValues,
} from "@/lib/schemas/auth.schemas";
import { SanitizedUserDto } from "@/lib/features/user/userTypes";
import { dataURLtoFile } from "@/components/shared/dataURLtoFile";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { Label } from "@/components/ui/label";

import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import {
  Camera,
  Edit,
  Loader2,
  Save,
  X,
  CheckCircle,
  Info,
  ImageIcon,
} from "lucide-react";
import ImageCropper from "@/components/shared/ImageCropper";
import { cn } from "@/lib/utils";

interface ProfileFormProps {
  user: SanitizedUserDto;
  onFinishedEditing: () => void;
}

const getInitials = (name: string | null | undefined): string => {
  if (!name) return "?";
  const words = name.split(" ").filter(Boolean);
  return (
    (words[0]?.charAt(0) ?? "") +
    (words.length > 1 ? words[words.length - 1]?.charAt(0) ?? "" : "")
  ).toUpperCase();
};

export default function ProfileForm({
  user,
  onFinishedEditing,
}: ProfileFormProps) {
  const { update: updateNextAuthSession } = useSession();
  const [updateProfile, { isLoading: isUpdating }] =
    useUpdateMyProfileMutation();
  const [uiMessage, setUiMessage] = useState<{
    type: "success" | "error" | "info";
    text: string;
  } | null>(null);

  const [bannerPreview, setBannerPreview] = useState<string | null>(
    user.bannerImage
  );
  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    user.profileImage
  );
  const [croppingImage, setCroppingImage] = useState<{
    src: string;
    type: "profile" | "banner";
  } | null>(null);

  const bannerInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const dispatch = useAppDispatch();
  const uploadState = useAppSelector((state) => state.uploadProgress);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm<UpdateProfileFormValues>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name: user.name || "",
      username: user.username || "",
      bio: user.bio || "",
      title: user.title || "",
      location: user.location || "",
      twitterUrl: user.twitterUrl || "",
      githubUrl: user.githubUrl || "",
      websiteUrl: user.websiteUrl || "",
    },
  });

  const handleFileSelect = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "profile" | "banner"
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      dispatch(resetUploadState());
      const reader = new FileReader();
      reader.onload = () =>
        setCroppingImage({ src: reader.result as string, type });
      reader.readAsDataURL(file);
    }
    if (e.target) e.target.value = "";
  };

  const handleCropComplete = async (croppedImageBase64: string) => {
    if (!croppingImage) return;
    const { type } = croppingImage;
    const croppedFile = dataURLtoFile(croppedImageBase64, `${type}.png`);

    if (!croppedFile) {
      setUiMessage({
        type: "error",
        text: "Could not process the cropped image.",
      });
      setCroppingImage(null);
      return;
    }

    const formData = new FormData();
    formData.append(
      type === "profile" ? "profileImage" : "bannerImage",
      croppedFile
    );
    setCroppingImage(null);

    try {
      const response = await updateProfile(formData).unwrap();
      if (type === "profile")
        setAvatarPreview(URL.createObjectURL(croppedFile));
      else setBannerPreview(URL.createObjectURL(croppedFile));
      if (response.data?.user?.profileImage) {
        await updateNextAuthSession({
          user: { image: response.data.user.profileImage },
        });
      }
    } catch (err: any) {
      setUiMessage({
        type: "error",
        text: err?.data?.message || "Image upload failed.",
      });
    }
  };

  const onTextSubmit: SubmitHandler<UpdateProfileFormValues> = async (data) => {
    setUiMessage(null);
    if (!isDirty) {
      setUiMessage({ type: "info", text: "No changes to save." });
      return;
    }

    const formData = new FormData();
    (Object.keys(data) as Array<keyof UpdateProfileFormValues>).forEach(
      (key) => {
        if (data[key] !== (user as any)[key]) {
          formData.append(key, data[key] || "");
        }
      }
    );

    if ([...formData.entries()].length === 0) {
      setUiMessage({ type: "info", text: "No changes to save." });
      return;
    }

    try {
      const response = await updateProfile(formData).unwrap();
      setUiMessage({ type: "success", text: response.message });
      if (response.data?.user?.name) {
        await updateNextAuthSession({
          user: { name: response.data.user.name },
        });
      }
      setTimeout(() => onFinishedEditing(), 1500);
    } catch (err: any) {
      setUiMessage({
        type: "error",
        text: err?.data?.message || "Failed to update profile.",
      });
    }
  };

  return (
    <>
      <Card>
        <form onSubmit={handleSubmit(onTextSubmit)}>
          <CardHeader>
            <CardTitle>Edit Profile</CardTitle>
            <CardDescription>
              Make changes to your public profile here. Click save when you're
              done.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-0">
            {/* --- FIX: Replaced fixed height with aspect-video for responsive banner --- */}
            <div className="relative aspect-video w-full bg-muted group">
              <div className="absolute inset-0 bg-black/50 z-10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  type="button"
                  size="sm"
                  onClick={() => bannerInputRef.current?.click()}
                  disabled={isUpdating}
                >
                  <Camera className="mr-2 h-4 w-4" /> Change Banner
                </Button>
              </div>
              <input
                type="file"
                ref={bannerInputRef}
                onChange={(e) => handleFileSelect(e, "banner")}
                className="hidden"
                accept="image/*"
              />
              {bannerPreview ? (
                <Image
                  src={bannerPreview}
                  alt="Banner Preview"
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
            <div className="p-6 pt-0">
              <div className="relative -mt-16 h-32 w-32 shrink-0 group">
                <Avatar className="h-full w-full border-4 border-background ring-2 ring-primary">
                  {avatarPreview ? (
                    <AvatarImage src={avatarPreview} alt="Avatar Preview" />
                  ) : null}
                  <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                </Avatar>
                <div className="absolute inset-0 bg-black/50 rounded-full z-10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    onClick={() => avatarInputRef.current?.click()}
                    className="h-12 w-12 rounded-full hover:bg-black/50"
                    disabled={isUpdating}
                  >
                    <Camera className="h-6 w-6 text-white" />
                  </Button>
                </div>
                <input
                  type="file"
                  ref={avatarInputRef}
                  onChange={(e) => handleFileSelect(e, "profile")}
                  className="hidden"
                  accept="image/*"
                />
              </div>
            </div>
          </CardContent>

          <CardContent className="p-6">
            {uploadState.isUploading && (
              <div className="space-y-2 mb-6">
                <Label>Uploading: {uploadState.fileName}</Label>
                <Progress value={uploadState.progress} className="w-full h-2" />
                <p className="text-sm text-muted-foreground text-right">
                  {uploadState.progress}%
                </p>
              </div>
            )}
            {uploadState.error && (
              <Alert variant="destructive" className="mb-6">
                <Info className="h-4 w-4" />
                <AlertDescription>{uploadState.error}</AlertDescription>
              </Alert>
            )}
            {uiMessage && (
              <Alert
                variant={uiMessage.type === "error" ? "destructive" : "default"}
                className={cn(
                  "mb-6",
                  uiMessage.type === "success" &&
                    "border-green-500/50 text-green-700"
                )}
              >
                {uiMessage.type === "success" ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <Info className="h-4 w-4" />
                )}
                <AlertDescription>{uiMessage.text}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    {...register("name")}
                    disabled={isUpdating}
                  />
                  {errors.name && (
                    <p className="text-destructive text-xs mt-1">
                      {errors.name.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    {...register("username")}
                    disabled={isUpdating}
                  />
                  {errors.username && (
                    <p className="text-destructive text-xs mt-1">
                      {errors.username.message}
                    </p>
                  )}
                </div>
              </div>
              <div>
                <Label htmlFor="title">Title / Headline</Label>
                <Input
                  id="title"
                  {...register("title")}
                  placeholder="e.g., Full-Stack Developer"
                  disabled={isUpdating}
                />
                {errors.title && (
                  <p className="text-destructive text-xs mt-1">
                    {errors.title.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  {...register("bio")}
                  placeholder="Tell us about yourself..."
                  disabled={isUpdating}
                />
                {errors.bio && (
                  <p className="text-destructive text-xs mt-1">
                    {errors.bio.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  {...register("location")}
                  placeholder="e.g., San Francisco, CA"
                  disabled={isUpdating}
                />
                {errors.location && (
                  <p className="text-destructive text-xs mt-1">
                    {errors.location.message}
                  </p>
                )}
              </div>
              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="githubUrl">GitHub URL</Label>
                  <Input
                    id="githubUrl"
                    {...register("githubUrl")}
                    disabled={isUpdating}
                  />
                  {errors.githubUrl && (
                    <p className="text-destructive text-xs mt-1">
                      {errors.githubUrl.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="twitterUrl">Twitter URL</Label>
                  <Input
                    id="twitterUrl"
                    {...register("twitterUrl")}
                    disabled={isUpdating}
                  />
                  {errors.twitterUrl && (
                    <p className="text-destructive text-xs mt-1">
                      {errors.twitterUrl.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="websiteUrl">Website URL</Label>
                  <Input
                    id="websiteUrl"
                    {...register("websiteUrl")}
                    disabled={isUpdating}
                  />
                  {errors.websiteUrl && (
                    <p className="text-destructive text-xs mt-1">
                      {errors.websiteUrl.message}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex gap-3 pt-6">
            <Button type="submit" disabled={isUpdating || !isDirty}>
              {isUpdating ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Save Changes
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={onFinishedEditing}
              disabled={isUpdating}
            >
              <X className="mr-2 h-4 w-4" /> Cancel
            </Button>
          </CardFooter>
        </form>
      </Card>

      <Dialog
        open={!!croppingImage}
        onOpenChange={(isOpen) => !isOpen && setCroppingImage(null)}
      >
        <DialogContent className="sm:max-w-lg p-0">
          <DialogHeader className="p-4 sm:p-6 border-b">
            <DialogTitle>Crop Your Image</DialogTitle>
            <DialogDescription>
              Adjust the selection to fit your desired image area, then click
              "Crop & Save".
            </DialogDescription>
          </DialogHeader>
          {croppingImage && (
            <ImageCropper
              imageSrc={croppingImage.src}
              aspect={croppingImage.type === "profile" ? 1 : 16 / 9}
              onCropDone={handleCropComplete}
              onCancel={() => setCroppingImage(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
