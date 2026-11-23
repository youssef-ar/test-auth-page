import { describe, expect, it } from "vitest";
import { cn } from "./utils";

describe("cn", () => {
  it("keeps a Stolos text size next to a text colour", () => {
    expect(cn("text-sx text-primary-200")).toBe("text-sx text-primary-200");
    expect(cn("text-l", "text-white")).toBe("text-l text-white");
  });

  it("still resolves conflicts between Stolos tokens", () => {
    expect(cn("text-sx", "text-lm")).toBe("text-lm");
    expect(cn("rounded-s", "rounded-m")).toBe("rounded-m");
    expect(cn("gap-s", "gap-xl")).toBe("gap-xl");
  });
});
