import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SignOutButton } from "./sign-out-button";

vi.mock("next-intlayer", async () => (await import("@/test/intlayer-mock")).intlayerMock);

const router = vi.hoisted(() => ({ replace: vi.fn(), refresh: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => router }));

const auth = vi.hoisted(() => ({ signOut: vi.fn() }));
vi.mock("@/lib/auth-client", () => ({ authClient: auth }));

const renderButton = () =>
  render(
    <QueryClientProvider client={new QueryClient()}>
      <SignOutButton />
    </QueryClientProvider>,
  );

beforeEach(() => vi.clearAllMocks());

describe("SignOutButton", () => {
  it("signs out and goes back to the sign-in page", async () => {
    auth.signOut.mockResolvedValue({ data: { success: true }, error: null });
    renderButton();

    await userEvent.click(screen.getByRole("button", { name: "dashboard.signOut" }));

    expect(auth.signOut).toHaveBeenCalled();
    await vi.waitFor(() => expect(router.replace).toHaveBeenCalledWith("/en/login"));
    expect(router.refresh).toHaveBeenCalled();
  });

  it("stays and explains when signing out fails", async () => {
    auth.signOut.mockResolvedValue({ data: null, error: { status: 500 } });
    renderButton();

    await userEvent.click(screen.getByRole("button", { name: "dashboard.signOut" }));

    expect(await screen.findByText("dashboard.signOutError")).toBeInTheDocument();
    expect(router.replace).not.toHaveBeenCalled();
  });
});
