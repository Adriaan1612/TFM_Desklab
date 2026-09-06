import { describe, expect, it } from "vitest";
import { placeholder } from "./index.js";

describe("shared placeholder", () => {
  it("returns ok", () => {
    expect(placeholder()).toBe("desklab-shared-ok");
  });
});
