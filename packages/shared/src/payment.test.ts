import { describe, expect, it } from "vitest";
import {
  cvcValid,
  detectBrand,
  expiryValid,
  last4Of,
  luhnValid,
} from "./payment.js";

describe("payment helpers", () => {
  it("validates Luhn numbers", () => {
    expect(luhnValid("4242 4242 4242 4242")).toBe(true);
    expect(luhnValid("4242424242424241")).toBe(false);
    expect(luhnValid("123")).toBe(false);
  });

  it("detects brands", () => {
    expect(detectBrand("4242424242424242")).toBe("visa");
    expect(detectBrand("5555555555554444")).toBe("mastercard");
    expect(detectBrand("378282246310005")).toBe("amex");
    expect(detectBrand("6011111111111117")).toBe("unknown");
  });

  it("validates expiry against current date", () => {
    expect(expiryValid("01", "2000")).toBe(false);
    expect(expiryValid("13", "30")).toBe(false);
    expect(expiryValid("12", "99")).toBe(true);
  });

  it("validates CVC per brand and extracts last4", () => {
    expect(cvcValid("123", "visa")).toBe(true);
    expect(cvcValid("12", "visa")).toBe(false);
    expect(cvcValid("1234", "amex")).toBe(true);
    expect(cvcValid("123", "amex")).toBe(false);
    expect(last4Of("4242 4242 4242 0002")).toBe("0002");
  });
});
