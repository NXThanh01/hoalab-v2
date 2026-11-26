CREATE TABLE `activity_log` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`actor_id` text NOT NULL,
	`action` text NOT NULL,
	`entity_type` text NOT NULL,
	`entity_id` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`actor_id`) REFERENCES `profiles`(`user_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `exam_attempts` (
	`id` text PRIMARY KEY NOT NULL,
	`exam_id` text NOT NULL,
	`user_id` text NOT NULL,
	`score` real,
	`status` text DEFAULT 'in_progress' NOT NULL,
	`answers_json` text DEFAULT '{}' NOT NULL,
	`started_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`submitted_at` text,
	FOREIGN KEY (`exam_id`) REFERENCES `exams`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `profiles`(`user_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `exam_questions` (
	`exam_id` text NOT NULL,
	`question_id` text NOT NULL,
	`position` integer DEFAULT 0 NOT NULL,
	`points` real DEFAULT 1 NOT NULL,
	PRIMARY KEY(`exam_id`, `question_id`),
	FOREIGN KEY (`exam_id`) REFERENCES `exams`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`question_id`) REFERENCES `question_bank`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `exams` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`grade_level` integer NOT NULL,
	`duration_minutes` integer DEFAULT 45 NOT NULL,
	`pass_score` real DEFAULT 8 NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`starts_at` text,
	`ends_at` text,
	`created_by` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`created_by`) REFERENCES `profiles`(`user_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `learning_progress` (
	`user_id` text NOT NULL,
	`lesson_id` integer NOT NULL,
	`status` text DEFAULT 'not_started' NOT NULL,
	`best_score` real DEFAULT 0 NOT NULL,
	`video_second` real DEFAULT 0 NOT NULL,
	`checkpoints_json` text DEFAULT '[]' NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	PRIMARY KEY(`user_id`, `lesson_id`),
	FOREIGN KEY (`user_id`) REFERENCES `profiles`(`user_id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `profiles` (
	`user_id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`full_name` text,
	`role` text DEFAULT 'student' NOT NULL,
	`grade_level` integer DEFAULT 11 NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `question_bank` (
	`id` text PRIMARY KEY NOT NULL,
	`type` text NOT NULL,
	`subject` text NOT NULL,
	`grade_level` integer NOT NULL,
	`prompt` text NOT NULL,
	`options_json` text DEFAULT '[]' NOT NULL,
	`correct_answer` text DEFAULT '' NOT NULL,
	`explanation` text DEFAULT '' NOT NULL,
	`difficulty` text DEFAULT 'medium' NOT NULL,
	`points` real DEFAULT 1 NOT NULL,
	`created_by` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`created_by`) REFERENCES `profiles`(`user_id`) ON UPDATE no action ON DELETE no action
);
