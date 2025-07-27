// src/lib/features/admin/adminTypes.ts

// These should match the enums in your backend/Prisma schema
export enum SystemRole {
  USER = "USER",
  SYSTEM_CONTENT_CREATOR = "SYSTEM_CONTENT_CREATOR",
  DEVELOPER = "DEVELOPER",
  SUPER_ADMIN = "SUPER_ADMIN",
}

export enum PostCategory {
  PROJECT = "PROJECT",
  BLOG = "BLOG",
  RESOURCE = "RESOURCE",
  ARTICLE = "ARTICLE",
  SHOWCASE = "SHOWCASE",
  DISCUSSION = "DISCUSSION",
  GUIDE = "GUIDE",
}

// --- Data Shapes ---

// For the main dashboard statistics cards
export interface AdminDashboardStats {
  totalUsers: number;
  totalPosts: number;
  totalComments: number;
  totalLikes: number;
  totalSaves: number;
  totalShares: number;
}

// For a row in the User Management table
export interface AdminUserRow {
  id: string;
  name: string;
  username: string;
  email: string;
  profileImage: string | null;
  systemRole: SystemRole;
  joinedAt: string; // ISO date string
  _count: {
    posts: number;
    comments: number;
  };
}

// For a row in the Post Management table
export interface AdminPostRow {
  id: string;
  title: string;
  description: string;
  category: PostCategory;
  createdAt: string; // ISO date string
  likesCount: number;
  commentsCount: number;
  viewsCount: number;
  sharesCount: number;
  savedCount: number;
  author: {
    id: string;
    name: string;
    username: string;
    profileImage: string | null;
  };
  images: { url: string }[];
}

// For a row in the Comment Management table
export interface AdminCommentRow {
  id: string;
  text: string;
  createdAt: string; // ISO date string
  likesCount: number;
  dislikesCount: number;
  author: {
    id: string;
    name: string;
    username: string;
    profileImage: string | null;
  };
  post: {
    id: string;
    title: string;
  };
}

// --- API Query Arguments ---

// For any paginated/filterable admin endpoint
export interface AdminApiQuery {
  page?: number;
  limit?: number;
  q?: string;
  sortBy?: string;
  order?: "asc" | "desc";
  filterByCategory?: PostCategory;
}

// --- Full API Response Shapes ---

export interface PaginationInfo {
  totalItems: number;
  totalPages: number;
  currentPage: number;
}

export interface GetAdminStatsResponse {
  status: string;
  data: AdminDashboardStats;
}

export interface GetAdminUsersResponse {
  status: string;
  data: {
    users: AdminUserRow[];
    pagination: PaginationInfo;
  };
}

export interface GetAdminPostsResponse {
  status: string;
  data: {
    posts: AdminPostRow[];
    pagination: PaginationInfo;
  };
}

export interface GetAdminCommentsResponse {
  status: string;
  data: {
    comments: AdminCommentRow[];
    pagination: PaginationInfo;
  };
}
