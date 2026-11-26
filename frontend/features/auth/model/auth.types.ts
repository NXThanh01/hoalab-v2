export type UserRole = "student" | "admin";

export type AuthUser = {
  userId: string;
  email: string;
  displayName: string;
  fullName: string | null;
  role: UserRole;
  gradeLevel: number;
};

export type UserProfile = AuthUser;
