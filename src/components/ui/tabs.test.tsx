import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it } from "vitest";
import { Tabs } from "./tabs";

const Harness = () => {
  const [value, setValue] = useState<"a" | "b">("a");
  return (
    <Tabs
      label="Auth"
      value={value}
      onValueChange={setValue}
      items={[
        { value: "a", label: "Sign in", panel: <p>Panel A</p> },
        { value: "b", label: "Sign up", panel: <p>Panel B</p> },
      ]}
    />
  );
};

describe("Tabs", () => {
  it("shows only the selected panel and switches on click", async () => {
    render(<Harness />);
    expect(screen.getByRole("tab", { name: "Sign in" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByText("Panel A")).toBeVisible();
    expect(screen.getByText("Panel B")).not.toBeVisible();

    await userEvent.click(screen.getByRole("tab", { name: "Sign up" }));

    expect(screen.getByRole("tab", { name: "Sign up" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tabpanel")).toHaveTextContent("Panel B");
  });

  it("moves selection and focus with the arrow keys", async () => {
    render(<Harness />);
    await userEvent.tab();
    expect(screen.getByRole("tab", { name: "Sign in" })).toHaveFocus();

    await userEvent.keyboard("{ArrowRight}");
    expect(screen.getByRole("tab", { name: "Sign up" })).toHaveFocus();
    expect(screen.getByRole("tab", { name: "Sign up" })).toHaveAttribute("aria-selected", "true");

    await userEvent.keyboard("{ArrowRight}");
    expect(screen.getByRole("tab", { name: "Sign in" })).toHaveAttribute("aria-selected", "true");
  });
});
