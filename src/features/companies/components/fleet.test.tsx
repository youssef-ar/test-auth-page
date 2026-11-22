import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Company } from "../schema";
import { Fleet } from "./fleet";

vi.mock("next-intlayer", async () => (await import("@/test/intlayer-mock")).intlayerMock);

const query = vi.hoisted(() => ({ data: undefined as Company[] | undefined }));
vi.mock("../use-companies", () => ({ useCompanies: () => query }));

const company = (id: string): Company => ({
  id,
  name: id,
  description: `${id} description`,
  sectors: ["SOFTWARE"],
  status: "ACTIVE",
  brandColor: "#1E63C4",
});

beforeEach(() => {
  query.data = undefined;
});

describe("Fleet", () => {
  it("renders nothing until the server has sent the companies", () => {
    const { container } = render(<Fleet />);
    expect(container).toBeEmptyDOMElement();
  });

  it("fills the eight Figma slots with the server's companies, repeating them if needed", () => {
    query.data = ["medilink", "voltaria", "juristo"].map(company);
    const { container } = render(<Fleet />);

    expect(container.querySelectorAll("article")).toHaveLength(8);
    expect(screen.getAllByText("medilink", { selector: "h3" })).toHaveLength(3);
  });

  // `inert` keeps the decorative cards out of focus and the accessibility tree in browsers
  // (jsdom doesn't implement it, so only the attribute is checked here).
  it("is decorative: inert and not clickable", () => {
    query.data = [company("medilink")];
    const { container } = render(<Fleet />);
    const fleet = container.firstElementChild as HTMLElement;

    expect(fleet).toHaveAttribute("inert");
    expect(fleet).toHaveClass("pointer-events-none");
  });
});
