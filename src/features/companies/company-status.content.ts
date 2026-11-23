import { type Dictionary, t } from "intlayer";

const companyStatusContent = {
  key: "company-status",
  content: {
    closed: t({ fr: "Fermée", en: "Closed" }),
    sold: t({ fr: "Vendue", en: "Sold" }),
  },
} satisfies Dictionary;

export default companyStatusContent;
