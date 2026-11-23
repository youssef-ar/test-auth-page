import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ResetPasswordEmail } from "./reset-password-email";

const text = {
  title: "Réinitialisez votre mot de passe",
  cta: "Choisir un nouveau mot de passe",
  body: "body",
  ignore: "ignore",
  copyLink: "Ou copiez ce lien dans votre navigateur :",
  footerBefore: "Ceci est un message automatique de",
  footerAfter: ". Merci de ne pas y répondre.",
};

describe("ResetPasswordEmail", () => {
  it("points both the button and the copyable link at the reset link", () => {
    const link = "http://localhost:3000/api/auth/reset-password/abc?callbackURL=%2Ffr%2Freset-password";
    render(<ResetPasswordEmail link={link} text={text} />);

    expect(screen.getByRole("heading", { name: text.title })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: text.cta })).toHaveAttribute("href", link);
    expect(screen.getByRole("link", { name: link })).toHaveAttribute("href", link);
  });
});
