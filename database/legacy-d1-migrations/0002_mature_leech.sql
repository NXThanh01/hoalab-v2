CREATE TABLE `exam_folders` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`grade_level` integer NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`color` text DEFAULT 'indigo' NOT NULL,
	`created_by` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`created_by`) REFERENCES `profiles`(`user_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
ALTER TABLE `exams` ADD `folder_id` text REFERENCES exam_folders(id);--> statement-breakpoint
ALTER TABLE `exams` ADD `kind` text DEFAULT 'exam' NOT NULL;