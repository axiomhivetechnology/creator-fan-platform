CREATE TABLE `siteSettings` (
	`id` int NOT NULL,
	`brandName` varchar(120) NOT NULL,
	`attributionLine` varchar(180) NOT NULL,
	`heroEyebrow` varchar(120) NOT NULL,
	`heroTitle` varchar(160) NOT NULL,
	`heroAccent` varchar(80) NOT NULL,
	`heroCopy` text NOT NULL,
	`membershipLabel` varchar(120) NOT NULL,
	`showEarlyCircle` boolean NOT NULL DEFAULT true,
	`showSafetyPanel` boolean NOT NULL DEFAULT true,
	`updatedBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `siteSettings_id` PRIMARY KEY(`id`)
);
