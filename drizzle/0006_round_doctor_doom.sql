CREATE TABLE `siteNotifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(120) NOT NULL,
	`body` text NOT NULL,
	`severity` enum('info','success','warning','urgent') NOT NULL DEFAULT 'info',
	`audience` enum('everyone','fans','creators','staff','admins') NOT NULL DEFAULT 'everyone',
	`isActive` boolean NOT NULL DEFAULT true,
	`startsAt` timestamp,
	`endsAt` timestamp,
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `siteNotifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `site_notifications_active_window` ON `siteNotifications` (`isActive`,`startsAt`,`endsAt`,`createdAt`);