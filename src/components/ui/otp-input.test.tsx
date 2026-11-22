import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { OtpInput } from "./otp-input";

const setup = () => {
  const onComplete = vi.fn();
  render(<OtpInput label="Code" digitLabel={(position) => `Digit ${position}`} onComplete={onComplete} />);
  const boxes = Array.from({ length: 6 }, (_, index) => screen.getByLabelText(`Digit ${index + 1}`));
  return { onComplete, boxes };
};

const values = (boxes: HTMLElement[]) => boxes.map((box) => (box as HTMLInputElement).value).join("");

describe("OtpInput", () => {
  it.each([0, 2, 5])("spreads a pasted code over the six boxes when pasted into box %i", async (index) => {
    const { onComplete, boxes } = setup();
    await userEvent.click(boxes[index]);
    await userEvent.paste("123456");

    expect(values(boxes)).toBe("123456");
    expect(onComplete).toHaveBeenCalledExactlyOnceWith("123456");
  });

  it("keeps only digits from a pasted code", async () => {
    const { onComplete, boxes } = setup();
    await userEvent.click(boxes[3]);
    await userEvent.paste(" 123-456 ");

    expect(onComplete).toHaveBeenCalledWith("123456");
  });

  it("moves to the next box while typing and submits on the sixth digit", async () => {
    const { onComplete, boxes } = setup();
    await userEvent.click(boxes[0]);
    await userEvent.keyboard("12345");

    expect(boxes[5]).toHaveFocus();
    expect(onComplete).not.toHaveBeenCalled();

    await userEvent.keyboard("6");
    expect(onComplete).toHaveBeenCalledExactlyOnceWith("123456");
  });

  it("ignores letters", async () => {
    const { boxes } = setup();
    await userEvent.click(boxes[0]);
    await userEvent.keyboard("a");

    expect(values(boxes)).toBe("");
    expect(boxes[0]).toHaveFocus();
  });

  it("replaces the digit of a filled box", async () => {
    const { boxes } = setup();
    await userEvent.click(boxes[0]);
    await userEvent.keyboard("12");
    await userEvent.click(boxes[0]);
    await userEvent.keyboard("9");

    expect(values(boxes)).toBe("92");
    expect(boxes[1]).toHaveFocus();
  });

  it("goes back and clears with Backspace", async () => {
    const { boxes } = setup();
    await userEvent.click(boxes[0]);
    await userEvent.keyboard("123");
    await userEvent.keyboard("{Backspace}");

    expect(values(boxes)).toBe("12");
    expect(boxes[2]).toHaveFocus();

    await userEvent.keyboard("{Backspace}");
    expect(values(boxes)).toBe("1");
    expect(boxes[1]).toHaveFocus();
  });

  it("moves with the arrow keys", async () => {
    const { boxes } = setup();
    await userEvent.click(boxes[2]);
    await userEvent.keyboard("{ArrowLeft}");
    expect(boxes[1]).toHaveFocus();
    await userEvent.keyboard("{ArrowRight}{ArrowRight}");
    expect(boxes[3]).toHaveFocus();
  });
});
