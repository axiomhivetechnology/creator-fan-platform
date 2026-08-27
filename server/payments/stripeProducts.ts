import type { Product } from "../../drizzle/schema";

export function getStripePriceData(product: Pick<Product, "title" | "description" | "price" | "currency" | "productType">) {
  const unitAmount = Math.round(Number(product.price) * 100);
  if (!Number.isSafeInteger(unitAmount) || unitAmount < 50) {
    throw new Error("This product is not configured with a valid checkout amount.");
  }

  const priceData = {
    currency: product.currency.toLowerCase(),
    unit_amount: unitAmount,
    product_data: {
      name: product.title,
      ...(product.description ? { description: product.description.slice(0, 500) } : {}),
    },
  };

  if (product.productType === "subscription") {
    return { ...priceData, recurring: { interval: "month" as const } };
  }

  return priceData;
}
