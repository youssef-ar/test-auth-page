"use client";

import { useQuery } from "@tanstack/react-query";
import { useLocale } from "next-intlayer";
import { companiesQueryKey, fetchCompanies } from "./api";

export const useCompanies = () => {
  const { locale } = useLocale();

  return useQuery({
    queryKey: companiesQueryKey(locale),
    queryFn: ({ signal }) => fetchCompanies(locale, signal),
    staleTime: Infinity,
  });
};
