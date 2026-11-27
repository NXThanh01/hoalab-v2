import { boolean, doublePrecision, index, integer, pgEnum, pgTable, primaryKey, serial, text, timestamp, uuid } from "drizzle-orm/pg-core";

const createdAt = () => timestamp("created_at", { mode: "string", withTimezone: true }).notNull().defaultNow();
const updatedAt = () => timestamp("updated_at", { mode: "string", withTimezone: true }).notNull().defaultNow();

export const profiles = pgTable("profiles", {
  userId: text("user_id").primaryKey(),
  email: text("email").notNull().unique(),
  fullName: text("full_name"),
  role: text("role", { enum: ["student", "admin"] }).notNull().default("student"),
  gradeLevel: integer("grade_level").notNull().default(12),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const userRole = pgEnum("account_role", ["admin", "user"]);
export const userStatus = pgEnum("account_status", ["active", "suspended"]);

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  profileId: text("profile_id").notNull().unique().references(() => profiles.userId, { onDelete: "cascade" }),
  loginId: text("login_id").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: userRole("role").notNull().default("user"),
  status: userStatus("status").notNull().default("active"),
  mustChangePassword: boolean("must_change_password").notNull().default(false),
  temporaryPasswordExpiresAt: timestamp("temporary_password_expires_at", { mode: "string", withTimezone: true }),
  lastLoginAt: timestamp("last_login_at", { mode: "string", withTimezone: true }),
  createdAt: createdAt(),
});

export const authSessions = pgTable("auth_sessions", {
  id: uuid("id").primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  rememberMe: boolean("remember_me").notNull(),
  expiresAt: timestamp("expires_at", { mode: "string", withTimezone: true }).notNull(),
  createdAt: createdAt(),
}, (table) => [index("auth_sessions_user_idx").on(table.userId), index("auth_sessions_expiry_idx").on(table.expiresAt)]);

export const loginLimits = pgTable("auth_login_limits", {
  key: text("key").primaryKey(),
  attempts: integer("attempts").notNull(),
  expiresAt: timestamp("expires_at", { mode: "string", withTimezone: true }).notNull(),
}, (table) => [index("auth_login_limits_expiry_idx").on(table.expiresAt)]);

export const learningProgress = pgTable("learning_progress", {
  userId: text("user_id").notNull().references(() => profiles.userId, { onDelete: "cascade" }),
  lessonId: integer("lesson_id").notNull(),
  status: text("status", { enum: ["not_started", "in_progress", "completed"] }).notNull().default("not_started"),
  bestScore: doublePrecision("best_score").notNull().default(0),
  videoSecond: doublePrecision("video_second").notNull().default(0),
  checkpointsJson: text("checkpoints_json").notNull().default("[]"),
  updatedAt: updatedAt(),
}, (table) => [primaryKey({ columns: [table.userId, table.lessonId] })]);

export const questionBank = pgTable("question_bank", {
  id: text("id").primaryKey(),
  type: text("type", { enum: ["multiple_choice", "essay", "equation"] }).notNull(),
  subject: text("subject").notNull(),
  gradeLevel: integer("grade_level").notNull(),
  prompt: text("prompt").notNull(),
  optionsJson: text("options_json").notNull().default("[]"),
  correctAnswer: text("correct_answer").notNull().default(""),
  explanation: text("explanation").notNull().default(""),
  difficulty: text("difficulty", { enum: ["easy", "medium", "hard"] }).notNull().default("medium"),
  points: doublePrecision("points").notNull().default(1),
  createdBy: text("created_by").notNull().references(() => profiles.userId),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const examFolders = pgTable("exam_folders", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  gradeLevel: integer("grade_level").notNull(),
  description: text("description").notNull().default(""),
  color: text("color").notNull().default("indigo"),
  createdBy: text("created_by").notNull().references(() => profiles.userId),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const exams = pgTable("exams", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull().default(""),
  gradeLevel: integer("grade_level").notNull(),
  folderId: text("folder_id").references(() => examFolders.id, { onDelete: "set null" }),
  kind: text("kind", { enum: ["quiz", "exam"] }).notNull().default("exam"),
  durationMinutes: integer("duration_minutes").notNull().default(45),
  passScore: doublePrecision("pass_score").notNull().default(8),
  status: text("status", { enum: ["draft", "published", "archived"] }).notNull().default("draft"),
  startsAt: timestamp("starts_at", { mode: "string", withTimezone: true }),
  endsAt: timestamp("ends_at", { mode: "string", withTimezone: true }),
  createdBy: text("created_by").notNull().references(() => profiles.userId),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const examQuestions = pgTable("exam_questions", {
  examId: text("exam_id").notNull().references(() => exams.id, { onDelete: "cascade" }),
  questionId: text("question_id").notNull().references(() => questionBank.id, { onDelete: "cascade" }),
  position: integer("position").notNull().default(0),
  points: doublePrecision("points").notNull().default(1),
}, (table) => [primaryKey({ columns: [table.examId, table.questionId] })]);

export const examAttempts = pgTable("exam_attempts", {
  id: text("id").primaryKey(),
  examId: text("exam_id").notNull().references(() => exams.id),
  userId: text("user_id").notNull().references(() => profiles.userId),
  score: doublePrecision("score"),
  status: text("status", { enum: ["in_progress", "submitted", "graded"] }).notNull().default("in_progress"),
  answersJson: text("answers_json").notNull().default("{}"),
  startedAt: timestamp("started_at", { mode: "string", withTimezone: true }).notNull().defaultNow(),
  submittedAt: timestamp("submitted_at", { mode: "string", withTimezone: true }),
});

export const activityLog = pgTable("activity_log", {
  id: serial("id").primaryKey(),
  actorId: text("actor_id").notNull().references(() => profiles.userId),
  action: text("action").notNull(),
  entityType: text("entity_type").notNull(),
  entityId: text("entity_id").notNull(),
  createdAt: createdAt(),
});

export const lessonContents = pgTable("lesson_contents", {
  id: text("id").primaryKey(),
  gradeLevel: integer("grade_level").notNull(),
  textbookSeries: text("textbook_series").notNull().default("Kết nối tri thức"),
  chapterId: text("chapter_id").notNull(),
  lessonNumber: integer("lesson_number").notNull(),
  title: text("title").notNull(),
  videoUrl: text("video_url").notNull().default(""),
  status: text("status", { enum: ["draft", "published"] }).notNull().default("draft"),
  checkpointsJson: text("checkpoints_json").notNull().default("[]"),
  createdBy: text("created_by").notNull().references(() => profiles.userId),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});
