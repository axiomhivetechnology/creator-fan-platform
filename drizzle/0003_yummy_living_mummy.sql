CREATE TABLE `creatorApplications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`displayName` varchar(120) NOT NULL,
	`proposedHandle` varchar(64) NOT NULL,
	`category` varchar(80),
	`applicationNote` text,
	`agreementVersion` varchar(48) NOT NULL,
	`agreementAcceptedAt` timestamp,
	`eligibilityStatus` enum('not_started','pending','verified','failed','expired') NOT NULL DEFAULT 'not_started',
	`payoutReadiness` enum('not_started','pending','ready','restricted') NOT NULL DEFAULT 'not_started',
	`status` enum('draft','submitted','needs_info','approved','rejected','restricted') NOT NULL DEFAULT 'draft',
	`reviewNote` text,
	`reviewedBy` int,
	`submittedAt` timestamp,
	`reviewedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `creatorApplications_id` PRIMARY KEY(`id`),
	CONSTRAINT `creator_applications_user_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE INDEX `creator_applications_status_created` ON `creatorApplications` (`status`,`createdAt`);