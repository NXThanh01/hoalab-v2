CREATE TABLE `lesson_contents` (
	`id` text PRIMARY KEY NOT NULL,
	`grade_level` integer NOT NULL,
	`textbook_series` text DEFAULT 'Kết nối tri thức' NOT NULL,
	`chapter_id` text NOT NULL,
	`lesson_number` integer NOT NULL,
	`title` text NOT NULL,
	`video_url` text DEFAULT '' NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`checkpoints_json` text DEFAULT '[]' NOT NULL,
	`created_by` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`created_by`) REFERENCES `profiles`(`user_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
