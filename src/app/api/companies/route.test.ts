// @vitest-environment node
import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";
import { SECTORS } from "@/components/sectors/sectors";
import { companiesResponseSchema } from "@/features/companies/schema";
import { GET } from "./route";

const get = (query = "") => GET(new NextRequest(`http://localhost/api/companies${query}`));

describe("GET /api/companies", () => {
  it("returns companies matching the shared contract", async () => {
    const response = await get("?locale=fr");

    expect(response.status).toBe(200);
    const { companies } = companiesResponseSchema.parse(await response.json());
    expect(companies.length).toBeGreaterThanOrEqual(8);
    expect(new Set(companies.map((company) => company.id)).size).toBe(companies.length);
    for (const company of companies) {
      expect(company.sectors.length).toBeGreaterThan(0);
      expect(company.sectors.every((sector) => SECTORS.includes(sector))).toBe(true);
    }
  });

  it("translates descriptions but keeps names, sectors and statuses", async () => {
    const fr = companiesResponseSchema.parse(await (await get("?locale=fr")).json()).companies;
    const en = companiesResponseSchema.parse(await (await get("?locale=en")).json()).companies;

    expect(en).toHaveLength(fr.length);
    en.forEach((company, index) => {
      expect(company).toMatchObject({
        id: fr[index].id,
        name: fr[index].name,
        sectors: fr[index].sectors,
        status: fr[index].status,
      });
      expect(company.description).not.toBe(fr[index].description);
    });
  });

  it("defaults to French without a locale", async () => {
    const defaulted = await (await get()).json();
    const fr = await (await get("?locale=fr")).json();
    expect(defaulted).toEqual(fr);
  });

  it("rejects an unsupported locale with a 400 error body", async () => {
    const response = await get("?locale=de");

    expect(response.status).toBe(400);
    expect(await response.json()).toMatchObject({ error: { status: 400, code: "UNSUPPORTED_LOCALE" } });
  });
});
