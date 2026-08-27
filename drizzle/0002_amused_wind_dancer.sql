CREATE TABLE `platformAccessPlans` (
	`id` int AUTO_INCREMENT NOT NULL,
	`code` varchar(48) NOT NULL,
	`name` varchar(120) NOT NULL,
	`description` text,
	`monthlyPrice` decimal(12,2),
	`annualPrice` decimal(12,2),
	`currency` varchar(3) NOT NULL DEFAULT 'USD',
	`status` enum('draft','active','archived') NOT NULL DEFAULT 'draft',
	`providerProductId` varchar(256),
	`providerMonthlyPriceId` varchar(256),
	`providerAnnualPriceId` varchar(256),
	`policyVersion` varchar(48) NOT NULL,
	`sortOrder` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `platformAccessPlans_id` PRIMARY KEY(`id`),
	CONSTRAINT `platform_access_plans_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `platformSubscriptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`planId` int NOT NULL,
	`provider` varchar(48),
	`providerCustomerId` varchar(256),
	`providerSubscriptionId` varchar(256),
	`status` enum('pending','active','grace','canceled','expired','revoked') NOT NULL DEFAULT 'pending',
	`currentPeriodStart` timestamp,
	`currentPeriodEnd` timestamp,
	`cancelAtPeriodEnd` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `platformSubscriptions_id` PRIMARY KEY(`id`),
	CONSTRAINT `platform_subscriptions_provider_unique` UNIQUE(`providerSubscriptionId`)
);
--> statement-breakpoint
ALTER TABLE `entitlements` MODIFY COLUMN `resourceType` enum('premium_access','creator_membership','post','live_event','bundle') NOT NULL;--> statement-breakpoint
CREATE INDEX `platform_access_plans_status_sort` ON `platformAccessPlans` (`status`,`sortOrder`);--> statement-breakpoint
CREATE INDEX `platform_subscriptions_user_status` ON `platformSubscriptions` (`userId`,`status`);