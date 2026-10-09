CREATE TABLE `engineeringWorkspaceMembers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`workspaceId` int NOT NULL,
	`userId` int NOT NULL,
	`role` enum('owner','engineer','creator','viewer') NOT NULL,
	`status` enum('invited','active','suspended','removed') NOT NULL DEFAULT 'invited',
	`mfaVerifiedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `engineeringWorkspaceMembers_id` PRIMARY KEY(`id`),
	CONSTRAINT `engineering_workspace_members_unique` UNIQUE(`workspaceId`,`userId`)
);
--> statement-breakpoint
CREATE TABLE `engineeringWorkspaces` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ownerId` int NOT NULL,
	`slug` varchar(96) NOT NULL,
	`name` varchar(160) NOT NULL,
	`description` text,
	`status` enum('draft','active','archived') NOT NULL DEFAULT 'draft',
	`requiresMfa` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `engineeringWorkspaces_id` PRIMARY KEY(`id`),
	CONSTRAINT `engineering_workspaces_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `tokenAccounts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`balance` int NOT NULL DEFAULT 0,
	`status` enum('active','frozen','closed') NOT NULL DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `tokenAccounts_id` PRIMARY KEY(`id`),
	CONSTRAINT `token_accounts_user_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `tokenLedgerEntries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`accountId` int NOT NULL,
	`userId` int NOT NULL,
	`creatorId` int,
	`liveEventId` int,
	`direction` enum('credit','debit','reversal') NOT NULL,
	`amount` int NOT NULL,
	`referenceType` varchar(64) NOT NULL,
	`referenceId` varchar(128) NOT NULL,
	`idempotencyKey` varchar(128) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `tokenLedgerEntries_id` PRIMARY KEY(`id`),
	CONSTRAINT `token_ledger_idempotency_unique` UNIQUE(`idempotencyKey`)
);
--> statement-breakpoint
CREATE INDEX `engineering_workspace_members_user_status` ON `engineeringWorkspaceMembers` (`userId`,`status`);--> statement-breakpoint
CREATE INDEX `engineering_workspaces_owner_status` ON `engineeringWorkspaces` (`ownerId`,`status`);--> statement-breakpoint
CREATE INDEX `token_ledger_account_created` ON `tokenLedgerEntries` (`accountId`,`createdAt`);