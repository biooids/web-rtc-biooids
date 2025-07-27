// src/components/pages/admin/users/UserManagement.tsx
"use client";

import React, { useState } from "react";
import {
  useGetAdminUsersQuery,
  useDeleteUserMutation,
} from "@/lib/features/admin/adminApiSlice";
import { AdminUserRow, SystemRole } from "@/lib/features/admin/adminTypes";
import { useDebounce } from "@/lib/hooks/useDebounce";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Trash2 } from "lucide-react";
import { format } from "date-fns";
import toast from "react-hot-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAppSelector } from "@/lib/hooks/hooks";
import { selectCurrentUser } from "@/lib/features/user/userSlice";
import ManagementPageLayout from "../layouts/ManagementPageLayout";
import { Input } from "@/components/ui/input";
import PaginationControls from "@/components/shared/PaginationControls";
import Link from "next/link"; // Import Link

// Row Actions Component
function UserActions({ user }: { user: AdminUserRow }) {
  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const currentUser = useAppSelector(selectCurrentUser);

  const handleDelete = async () => {
    if (currentUser?.id === user.id) {
      toast.error("You cannot delete your own account.");
      return;
    }
    try {
      await deleteUser(user.id).unwrap();
      toast.success(`User @${user.username} has been deleted.`);
    } catch (error) {
      toast.error("Failed to delete user.");
    }
  };

  const isProtectedUser = user.systemRole === SystemRole.SUPER_ADMIN;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem
            className="text-red-500 focus:bg-red-500/10"
            onClick={() => setIsAlertOpen(true)}
            disabled={
              isDeleting || currentUser?.id === user.id || isProtectedUser
            }
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete User
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the account for{" "}
              <span className="font-bold">@{user.username}</span> and all their
              data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? "Deleting..." : "Yes, delete user"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// Main Component
export default function UserManagement() {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const { data, isLoading, isError } = useGetAdminUsersQuery({
    page,
    q: debouncedSearchTerm,
  });

  const users = data?.data.users ?? [];
  const pagination = data?.data.pagination;

  return (
    <ManagementPageLayout
      title="User Management"
      description="View, search, and take action on user accounts."
      itemCount={pagination?.totalItems ?? 0}
      controls={
        <Input
          placeholder="Search by name, username, email..."
          className="w-64"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      }
    >
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Joined</TableHead>
            <TableHead>Content</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center h-24">
                Loading users...
              </TableCell>
            </TableRow>
          ) : isError ? (
            <TableRow>
              <TableCell
                colSpan={6}
                className="text-center h-24 text-destructive"
              >
                Failed to load users.
              </TableCell>
            </TableRow>
          ) : users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center h-24">
                No users found.
              </TableCell>
            </TableRow>
          ) : (
            users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  {/* UPDATED: User info is now a link to their profile */}
                  <Link
                    href={`/profile/${user.username}`}
                    className="flex items-center gap-3 group"
                  >
                    <Avatar>
                      <AvatarImage src={user.profileImage ?? undefined} />
                      <AvatarFallback>{user.name.slice(0, 2)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium group-hover:underline">
                        {user.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        @{user.username}
                      </p>
                    </div>
                  </Link>
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      user.systemRole === "SUPER_ADMIN"
                        ? "default"
                        : "secondary"
                    }
                  >
                    {user.systemRole}
                  </Badge>
                </TableCell>
                <TableCell>{format(new Date(user.joinedAt), "PP")}</TableCell>
                <TableCell>
                  <p>{user._count.posts} Posts</p>
                  <p>{user._count.comments} Comments</p>
                </TableCell>
                <TableCell className="text-right">
                  <UserActions user={user} />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      {pagination && (
        <PaginationControls pagination={pagination} onPageChange={setPage} />
      )}
    </ManagementPageLayout>
  );
}
