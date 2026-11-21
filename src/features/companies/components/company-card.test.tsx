import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { Company } from "../schema";
import { CompanyCard } from "./company-card";
import { StatusBadge } from "./status-badge";

// Stand-in for the Intlayer dictionaries: every label is "<dictionary>.<key>".
vi.mock("next-intlayer", () => ({
  useIntlayer: (dictionary: string) => new Proxy({}, { get: (_, key) => ({ value: `${dictionary}.${String(key)}` }) }),
}));

const company: Company = {
  id: "medilink",
  name: "Medilink",
  description: "Plateforme numérique de prise de rendez-vous",
  sectors: ["HEALTHCARE", "SOFTWARE"],
  status: "CLOSED",
  brandColor: "#1E63C4",
};

describe("StatusBadge", () => {
  it.each([
    ["CLOSED", "company-status.closed"],
    ["INACTIVE", "company-status.closed"],
    ["ACQUIRED", "company-status.sold"],
  ] as const)("shows the right badge for %s", (status, label) => {
    render(<StatusBadge status={status} />);
    expect(screen.getByText(label)).toBeInTheDocument();
  });

  it("shows no badge for an active company", () => {
    const { container } = render(<StatusBadge status="ACTIVE" />);
    expect(container).toBeEmptyDOMElement();
  });
});

describe("CompanyCard", () => {
  it("renders the server content with translated sector labels", () => {
    render(<CompanyCard company={company} />);

    expect(screen.getByRole("heading", { name: "Medilink" })).toBeInTheDocument();
    expect(screen.getByText(company.description)).toBeInTheDocument();
    expect(screen.getByText("sectors.HEALTHCARE")).toBeInTheDocument();
    expect(screen.getByText("sectors.SOFTWARE")).toBeInTheDocument();
    expect(screen.getByText("company-status.closed")).toBeInTheDocument();
  });
});
