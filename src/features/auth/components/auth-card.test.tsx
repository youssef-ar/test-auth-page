import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AuthCard } from "./auth-card";

let cardHeight = 0;
const offsetHeight = vi.spyOn(HTMLElement.prototype, "offsetHeight", "get").mockImplementation(function (
  this: HTMLElement,
) {
  return this.tagName === "SECTION" ? cardHeight : 0;
});

afterEach(() => {
  offsetHeight.mockClear();
});

describe("AuthCard", () => {
  it("is a titled region with its subtitle", () => {
    cardHeight = 400;
    render(<AuthCard title="Mot de passe oublié ?" subtitle="Saisissez l’adresse courriel" />);
    expect(screen.getByRole("region", { name: "Mot de passe oublié ?" })).toBeInTheDocument();
    expect(screen.getByText("Saisissez l’adresse courriel")).toBeInTheDocument();
  });

  it("keeps the space of its first height, so growing never moves its top", () => {
    cardHeight = 576;
    const { container, rerender } = render(<AuthCard title="Connexion" />);
    const slot = container.firstElementChild as HTMLElement;
    expect(slot.style.height).toBe("576px");

    cardHeight = 673;
    rerender(
      <AuthCard title="Connexion">
        <p>Saisissez votre adresse courriel.</p>
      </AuthCard>,
    );
    expect(slot.style.height).toBe("576px");
  });
});
