// Stand-in for next-intlayer in tests: every entry renders as "<dictionary>.<path>",
// exposes the same string as `.value`, and insertion entries (`*Retry`) are callable.
const node = (path: string): unknown =>
  new Proxy(
    {},
    {
      get: (_, key) => {
        if (key === "value") return path;
        if (key === Symbol.iterator) return function* () { yield path; };
        if (key === Symbol.toPrimitive) return () => path;
        if (typeof key === "symbol") return undefined;
        const child = `${path}.${key}`;
        return key.endsWith("Retry") ? (values: Record<string, unknown>) => `${child}(${JSON.stringify(values)})` : node(child);
      },
    },
  );

export const intlayerMock = {
  useIntlayer: (dictionary: string) => node(dictionary),
  useLocale: () => ({ locale: "en" }),
};
