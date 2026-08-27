CREATE TABLE `accountBlocks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`blockerUserId` int NOT NULL,
	`blockedUserId` int NOT NULL,
	`reason` varchar(300),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `accountBlocks_id` PRIMARY KEY(`id`),
	CONSTRAINT `account_blocks_pair_unique` UNIQUE(`blockerUserId`,`blockedUserId`)
);
--> statement-breakpoint
CREATE TABLE `creatorFollows` (
	`id` int AUTO_INCREMENT NOT NULL,
	`fanId` int NOT NULL,
	`creatorId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `creatorFollows_id` PRIMARY KEY(`id`),
	CONSTRAINT `creator_follows_fan_creator_unique` UNIQUE(`fanId`,`creatorId`)
);
--> statement-breakpoint
ALTER TABLE `creatorProfiles` ADD `messagePolicy` enum('premium_members','creator_members','disabled') DEFAULT 'creator_members' NOT NULL;--> statement-breakpoint
ALTER TABLE `creatorProfiles` ADD `allowTips` boolean DEFAULT true NOT NULL;--> statement-breakpoint
CREATE INDEX `creator_follows_creator_created` ON `creatorFollows` (`creatorId`,`createdAt`);