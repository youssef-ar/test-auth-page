import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchCompanies } from "./api";
import type { Company } from "./schema";

const company: Company = {
  id: "acme",
  name: "Acme",
  description: "Description",
  sectors: ["SOFTWARE"],
  status: "ACTIVE",
  brandColor: "#123456",
};

const mockFetch = (body: unknown, status = 200) =>
  vi.spyOn(globalThis, "fetch").mockResolvedValue(Response.json(body, { status }));

afterEach(() => vi.restoreAllMocks());

describe("fetchCompanies", () => {
  it("requests the given locale and returns the companies", async () => {
    const fetchSpy = mockFetch({ companies: [company] });

    await expect(fetchCompanies("en")).resolves.toEqual([company]);
    expect(fetchSpy).toHaveBeenCalledWith("/api/companies?locale=en", expect.anything());
  });

  it("throws on an error status", async () => {
    mockFetch({ error: { status: 500 } }, 500);
    await expect(fetchCompanies("fr")).rejects.toThrow("status 500");
  });

  it("throws when the response does not match the contract", async () => {
    mockFetch({ companies: [{ ...company, sectors: ["NOT_A_SECTOR"] }] });
    await expect(fetchCompanies("fr")).rejects.toThrow();
  });
});
