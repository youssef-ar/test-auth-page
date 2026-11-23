export const TWO_FACTOR_METHODS = ["totp", "otp"] as const;
export type TwoFactorMethod = (typeof TWO_FACTOR_METHODS)[number];

const isTwoFactorMethod = (value: unknown): value is TwoFactorMethod =>
  TWO_FACTOR_METHODS.includes(value as TwoFactorMethod);

export const readTwoFactorMethods = (data: unknown): TwoFactorMethod[] | null => {
  if (!data || typeof data !== "object" || !("twoFactorRedirect" in data) || !data.twoFactorRedirect) return null;
  const methods = "twoFactorMethods" in data && Array.isArray(data.twoFactorMethods) ? data.twoFactorMethods : [];
  return methods.filter(isTwoFactorMethod);
};
