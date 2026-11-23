import { type ClassValue, clsx } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      text: ["xxs", "xs", "xs-plus", "sx", "s", "sm", "ms", "m", "lm", "l", "xl", "xxl"],
      radius: ["xs", "s", "m", "l", "xl", "2xl", "3xl", "4xl"],
      spacing: ["xs", "s", "sm", "m", "l", "xl", "2xl", "3xl", "4xl"],
    },
  },
});

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));
