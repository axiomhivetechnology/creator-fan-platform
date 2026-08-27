import { describe, expect, it } from "vitest";
import { getStripePriceData } from "./stripeProducts";

describe("Stripe price mapping", () => {
  it("creates recurring monthly price data for subscriptions", () => {
    const result = getStripePriceData({
      title: "Creator membership",
      description: "Monthly access",
      price: "9.00",
      currency: "USD",
      productType: "subscription",
    });

    expect(result).toMatchObject({
      currency: "usd",
      unit_amount: 900,
      recurring: { interval: "month" },
      product_data: { name: "Creator membership" },
    });
  });

  it("creates a one-time price data object for PPV products", () => {
    const result = getStripePriceData({
      title: "Locked post",
      description: null,
      price: "4.50",
      currency: "USD",
      productType: "post",
    });

    expect(result).toMatchObject({ currency: "usd", unit_amount: 450, product_data: { name: "Locked post" } });
    expect("recurring" in result).toBe(false);
  });

  it("rejects values below the checkout minimum", () => {
    expect(() =>
      getStripePriceData({
        title: "Invalid price",
        description: null,
        price: "0.49",
        currency: "USD",
        productType: "post",
      }),
    ).toThrow("valid checkout amount");
  });
});
