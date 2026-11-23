import { z } from "zod";
import { CompanyStatus } from "@/components/company/company-status";
import { SECTORS } from "@/components/sectors/sectors";


export const companySchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  sectors: z.array(z.enum(SECTORS)),
  status: z.enum(CompanyStatus),
  brandColor: z.string().regex(/^#[0-9a-f]{6}$/i),
});

export const companiesResponseSchema = z.object({
  companies: z.array(companySchema),
});

export type Company = z.infer<typeof companySchema>;
export type CompaniesResponse = z.infer<typeof companiesResponseSchema>;
