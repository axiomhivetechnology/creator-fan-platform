CREATE TABLE `adPlacements` (
	`id` int AUTO_INCREMENT NOT NULL,
	`creatorId` int,
	`placement` varchar(80) NOT NULL,
	`label` varchar(180) NOT NULL,
	`sponsorName` varchar(180),
	`destinationUrl` text,
	`disclosureText` varchar(300) NOT NULL,
	`status` enum('draft','pending_review','approved','paused','rejected') NOT NULL DEFAULT 'draft',
	`targeting` json,
	`startsAt` timestamp,
	`endsAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `adPlacements_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `auditLogs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`actorId` int,
	`action` varchar(120) NOT NULL,
	`targetType` varchar(64) NOT NULL,
	`targetId` varchar(120),
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `auditLogs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `contentAssets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`creatorId` int NOT NULL,
	`postId` int,
	`storageKey` varchar(512) NOT NULL,
	`contentType` varchar(160) NOT NULL,
	`byteSize` int NOT NULL,
	`displayOrder` int NOT NULL DEFAULT 0,
	`moderationStatus` enum('pending','approved','rejected','removed') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `contentAssets_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `conversations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`fanId` int NOT NULL,
	`creatorId` int NOT NULL,
	`status` enum('open','archived','restricted') NOT NULL DEFAULT 'open',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `conversations_id` PRIMARY KEY(`id`),
	CONSTRAINT `conversations_fan_creator_unique` UNIQUE(`fanId`,`creatorId`)
);
--> statement-breakpoint
CREATE TABLE `creatorProfiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`handle` varchar(64) NOT NULL,
	`displayName` varchar(120) NOT NULL,
	`bio` text,
	`avatarUrl` text,
	`bannerUrl` text,
	`category` varchar(80),
	`isDiscoverable` boolean NOT NULL DEFAULT true,
	`approvalStatus` enum('draft','pending','approved','rejected','paused') NOT NULL DEFAULT 'draft',
	`payoutStatus` enum('not_started','pending','ready','restricted') NOT NULL DEFAULT 'not_started',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `creatorProfiles_id` PRIMARY KEY(`id`),
	CONSTRAINT `creator_profiles_user_id_unique` UNIQUE(`userId`),
	CONSTRAINT `creator_profiles_handle_unique` UNIQUE(`handle`)
);
--> statement-breakpoint
CREATE TABLE `entitlements` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`creatorId` int,
	`resourceType` enum('creator_membership','post','live_event','bundle') NOT NULL,
	`resourceId` int NOT NULL,
	`sourceType` enum('subscription','purchase','complimentary','admin') NOT NULL,
	`sourceId` int,
	`status` enum('active','grace','expired','revoked') NOT NULL DEFAULT 'active',
	`validFrom` timestamp NOT NULL DEFAULT (now()),
	`validUntil` timestamp,
	`revokedAt` timestamp,
	`revokeReason` varchar(300),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `entitlements_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `liveEvents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`creatorId` int NOT NULL,
	`title` varchar(180) NOT NULL,
	`description` text,
	`accessType` enum('public','members','ticketed','private') NOT NULL DEFAULT 'members',
	`productId` int,
	`scheduledStartAt` timestamp NOT NULL,
	`scheduledEndAt` timestamp,
	`status` enum('draft','scheduled','live','ended','canceled') NOT NULL DEFAULT 'draft',
	`providerStreamId` varchar(256),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `liveEvents_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `membershipTiers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`creatorId` int NOT NULL,
	`name` varchar(96) NOT NULL,
	`description` text,
	`monthlyPrice` decimal(12,2) NOT NULL,
	`annualPrice` decimal(12,2),
	`currency` varchar(3) NOT NULL DEFAULT 'USD',
	`isActive` boolean NOT NULL DEFAULT true,
	`sortOrder` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `membershipTiers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`conversationId` int NOT NULL,
	`senderId` int NOT NULL,
	`body` text,
	`status` enum('sent','removed','reported') NOT NULL DEFAULT 'sent',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `moderationActions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`reportId` int,
	`actorId` int NOT NULL,
	`subjectType` varchar(64) NOT NULL,
	`subjectId` int NOT NULL,
	`action` enum('note','remove','restrict','suspend','restore','dismiss') NOT NULL,
	`rationale` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `moderationActions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`buyerId` int NOT NULL,
	`creatorId` int NOT NULL,
	`productId` int NOT NULL,
	`status` enum('created','pending','paid','refunded','disputed','failed','canceled') NOT NULL DEFAULT 'created',
	`subtotal` decimal(12,2) NOT NULL,
	`platformFee` decimal(12,2) NOT NULL DEFAULT '0.00',
	`total` decimal(12,2) NOT NULL,
	`currency` varchar(3) NOT NULL DEFAULT 'USD',
	`provider` varchar(48),
	`providerCheckoutId` varchar(256),
	`providerPaymentId` varchar(256),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `orders_id` PRIMARY KEY(`id`),
	CONSTRAINT `orders_provider_checkout_unique` UNIQUE(`providerCheckoutId`)
);
--> statement-breakpoint
CREATE TABLE `posts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`creatorId` int NOT NULL,
	`title` varchar(180),
	`body` text,
	`accessType` enum('public','members','ppv','private') NOT NULL DEFAULT 'members',
	`membershipTierId` int,
	`ppvPrice` decimal(12,2),
	`currency` varchar(3) NOT NULL DEFAULT 'USD',
	`publicationStatus` enum('draft','scheduled','published','archived','removed') NOT NULL DEFAULT 'draft',
	`publishedAt` timestamp,
	`scheduledFor` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `posts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` int AUTO_INCREMENT NOT NULL,
	`creatorId` int NOT NULL,
	`postId` int,
	`liveEventId` int,
	`membershipTierId` int,
	`productType` enum('subscription','post','bundle','live_event') NOT NULL,
	`title` varchar(180) NOT NULL,
	`description` text,
	`price` decimal(12,2) NOT NULL,
	`currency` varchar(3) NOT NULL DEFAULT 'USD',
	`status` enum('draft','active','paused','archived') NOT NULL DEFAULT 'draft',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `products_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `reports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`reporterId` int,
	`subjectType` enum('profile','post','asset','message','live_event','ad') NOT NULL,
	`subjectId` int NOT NULL,
	`reason` varchar(120) NOT NULL,
	`detail` text,
	`status` enum('open','under_review','actioned','dismissed') NOT NULL DEFAULT 'open',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`resolvedAt` timestamp,
	CONSTRAINT `reports_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `subscriptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`fanId` int NOT NULL,
	`creatorId` int NOT NULL,
	`membershipTierId` int NOT NULL,
	`provider` varchar(48),
	`providerSubscriptionId` varchar(256),
	`status` enum('pending','active','grace','canceled','expired','paused') NOT NULL DEFAULT 'pending',
	`currentPeriodStart` timestamp,
	`currentPeriodEnd` timestamp,
	`cancelAtPeriodEnd` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `subscriptions_id` PRIMARY KEY(`id`),
	CONSTRAINT `subscriptions_provider_unique` UNIQUE(`providerSubscriptionId`)
);
--> statement-breakpoint
CREATE TABLE `tips` (
	`id` int AUTO_INCREMENT NOT NULL,
	`fanId` int NOT NULL,
	`creatorId` int NOT NULL,
	`postId` int,
	`liveEventId` int,
	`amount` decimal(12,2) NOT NULL,
	`currency` varchar(3) NOT NULL DEFAULT 'USD',
	`message` varchar(500),
	`status` enum('pending','paid','refunded','failed') NOT NULL DEFAULT 'pending',
	`providerPaymentId` varchar(256),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `tips_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('fan','creator','moderator','finance','admin') NOT NULL DEFAULT 'fan';--> statement-breakpoint
ALTER TABLE `users` ADD `accountStatus` enum('active','pending_review','suspended','closed') DEFAULT 'active' NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `ageAcknowledgedAt` timestamp;--> statement-breakpoint
ALTER TABLE `users` ADD `marketingConsentAt` timestamp;--> statement-breakpoint
CREATE INDEX `ad_placements_status_window` ON `adPlacements` (`status`,`startsAt`,`endsAt`);--> statement-breakpoint
CREATE INDEX `audit_logs_target_created` ON `auditLogs` (`targetType`,`targetId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `content_assets_post_order` ON `contentAssets` (`postId`,`displayOrder`);--> statement-breakpoint
CREATE INDEX `entitlements_user_resource_status` ON `entitlements` (`userId`,`resourceType`,`resourceId`,`status`);--> statement-breakpoint
CREATE INDEX `live_events_creator_start` ON `liveEvents` (`creatorId`,`scheduledStartAt`);--> statement-breakpoint
CREATE INDEX `membership_tiers_creator_active` ON `membershipTiers` (`creatorId`,`isActive`);--> statement-breakpoint
CREATE INDEX `messages_conversation_created` ON `messages` (`conversationId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `moderation_actions_subject_created` ON `moderationActions` (`subjectType`,`subjectId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `orders_buyer_created` ON `orders` (`buyerId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `orders_creator_created` ON `orders` (`creatorId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `posts_creator_published` ON `posts` (`creatorId`,`publicationStatus`,`publishedAt`);--> statement-breakpoint
CREATE INDEX `products_creator_status` ON `products` (`creatorId`,`status`);--> statement-breakpoint
CREATE INDEX `reports_status_created` ON `reports` (`status`,`createdAt`);--> statement-breakpoint
CREATE INDEX `subscriptions_fan_status` ON `subscriptions` (`fanId`,`status`);--> statement-breakpoint
CREATE INDEX `subscriptions_creator_status` ON `subscriptions` (`creatorId`,`status`);--> statement-breakpoint
CREATE INDEX `tips_creator_created` ON `tips` (`creatorId`,`createdAt`);