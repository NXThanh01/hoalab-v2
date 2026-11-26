CREATE TABLE "activity_log" (
	"id" serial PRIMARY KEY NOT NULL,
	"actor_id" text NOT NULL,
	"action" text NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "exam_attempts" (
	"id" text PRIMARY KEY NOT NULL,
	"exam_id" text NOT NULL,
	"user_id" text NOT NULL,
	"score" double precision,
	"status" text DEFAULT 'in_progress' NOT NULL,
	"answers_json" text DEFAULT '{}' NOT NULL,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"submitted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "exam_folders" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"grade_level" integer NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"color" text DEFAULT 'indigo' NOT NULL,
	"created_by" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "exam_questions" (
	"exam_id" text NOT NULL,
	"question_id" text NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"points" double precision DEFAULT 1 NOT NULL,
	CONSTRAINT "exam_questions_exam_id_question_id_pk" PRIMARY KEY("exam_id","question_id")
);
--> statement-breakpoint
CREATE TABLE "exams" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"grade_level" integer NOT NULL,
	"folder_id" text,
	"kind" text DEFAULT 'exam' NOT NULL,
	"duration_minutes" integer DEFAULT 45 NOT NULL,
	"pass_score" double precision DEFAULT 8 NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"starts_at" timestamp with time zone,
	"ends_at" timestamp with time zone,
	"created_by" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "learning_progress" (
	"user_id" text NOT NULL,
	"lesson_id" integer NOT NULL,
	"status" text DEFAULT 'not_started' NOT NULL,
	"best_score" double precision DEFAULT 0 NOT NULL,
	"video_second" double precision DEFAULT 0 NOT NULL,
	"checkpoints_json" text DEFAULT '[]' NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "learning_progress_user_id_lesson_id_pk" PRIMARY KEY("user_id","lesson_id")
);
--> statement-breakpoint
CREATE TABLE "lesson_contents" (
	"id" text PRIMARY KEY NOT NULL,
	"grade_level" integer NOT NULL,
	"textbook_series" text DEFAULT 'Kết nối tri thức' NOT NULL,
	"chapter_id" text NOT NULL,
	"lesson_number" integer NOT NULL,
	"title" text NOT NULL,
	"video_url" text DEFAULT '' NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"checkpoints_json" text DEFAULT '[]' NOT NULL,
	"created_by" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"user_id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"full_name" text,
	"role" text DEFAULT 'student' NOT NULL,
	"grade_level" integer DEFAULT 12 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "profiles_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "question_bank" (
	"id" text PRIMARY KEY NOT NULL,
	"type" text NOT NULL,
	"subject" text NOT NULL,
	"grade_level" integer NOT NULL,
	"prompt" text NOT NULL,
	"options_json" text DEFAULT '[]' NOT NULL,
	"correct_answer" text DEFAULT '' NOT NULL,
	"explanation" text DEFAULT '' NOT NULL,
	"difficulty" text DEFAULT 'medium' NOT NULL,
	"points" double precision DEFAULT 1 NOT NULL,
	"created_by" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "activity_log" ADD CONSTRAINT "activity_log_actor_id_profiles_user_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."profiles"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exam_attempts" ADD CONSTRAINT "exam_attempts_exam_id_exams_id_fk" FOREIGN KEY ("exam_id") REFERENCES "public"."exams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exam_attempts" ADD CONSTRAINT "exam_attempts_user_id_profiles_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exam_folders" ADD CONSTRAINT "exam_folders_created_by_profiles_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exam_questions" ADD CONSTRAINT "exam_questions_exam_id_exams_id_fk" FOREIGN KEY ("exam_id") REFERENCES "public"."exams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exam_questions" ADD CONSTRAINT "exam_questions_question_id_question_bank_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."question_bank"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exams" ADD CONSTRAINT "exams_folder_id_exam_folders_id_fk" FOREIGN KEY ("folder_id") REFERENCES "public"."exam_folders"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exams" ADD CONSTRAINT "exams_created_by_profiles_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learning_progress" ADD CONSTRAINT "learning_progress_user_id_profiles_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lesson_contents" ADD CONSTRAINT "lesson_contents_created_by_profiles_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "question_bank" ADD CONSTRAINT "question_bank_created_by_profiles_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("user_id") ON DELETE no action ON UPDATE no action;