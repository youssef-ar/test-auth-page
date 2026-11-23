import type { Locale } from "intlayer";
import { type Company, companiesResponseSchema } from "./schema";

export const companiesQueryKey = (locale: Locale) => ["companies", locale] as const;

export const fetchCompanies = async (locale: Locale, signal?: AbortSignal): Promise<Company[]> => {
  const response = await fetch(`/api/companies?locale=${encodeURIComponent(locale)}`, { signal });
  if (!response.ok) throw new Error(`GET /api/companies failed with status ${response.status}`);
  return companiesResponseSchema.parse(await response.json()).companies;
};
