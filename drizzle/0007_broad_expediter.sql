ALTER TABLE `orders` ADD `revenueVertical` enum('platform_membership','creator_subscription','paid_content','live_gifting','b2b_workspace') DEFAULT 'paid_content' NOT NULL;--> statement-breakpoint
ALTER TABLE `orders` ADD `merchantProcessingFee` decimal(12,2);--> statement-breakpoint
ALTER TABLE `orders` ADD `ecosystemNet` decimal(12,2);--> statement-breakpoint
ALTER TABLE `products` ADD `revenueVertical` enum('platform_membership','creator_subscription','paid_content','live_gifting','b2b_workspace') DEFAULT 'paid_content' NOT NULL;