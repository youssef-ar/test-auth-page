import type { NextRequest } from "next/server";
import type { CompaniesResponse } from "@/features/companies/schema";
import { DEFAULT_LOCALE, isSupportedLocale } from "@/lib/i18n";
import { getCompanies } from "@/server/companies";

/**
 * GET /api/companies?locale=fr|en
 * Content of the company cards: name, translated description, sectors and status.
 * Sector and status *labels* are translated by the client from the codes returned here.
 */
export async function GET(request: NextRequest) {
  const requested = request.nextUrl.searchParams.get("locale");

  if (requested !== null && !isSupportedLocale(requested)) {
    return Response.json(
      { error: { status: 400, code: "UNSUPPORTED_LOCALE", message: `Unsupported locale: ${requested}` } },
      { status: 400 },
    );
  }

  const locale = requested ?? DEFAULT_LOCALE;
  return Response.json({ companies: getCompanies(locale) } satisfies CompaniesResponse);
}
