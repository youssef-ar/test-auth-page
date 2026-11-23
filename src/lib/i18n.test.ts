// @vitest-environment node
import { describe, expect, it } from "vitest";
import { DEFAULT_LOCALE, isSupportedLocale, LOCALES } from "./i18n";

describe("i18n", () => {
  it("supports French (default) and English, read from intlayer.config.ts", () => {
    expect(LOCALES).toEqual(["fr", "en"]);
    expect(DEFAULT_LOCALE).toBe("fr");
  });

  it.each([
    ["fr", true],
    ["en", true],
    ["de", false],
    ["code", false],
    ["", false],
    [undefined, false],
    [null, false],
  ])("isSupportedLocale(%s) is %s", (value, expected) => {
    expect(isSupportedLocale(value)).toBe(expected);
  });
});
