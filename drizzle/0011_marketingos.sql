CREATE TABLE `marketing_goals` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`metric` text,
	`target_value` real DEFAULT 0,
	`current_value` real DEFAULT 0,
	`period` text,
	`start_date` text,
	`end_date` text,
	`status` text DEFAULT 'ON_TRACK' NOT NULL,
	`created_at` text DEFAULT 'datetime(''now'')' NOT NULL,
	`updated_at` text DEFAULT 'datetime(''now'')' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `marketing_plans` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`name` text NOT NULL,
	`objective` text,
	`target` text,
	`period` text,
	`strategy` text,
	`channels` text,
	`kpi` text,
	`status` text DEFAULT 'ACTIVE' NOT NULL,
	`goal_id` text,
	`created_at` text DEFAULT 'datetime(''now'')' NOT NULL,
	`updated_at` text DEFAULT 'datetime(''now'')' NOT NULL,
	FOREIGN KEY (`goal_id`) REFERENCES `marketing_goals`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `marketing_tasks` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`status` text DEFAULT 'TODO' NOT NULL,
	`priority` text DEFAULT 'MEDIUM' NOT NULL,
	`due_date` text,
	`start_date` text,
	`goal_id` text,
	`plan_id` text,
	`campaign_id` text,
	`lead_id` text,
	`assigned_to` text,
	`recurring` text,
	`notes` text,
	`created_at` text DEFAULT 'datetime(''now'')' NOT NULL,
	`updated_at` text DEFAULT 'datetime(''now'')' NOT NULL,
	FOREIGN KEY (`goal_id`) REFERENCES `marketing_goals`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`plan_id`) REFERENCES `marketing_plans`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `marketing_journal` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`date` text NOT NULL,
	`target` text,
	`activities` text,
	`result` text,
	`problems` text,
	`learning` text,
	`next_action` text,
	`created_at` text DEFAULT 'datetime(''now'')' NOT NULL
);